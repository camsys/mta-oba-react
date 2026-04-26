import {OBA} from "../oba";
import {LatLngLiteral} from "leaflet";
import log from 'loglevel';
import {SiriMonitoredCall, SiriMonitoredVehicleJourney, SiriPtSituationElement, SearchStopData, SearchRouteDirectionData, SearchGeoData, SearchRouteData} from "./DataContracts";

export const primaryDelimiter = "_";

export class AgencyAndId {
    private static cache = new Map<string, AgencyAndId>();
    public readonly agency: string;
    public readonly id: string;

    private constructor(agency: string, id: string) {
        this.agency = agency;
        this.id = id;
    }

    static get(datum: string | AgencyAndId): AgencyAndId {
        if (typeof datum === "string") {
            if (!this.cache.has(datum)) {
                let parts = datum.split(primaryDelimiter);
                this.cache.set(datum, new AgencyAndId(parts[0], parts.slice(1).join("")));
            }
            return this.cache.get(datum)!;
        } else {
            return datum;
        }
    }

    toString(): string {
        return `${this.agency}${primaryDelimiter}${this.id}`;
    }
}

export interface FavoritesCookie{
    favorites : (StopInterface | RouteInterface)[]
}


export interface ObaDatumInterface {
    datumId: AgencyAndId;
    datumName: string;
}


export interface StopInterface extends ObaDatumInterface{
    /** @deprecated Use datumName instead */
    name: string;
    longLat: [number, number];
    /** @deprecated Use datumId instead */
    id: AgencyAndId;
    stopDirection: string;
}


export interface RouteInterface extends ObaDatumInterface{
    color: string;
    /** @deprecated Use datumId instead */
    routeId: AgencyAndId;
    /** @deprecated Use datumName instead */
    routeTitle: string;
    description: string;
}


export interface ServiceAlertInterface {
    descriptionParts: string[];
    title: string;
}

export interface VehicleArrivalInterface {
    prettyDistance?: string;
    rawDistanceInfo?: number;
    stopsFromCall?: number;
    rawDistanceOnRoute?: number;
    stopId?: string;
    stopName?: string;
    ISOTime?: string;
    detourStatus?: DisruptionStatus;
}

export interface VehicleDepartureInterface {
    ISOTime?: string;
    isDepartureOnSchedule?: boolean;
}

export interface VehicleRtInterface {
    longLat: [number, number];
    latLngLiteral:LatLngLiteral;
    destination: string;
    hasRealtime: boolean;
    nextStop: string | null;
    vehicleArrivalData: VehicleArrivalInterface[];
    vehicleDepartureData: VehicleDepartureInterface;
    departureTimeAsText: string;
    layover: boolean;
    prevTrip: boolean;
    stalled: boolean;
    spooking: boolean;
    strollerVehicle?: boolean;
    apcLevel?: number;
    passengerCount?: number;
    passengerCapacity?: number;
    vehicleId: string;
    bearing?: number;
    direction?: string;
    routeId: string;
    lastUpdate:Date;
    detourStatus?: DisruptionStatus;
}


export enum DisruptionStatus {
    Canonical = "canonical",
    Detour = "detour",
    Removed = "removed"
}

export interface MapRouteComponentInterface {
    routeId: string;
    id: string;
    points: [number, number][];
    color: string;
    disruptionStatus: DisruptionStatus;
}

export interface RouteDirectionInterface {
    /** @deprecated Use datumId instead */
    routeId: AgencyAndId;
    datumId: AgencyAndId;
    directionId: string;
    hasUpcomingService: boolean;
    routeDestination: string;
    routeStopComponentsData: StopInterface[];
}

export interface RouteMatchDirectionInterface {
    /** @deprecated Use datumId instead */
    routeId: AgencyAndId;
    datumId: AgencyAndId;
    color: string;
    directionId: string;
    destination: string;
    routeAndDirection: string;
    /** @deprecated Use mapRouteComponentDataDict instead */
    mapRouteComponentData: MapRouteComponentInterface[];
    mapRouteComponentDataDict: Record<DisruptionStatus, MapRouteComponentInterface[]>;
    mapStopComponentData: StopInterface[];
    routeDirectionComponentData: RouteDirectionInterface;
}

