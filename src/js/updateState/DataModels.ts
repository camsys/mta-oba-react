import {OBA} from "../oba";
import {LatLngLiteral} from "leaflet";

export class AgencyAndId {
    agency: string;
    id: string
    constructor(datum:string) {
        let parts = datum.split("_")
        this.agency = parts[0]
        this.id = parts.reduce((acc, part, nth) => nth !== 0 ? acc + part : acc, "")
    }
}

export interface FavoritesCookie{
    favorites : [StopInterface | RouteInterface]
}

export interface StopInterface {
    name: string;
    longLat: [number, number];
    id: string;
    stopDirection: string;
}


export interface ServiceAlertInterface {
    json: any;
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
}

export interface VehicleRtInterface {
    longLat: [number, number];
    latLngLiteral:LatLngLiteral;
    destination: string;
    hasRealtime: boolean;
    nextStop: string | null;
    vehicleArrivalData: VehicleArrivalInterface[];
    strollerVehicle?: boolean;
    passengerCount?: number;
    passengerCapacity?: number;
    vehicleId: string;
    bearing?: number;
    direction?: string;
    routeId: string;
    lastUpdate:Date
}


export interface MapRouteComponentInterface {
    routeId: string;
    id: string;
    points: any; // Replace 'any' with a specific type if available
    color: string;
}

export interface RouteDirectionInterface {
    routeId: string;
    directionId: string;
    routeDestination: string;
    routeStopComponentsData: StopInterface[];
}

export interface RouteMatchDirectionInterface {
    routeId: string;
    color: string;
    directionId: string;
    destination: string;
    mapRouteComponentData: MapRouteComponentInterface[];
    mapStopComponentData: StopInterface[];
    routeDirectionComponentData: RouteDirectionInterface;
}


export function createStopInterface(stopJson: any): StopInterface {
    return {
        name: stopJson.name,
        longLat: [stopJson.latitude, stopJson.longitude],
        id: stopJson.id,
        stopDirection: stopJson.stopDirection
    };
}

export function createServiceAlertInterface(serviceAlertJson: any): ServiceAlertInterface {
    return {
        json: serviceAlertJson,
        descriptionParts: serviceAlertJson.Description.split("\n"),
        title: serviceAlertJson.Summary
    };
}
export function createVehicleArrivalInterface(mc: any): VehicleArrivalInterface {
    const distances = mc?.Extensions?.Distances || {};
    return {
        prettyDistance: distances.PresentableDistance,
        rawDistanceInfo: distances.DistanceFromCall,
        stopsFromCall: distances.StopsFromCall,
        rawDistanceOnRoute: distances.CallDistanceAlongRoute,
        stopId: mc?.StopPointRef,
        stopName: mc?.StopPointName,
        ISOTime: mc?.ExpectedArrivalTime
    };
}

export function createVehicleRtInterface(mvj: any,updateTime:Date): VehicleRtInterface {
    const vehicleArrivalData = [];

    if (mvj?.MonitoredCall != null) {
        const mc = mvj.MonitoredCall;
        vehicleArrivalData.push(createVehicleArrivalInterface(mc));

        if (mvj?.OnwardCalls?.OnwardCall != null) {
            mvj.OnwardCalls.OnwardCall.forEach((call: any, index: number) => {
                if (index !== 0) {
                    vehicleArrivalData.push(createVehicleArrivalInterface(call));
                }
            });
        }
    }

    return {
        lastUpdate: updateTime,
        longLat: [mvj.VehicleLocation.Latitude, mvj.VehicleLocation.Longitude],
        latLngLiteral: {lat:mvj.VehicleLocation.Latitude, lng:mvj.VehicleLocation.Longitude},
        destination: mvj.DestinationName,
        hasRealtime: mvj.Monitored,
        nextStop: mvj.MonitoredCall?.StopPointRef || null,
        vehicleArrivalData,
        strollerVehicle: mvj.MonitoredCall?.Extensions?.VehicleFeatures?.StrollerVehicle,
        passengerCount: mvj.MonitoredCall?.Extensions?.Capacities?.EstimatedPassengerCount,
        passengerCapacity: mvj.MonitoredCall?.Extensions?.Capacities?.EstimatedPassengerCapacity,
        vehicleId: mvj.VehicleRef,
        bearing: mvj.Bearing,
        direction: mvj.DirectionRef,
        routeId: mvj.LineRef
    };
}

export function createMapRouteComponentInterface(routeId: string, componentId: string, points: any, color: string): MapRouteComponentInterface {
    return {
        routeId,
        id: componentId,
        points,
        color
    };
}

export function createRouteDirectionComponentInterface(routeId: string, directionId: string, routeDestination: string, stops: StopInterface[]): RouteDirectionInterface {
    const routeStopComponentsData = stops.map(stop => createStopInterface(stop));
    return {
        routeId,
        directionId,
        routeDestination,
        routeStopComponentsData
    };
}