export function createStopInterface(stopJson: SearchStopData): StopInterface {
    return {
        datumName: stopJson.name,
        datumId: AgencyAndId.get(stopJson.id),
        name: stopJson.name,
        longLat: [stopJson.latitude, stopJson.longitude],
        id: AgencyAndId.get(stopJson.id),
        stopDirection: stopJson.stopDirection
    };
}

export function createServiceAlertInterface(serviceAlertJson: SiriPtSituationElement): ServiceAlertInterface {
    return {
        descriptionParts: serviceAlertJson.Description.split("\n"),
        title: serviceAlertJson.Summary
    };
}
export function createVehicleArrivalInterface(mc: SiriMonitoredCall): VehicleArrivalInterface {
    const distances = mc?.Extensions?.Distances || {};
    
    // Map IsDetour to DetourStatus for VehicleArrivalInterface
    // onDetour=true => detour
    // onDetour=false => removed
    // not supplied/null => canonical
    let detourStatus = DisruptionStatus.Canonical; // default to canonical
    if (mc?.Extensions?.StopDetourStatus?.IsDetour === true) {
        detourStatus = DisruptionStatus.Detour;
    } else if (mc?.Extensions?.StopDetourStatus?.IsDetour === false) {
        detourStatus = DisruptionStatus.Removed;
    }
    
    return {
        prettyDistance: distances.PresentableDistance,
        rawDistanceInfo: distances.DistanceFromCall,
        stopsFromCall: distances.StopsFromCall,
        rawDistanceOnRoute: distances.CallDistanceAlongRoute,
        stopId: mc?.StopPointRef,
        stopName: mc?.StopPointName,
        ISOTime: mc?.ExpectedArrivalTime,
        detourStatus: detourStatus
    };
}

export function createVehicleDepartureInterface(mvj: SiriMonitoredVehicleJourney, updateTime: Date): VehicleDepartureInterface {
    let departureTimeAsDateTime = OBA.Util.ISO8601StringToDate(mvj.OriginAimedDepartureTime);
    let isDepartureOnSchedule = departureTimeAsDateTime && updateTime ? departureTimeAsDateTime.getTime() >= updateTime.getTime() : false;
    if(isDepartureOnSchedule==null){isDepartureOnSchedule= false;}
    return {
        ISOTime: mvj.OriginAimedDepartureTime,
        isDepartureOnSchedule: isDepartureOnSchedule
    }
}

export function createVehicleRtInterface(mvj: SiriMonitoredVehicleJourney, updateTime: Date, tripLevelIsDetour?: boolean): VehicleRtInterface {
    const vehicleArrivalData = [];

    if (mvj?.MonitoredCall != null) {
        const mc = mvj.MonitoredCall;
        vehicleArrivalData.push(createVehicleArrivalInterface(mc));

        if (mvj?.OnwardCalls?.OnwardCall != null) {
            mvj.OnwardCalls.OnwardCall.forEach((call: SiriMonitoredCall, index: number) => {
                if (index !== 0) {
                    vehicleArrivalData.push(createVehicleArrivalInterface(call));
                }
            });
        }
    }

    let apcLevel = undefined;
    if(mvj?.MonitoredCall?.Extensions?.Capacities !=null){
        log.info("apcLevel: capacity info " + mvj?.MonitoredCall?.Extensions?.Capacities?.EstimatedPassengerLoadFactor)
        switch (mvj?.MonitoredCall?.Extensions?.Capacities?.EstimatedPassengerLoadFactor){
            case "manySeatsAvailable": apcLevel = 1; break;
            case "fewSeatsAvailable": apcLevel = 2; break;
            case "standingRoomOnly": apcLevel = 3; break;
            case "full": apcLevel = 4; break;
            case null: apcLevel = -1; break;
        }
        log.info("apcLevel: " + apcLevel)

    }

    let vehicleDepartureData = createVehicleDepartureInterface(mvj,updateTime);
    let layover = false;
    let prevTrip = false;
    let stalled = false;
    if(typeof mvj.ProgressStatus !== 'undefined'){
        if(mvj.ProgressStatus.indexOf("layover") !== -1){
            layover = true;
        }
        if(mvj.ProgressStatus.indexOf("prevTrip") !== -1){
            prevTrip = true;
        }
        if(mvj.ProgressStatus.indexOf("stalled") !== -1){
            stalled = true;
        }
    }
    let routeId = mvj.LineRef;
    if(routeId!=null){routeId=routeId.replace("+","-SBS")}

    // Map IsDetour to DetourStatus for VehicleRtInterface (trip-level)
    // onDetour=true => detour
    // onDetour=false => canonical
    // not supplied/null => canonical
    let detourStatus = DisruptionStatus.Canonical; // default to canonical
    if (tripLevelIsDetour === true) {
        detourStatus = DisruptionStatus.Detour;
    }

    return {
        lastUpdate: updateTime,
        longLat: [mvj.VehicleLocation.Latitude, mvj.VehicleLocation.Longitude],
        latLngLiteral: {lat:mvj.VehicleLocation.Latitude, lng:mvj.VehicleLocation.Longitude},
        destination: mvj.DestinationName,
        hasRealtime: mvj.Monitored && mvj.ProgressStatus!=="spooking",
        nextStop: mvj.MonitoredCall?.StopPointRef || null,
        vehicleArrivalData,
        vehicleDepartureData,
        apcLevel: apcLevel,
        strollerVehicle: mvj.MonitoredCall?.Extensions?.VehicleFeatures?.StrollerVehicle,
        passengerCount: mvj.MonitoredCall?.Extensions?.Capacities?.EstimatedPassengerCount,
        passengerCapacity: mvj.MonitoredCall?.Extensions?.Capacities?.EstimatedPassengerCapacity,
        layover: layover,
        prevTrip: prevTrip,
        stalled: stalled,
        spooking: mvj.ProgressStatus=="spooking",
        departureTimeAsText: mvj.OriginAimedDepartureTime,
        vehicleId: mvj.VehicleRef,
        bearing: mvj.Bearing,
        direction: mvj.DirectionRef,
        routeId: routeId,
        detourStatus: detourStatus
    };
}

export function createMapRouteComponentInterface(routeId: string, componentId: string, points: [number, number][], color: string, disruptionStatus: DisruptionStatus = DisruptionStatus.Canonical): MapRouteComponentInterface {
    return {
        routeId,
        id: componentId,
        points,
        color,
        disruptionStatus
    };
}

export function createRouteDirectionComponentInterface(routeId: AgencyAndId, datumId: AgencyAndId, directionId: string, hasUpcomingService:boolean, routeDestination: string, stops: StopInterface[]): RouteDirectionInterface {
    const routeStopComponentsData = stops.map(stop => (stop));
    return {
        routeId,
        datumId,
        directionId,
        hasUpcomingService,
        routeDestination,
        routeStopComponentsData
    };
}

function safelyDecodePolyline(encodedPolyline: string): [number, number][] | null {
    try {
        return OBA.Util.decodePolyline(encodedPolyline);
    } catch (error) {
        log.error("Error decoding polyline:", error, "Encoded polyline:", encodedPolyline);
        return null; // or return an empty array or a default value as appropriate
    }
}

export function createRouteMatchDirectionInterface(directionJson: SearchRouteDirectionData, routeId: AgencyAndId, color: string): RouteMatchDirectionInterface {
    const mapRouteComponentData = [];
    const mapRouteComponentDataDict: Record<DisruptionStatus, MapRouteComponentInterface[]> = {
        [DisruptionStatus.Canonical]: [],
        [DisruptionStatus.Detour]: [],
        [DisruptionStatus.Removed]: []
    };
    const mapStopComponentData: StopInterface[] = [];
    const stops : StopInterface[] = directionJson?.stops?.map((stop: SearchStopData) => createStopInterface(stop)) || [];

    log.info("createRouteMatchDirectionInterface", directionJson, routeId, color);

    const routeDirectionComponentData = createRouteDirectionComponentInterface(
        routeId,
        routeId,
        directionJson.directionId,
        directionJson.hasUpcomingScheduledService,
        directionJson.destination,
        stops
    );

    for (let j = 0; j < directionJson.polylines.length; j++) {
        const polylineData = directionJson.polylines[j];
        const encodedPolyline: string = typeof polylineData === 'string' ? polylineData : (polylineData.line || '');
        if (!encodedPolyline) continue; // Skip if no encoded polyline available
        const decodedPolyline = safelyDecodePolyline(encodedPolyline);
        if (!decodedPolyline) continue; // Skip if polyline couldn't be decoded
        const polylineId = `${routeId}${primaryDelimiter}dir${primaryDelimiter}${directionJson.directionId}${primaryDelimiter}polyLineNum${primaryDelimiter}${j}`;
        const statusValue = typeof polylineData === 'object' ? (polylineData.detourStatus || polylineData.disruptionStatus) : null;
        let rawDisruptionStatus: DisruptionStatus = 
            (statusValue && Object.values(DisruptionStatus).includes(statusValue as DisruptionStatus)) 
                ? (statusValue as DisruptionStatus)
                : DisruptionStatus.Canonical;
        const disruptionStatus = 
            (
                rawDisruptionStatus !== DisruptionStatus.Detour 
                && rawDisruptionStatus !== DisruptionStatus.Removed
            ) 
                ? DisruptionStatus.Canonical 
                : rawDisruptionStatus;
        const mapRouteComponent = createMapRouteComponentInterface(routeId.toString(), polylineId, decodedPolyline, color, disruptionStatus);
        mapRouteComponentData.push(mapRouteComponent);
        mapRouteComponentDataDict[disruptionStatus].push(mapRouteComponent);
    }

    stops.forEach((stop: StopInterface) => mapStopComponentData.push(stop));

    return {
        routeId: routeId,
        datumId: routeId,
        color,
        directionId: directionJson.directionId,
        routeAndDirection: routeId + primaryDelimiter+directionJson.directionId,
        destination: directionJson.destination,
        mapRouteComponentData,
        mapRouteComponentDataDict,
        mapStopComponentData,
        routeDirectionComponentData
    };
}