export function createRouteMatchDirectionInterface(directionJson: any, routeId: string, color: string): RouteMatchDirectionInterface {
    const mapRouteComponentData = [];
    const mapStopComponentData = [];
    const stops = directionJson?.stops || [];

    const routeDirectionComponentData = createRouteDirectionComponentInterface(
        routeId,
        directionJson.directionId,
        directionJson.destination,
        stops
    );

    for (let j = 0; j < directionJson.polylines.length; j++) {
        const encodedPolyline = directionJson.polylines[j];
        const decodedPolyline = OBA.Util.decodePolyline(encodedPolyline);
        const polylineId = `${routeId}_dir_${directionJson.directionId}_polyLineNum_${j}`;
        mapRouteComponentData.push(createMapRouteComponentInterface(routeId, polylineId, decodedPolyline, color));
    }

    stops.forEach(stop => mapStopComponentData.push(createStopInterface(stop)));

    return {
        routeId,
        color,
        directionId: directionJson.directionId,
        destination: directionJson.destination,
        mapRouteComponentData,
        mapStopComponentData,
        routeDirectionComponentData
    };
}


export enum MatchType {
    RouteMatch = "routeMatch",
    GeocodeMatch = "geocodeMatch",
    StopMatch = "stopMatch",
}

export class SearchMatch {
    static matchTypes = MatchType;

    type: MatchType;
    routeMatches: [SearchMatch]

    constructor(type: MatchType) {
        this.type = type;
        this.routeMatches = []
    }
}

export interface RouteInterface {
    color: string;
    routeId: string;
    routeTitle: string;
    description: string;
}

export class RouteMatch extends SearchMatch implements RouteInterface{
    color: string;
    routeId: string;
    routeTitle: string;
    description: string;
    directions: RouteMatchDirectionInterface[];

    constructor(data: any) {
        super(MatchType.RouteMatch);
        this.color = data.color;
        this.routeId = data.routeId;
        this.routeTitle = data.routeTitle;
        this.description = data.description;
        this.directions = [];
    }
}

export class GeocodeMatch extends SearchMatch {
    latitude: number;
    longitude: number;
    routeMatches: [RouteMatch|StopMatch]

    constructor(data: any) {
        super(MatchType.GeocodeMatch);
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.routeMatches = []
    }
}

export class StopMatch extends SearchMatch {
    latitude: number;
    longitude: number;
    name: string;
    id: string;
    routeMatches: [RouteMatch]

    constructor(data: any) {
        super(MatchType.StopMatch);
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.name = data.name;
        this.id = data.id;
        this.routeMatches = []
    }
}

export enum CardType {
    RouteCard = "routeCard",
    GeocodeCard = "geocodeCard",
    StopCard = "stopCard",
    VehicleCard = "vehicleCard",
    ErrorCard = "errorCard",
    HomeCard = "homeCard",
}

export class Card {
    static ROUTECARDIDENTIFIER = "RouteResult";
    static GEOCARDIDENTIFIER = "GeocodeResult";
    static STOPCARDIDENTIFIER = "StopResult";
    static cardTypes = CardType;

    searchTerm: string;
    datumId:string;
    searchResultType: string | null;
    name: string;
    searchMatches: SearchMatch[];
    routeIdList: Set<string>;
    stopIdList: Set<string>;
    vehicleId: string | null;
    type: CardType;

    constructor(searchTerm: string) {
        this.searchTerm = searchTerm;
        this.searchResultType = null;
        this.name = "homeCard";
        this.searchMatches = [];
        this.routeIdList = new Set();
        this.stopIdList = new Set();
        this.vehicleId = null;
        this.type = CardType.HomeCard; // Default or initial type if applicable
        this.datumId = null;
    }

    setType(cardType: CardType): void {
        this.type = cardType;
        this.name = this.type;
    }

    setToVehicle(
        vehicleId: string,
        searchMatches: SearchMatch[],
        routeIdList: Set<string>
    ): void {
        this.setType(CardType.VehicleCard);
        this.vehicleId = vehicleId;
        this.datumId = vehicleId;
        this.searchMatches = searchMatches;
        this.routeIdList = routeIdList;
    }

    setSearchResultType(searchResultType: string | null): void {
        this.searchResultType = searchResultType;
        switch (searchResultType) {
            case Card.ROUTECARDIDENTIFIER:
                this.setType(CardType.RouteCard);
                break;
            case Card.GEOCARDIDENTIFIER:
                this.setType(CardType.GeocodeCard);
                break;
            case Card.STOPCARDIDENTIFIER:
                this.setType(CardType.StopCard);
                break;
            case null:
                this.setType(CardType.ErrorCard);
                break;
            default:
                this.setType(CardType.ErrorCard);
                console.error("Invalid search result type", searchResultType);
        }
    }

    equals(that: Card | null): boolean {
        return (
            this.searchTerm === that?.searchTerm &&
            this.searchResultType === that?.searchResultType
        );
    }
}


export interface CardStateObject {
    currentCard: Card,
    cardStack: [Card],
    renderCounter:number
}
export interface RoutesObject {
    [key: string]: RouteMatch;
}
export interface StopsObject {
    [key: string]: StopInterface;
}