export enum MatchType {
    RouteMatch = "routeMatch",
    GeocodeMatch = "geocodeMatch",
    StopMatch = "stopMatch",
    AllRoutesMatch = "allRoutesMatch"
}

export class SearchMatch {
    static matchTypes = MatchType;

    type: MatchType;
    routeMatches: (RouteMatch | StopMatch)[]

    constructor(type: MatchType) {
        this.type = type;
        this.routeMatches = []
    }
}

export class RouteMatch extends SearchMatch implements RouteInterface{
    color: string;
    /** @deprecated Use datumId instead */
    routeId: AgencyAndId;
    /** @deprecated Use datumName instead */
    routeTitle: string;
    description: string;
    directions: RouteMatchDirectionInterface[];
    datumId: AgencyAndId;
    datumName: string;

    constructor(data: SearchRouteData) {
        super(MatchType.RouteMatch);
        const routeIdStr = data?.id.replace("+","-SBS");
        this.datumId = this.routeId = AgencyAndId.get(routeIdStr);
        this.datumName = this.routeTitle = data?.shortName + " " + data?.longName;
        this.color = data?.color;
        this.description = data?.description;
        this.directions = [];
    }
}

export class GeocodeMatch extends SearchMatch {
    latitude: number;
    longitude: number;
    routeMatches: (RouteMatch|StopMatch)[]

    constructor(data: SearchGeoData) {
        super(MatchType.GeocodeMatch);
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.routeMatches = [];
    }
}

export class StopMatch extends SearchMatch implements StopInterface{
    latitude: number;
    longitude: number;
    /** @deprecated Use datumName instead */
    name: string;
    /** @deprecated Use datumId instead */
    id: AgencyAndId;
    routeMatches: RouteMatch[];
    longLat: [number, number];
    stopDirection: string;
    datumId: AgencyAndId;
    datumName: string;

    constructor(data: SearchStopData) {
        super(MatchType.StopMatch);
        this.datumId = this.id = AgencyAndId.get(data.id);
        this.datumName = this.name = data.name;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.routeMatches = [];
        this.longLat = [data.latitude,data.longitude];
        this.stopDirection = data.stopDirection;
    }
}

export enum CardType {
    RouteCard = "routeCard",
    GeocodeCard = "geocodeCard",
    StopCard = "stopCard",
    VehicleCard = "vehicleCard",
    ErrorCard = "errorCard",
    HomeCard = "homeCard",
    AllRoutesCard = "allRoutesCard",
    LoadingCard = "loadingCard",
    FavoritesCard = "favoritesCard"
}

export class Card {
    static ROUTECARDIDENTIFIERS = new Set(["RouteResult", "RouteResultV2"]);
    static GEOCARDIDENTIFIERS = new Set(["GeocodeResult", "GeocodeResultV2"]);
    static STOPCARDIDENTIFIERS = new Set(["StopResult", "StopResultV2"]);
    static LOADCARDIDENTIFIERS = new Set(["LoadingResult"]);
    static FAVORITESCARDIDENTIFIERS = new Set(["FavoritesResult"]);
    static cardTypes = CardType;

    searchTerm: string;
    datumId: string | AgencyAndId |null;
    searchResultType: string | null;
    name: string;
    searchMatches: SearchMatch[];
    routeIdList: Set<AgencyAndId>;
    stopIdList: Set<string>;
    vehicleId: string | null;
    type: CardType;
    uuid:string;
    sessionUuid:string;

    constructor(searchTerm: string,uuid:string, sessionUuid:string) {
        this.searchTerm = searchTerm;
        this.searchResultType = null;
        this.name = "loadingCard";
        this.searchMatches = [];
        this.routeIdList = new Set();
        this.stopIdList = new Set();
        this.vehicleId = null;
        this.type = CardType.LoadingCard; // Default or initial type if applicable
        this.datumId = null;
        this.uuid= uuid;
        this.sessionUuid = sessionUuid;
    }

    setType(cardType: CardType): void {
        this.type = cardType;
        this.name = this.type;
        log.info("setType", this.type, this.name);
    }

    setToVehicle(
        vehicleId: string,
        searchMatches: SearchMatch[],
        routeIdList: Set<AgencyAndId>
    ): void {
        this.setType(CardType.VehicleCard);
        this.vehicleId = vehicleId;
        this.datumId = vehicleId;
        this.searchMatches = searchMatches;
        this.routeIdList = routeIdList;
        this.searchResultType = null;
        log.info("setToVehicle",this)
    }

    setToError(searchTerm: string | Error | null) {
        log.info("setToError", searchTerm);
        if(searchTerm){
            searchTerm = searchTerm
        }
        this.setType(CardType.ErrorCard);
    }

    setToFavorites(
        searchMatches: SearchMatch[],
        routeIdList: Set<AgencyAndId>
    ): void {
        this.setType(CardType.FavoritesCard);
        this.searchMatches = searchMatches;
        this.routeIdList = routeIdList;
    }

    setToAllRoutes(
        searchMatches: SearchMatch[],
        routeIdList: Set<AgencyAndId>
    ): void {
        this.setType(CardType.AllRoutesCard);
        this.searchMatches = searchMatches;
        this.routeIdList = routeIdList;
    }

    setSearchResultType(searchResultType: string | null): void {
        this.searchResultType = searchResultType;
        if (searchResultType === null) {
            this.setType(CardType.ErrorCard);
            return;
        }
        
        if (Card.LOADCARDIDENTIFIERS.has(searchResultType)) {
            this.setType(CardType.LoadingCard);
        } else if (Card.ROUTECARDIDENTIFIERS.has(searchResultType)) {
            this.setType(CardType.RouteCard);
        } else if (Card.GEOCARDIDENTIFIERS.has(searchResultType)) {
            this.setType(CardType.GeocodeCard);
        } else if (Card.STOPCARDIDENTIFIERS.has(searchResultType)) {
            this.setType(CardType.StopCard);
        } else {
            this.setType(CardType.ErrorCard);
            log.error("Invalid search result type", searchResultType);
        }
    }

    equals(that: Card | null): boolean {
        return (
            this.searchTerm === that?.searchTerm &&
            this.searchResultType === that?.searchResultType
        );
    }
}



export type VehicleStateUpdateValue = Map<string, VehicleRtInterface | ServiceAlertInterface[]> | Map<string, VehicleRtInterface[]> | string | undefined;

export interface VehicleStateObject {
    renderCounter: number;
    [key: `${string}_${string}`]: VehicleStateUpdateValue;
}

export interface CardStateObject {
    currentCard: Card,
    cardStack: [Card],
    renderCounter:number,
    historyIndex: number
}

export interface RoutesObject {
    [key: string]: RouteMatch;
}

export interface RoutesObjectContainer extends React.MutableRefObject<RoutesObject> {}


export interface StopsObject {
    [key: string]: StopInterface;
}

export interface StopsObjectContainer extends React.MutableRefObject<StopsObject> {}
