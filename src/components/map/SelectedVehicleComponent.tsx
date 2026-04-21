import {OBA} from "../../js/oba.js";
import React, {useContext, useEffect, useRef} from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import busStroller from "../../img/icon/bus-stroller.svg";
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";
import {CardType, VehicleArrivalInterface, VehicleDepartureInterface, VehicleRtInterface} from "../../js/updateState/DataModels.ts";
import log from 'loglevel';
import { shortenRoute, vehicleDataIdentifier, VehicleStateContext } from "../util/VehicleStateComponent.js";
import { CardStateContext } from "../util/CardStateComponent.tsx";
import { MeeplesComponentSpan } from "../views/VehicleComponent.tsx";
import { ServiceAlertSvg, useServiceAlert } from "../views/ServiceAlertContainerComponent.tsx";
import { ServiceAlertInterface } from "../../js/updateState/DataModels.ts";
import { ServiceAlertContainerProps } from "../views/ServiceAlertContainerComponent.tsx";
import { useMap } from "react-leaflet";
import { isCenteredOn } from "../../utils/mapZoom.ts";

const COMPONENT_IDENTIFIER = "MapVehicleComponent"
const MAX_NEXT_STOPS = 3;


const createVehicleIcon = (vehicleDatum: VehicleRtInterface):L.Icon => {
    let scheduled = vehicleDatum.hasRealtime?"":"scheduled/"
    let imgDegrees = vehicleDatum.bearing - vehicleDatum.bearing%5
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    let icon = L.icon({
        iconUrl: vehicleImageUrl,
        className: "svg-icon",
        iconSize: [51,51],
        iconAnchor: [25,25],
        popupAnchor: [0,0]
    })
    return icon
}

function SelectedVehicleServiceAlert({routeId,getServiceAlert}: {routeId: string, getServiceAlert: any}): JSX.Element{
    if(typeof routeId === "undefined" || routeId === null || typeof routeId !== "string"){
            log.error("SelectedVehicleServiceAlert received invalid routeId",routeId)
        return <></>
    }
    let id = routeId.split("_")[1];
    let serviceAlertIdentifier = routeId;
    let hasServiceAlert = getServiceAlert({abbreviatedRouteId: id, routeAgencyAndId: serviceAlertIdentifier})!==null;
    console.log("checking for service alert in Selected Vehicle with id ",id," and identifier ",serviceAlertIdentifier," result: ",hasServiceAlert);

    return (
        <>
            {hasServiceAlert && (
                <>
                    <div className="w-[1px] h-3 bg-mta-black opacity-30 mx-1" />
                    <div className="flex items-center gap-1">
                        <ServiceAlertSvg className="w-4 h-4 mobile:-mt-[1px]" />
                        <span className="text-[#D91A1A]">Alert</span>
                    </div>
                </>
            )}
        </>
    )
}


export function PopupContents({vehicleDatum, getServiceAlert}:{
    vehicleDatum: VehicleRtInterface, 
    getServiceAlert: (params: ServiceAlertContainerProps) => ServiceAlertInterface[] | null;
}): JSX.Element{
    if(typeof vehicleDatum === "undefined" || vehicleDatum === null){
        log.error("PopupContents received invalid vehicleDatum",vehicleDatum)
        return <></>
    }
    let vehicleIdParts = vehicleDatum.vehicleId.split("_");
    let vehicleIdWithoutAgency = vehicleIdParts[1];
    return (
        <>
            <div className="popup-header">
                <div className="popup-header-info">
                <img src={vehicleDatum?.strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
                    <div className="popup-info">
                        <span className={`route`}>{vehicleDatum.routeId.split("_")[1]} {vehicleDatum.destination}</span>
                        <div className="flex items-center gap-1">
                            <span className="vehicle">Vehicle #{vehicleIdWithoutAgency}</span>
                            <SelectedVehicleServiceAlert routeId={vehicleDatum.routeId} getServiceAlert={getServiceAlert}/>
                        </div>
                            
                        <MeeplesComponentSpan vehicleDatum={vehicleDatum}/>
                    </div>
                </div>
                <strong className="next-stops-text">Next Stops</strong>
            </div>
            <div className="next-stops">
                {vehicleDatum?.vehicleArrivalData!=null?
                vehicleDatum.vehicleArrivalData.map((vehicleArrival, index)=>{
                    if(index>=MAX_NEXT_STOPS){
                        return null
                    }
                    return (
                        <div key={index} className="next-stop">
                            <div>
                                <span className="stop-name">{vehicleArrival.stopName}</span>
                                <span className="arrival-time">{OBA.Util.getArrivalEstimateForISOString(vehicleArrival.ISOTime,vehicleDatum.lastUpdate)}{vehicleArrival.prettyDistance}</span>
                            </div>
                        </div>
                    )
                }):null}
            </div>
            <button className="view-full close-map" aria-label="view full vehicle details">
                View Vehicle Details
            </button>
        </>
    )
}

export function SelectedVehicleComponent  ({selectedElementLocation, userHasAdjustedMapOffMainElement}: {selectedElementLocation: React.MutableRefObject<{lat:number, lng:number}|null>, userHasAdjustedMapOffMainElement: React.MutableRefObject<boolean>}) :JSX.Element{
    const { state } = useContext(CardStateContext);
    const { vehicleState} = useContext(VehicleStateContext);
    const vehicleRefs = useRef<Map<string, L.Marker>>(new Map());
    const {search} = useNavigation();
    const popupOpen = useRef(true)
    const lastVehicleDataumId = useRef<string|null>(null)
    let {getServiceAlert} = useServiceAlert();
    let map = useMap()

    if (state.currentCard.type !== CardType.VehicleCard) {
        return <></>
    }


    let vehicleDatum : VehicleRtInterface | null = null;
    let shortenedRouteIds = new Set(Array.from(state.currentCard.routeIdList).map(shortenRoute));
    
    [...shortenedRouteIds].some(shortenedRouteId=>{
        let routeData = vehicleState[shortenedRouteId+vehicleDataIdentifier]
        vehicleDatum = typeof routeData!=="undefined"?routeData.get(state.currentCard.datumId):null
        log.info("SelectedVehicleComponent looking for vehicle data with key: ",routeData,shortenedRouteId+vehicleDataIdentifier,vehicleDatum)
        return typeof vehicleDatum!=="undefined" && vehicleDatum!==null
    })
    if(typeof vehicleDatum === "undefined" || vehicleDatum === null){
        log.error("SelectedVehicleComponent could not find vehicle data for selected vehicle",state.currentCard.datumId,shortenedRouteIds,vehicleState, vehicleDatum)
        return <></>
    }
    vehicleDatum = vehicleDatum as VehicleRtInterface

    let vehicleIdParts = vehicleDatum.vehicleId.split("_");
    let vehicleIdWithoutAgency = vehicleIdParts[1];
    if(lastVehicleDataumId.current !== vehicleDatum.vehicleId){
        popupOpen.current = true
    }
    lastVehicleDataumId.current = vehicleDatum.vehicleId


    let autopan = !userHasAdjustedMapOffMainElement.current

    let markerOptions = {
        zIndexOffset: 1000,
        title: "Vehicle " + vehicleIdWithoutAgency + ", " + vehicleDatum.routeId + " to " + vehicleDatum.destination,
        vehicleId: vehicleDatum.vehicleId,
        routeId: vehicleDatum.routeId,
        // key:COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId,
        key:COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId+"_"+vehicleDatum.longLat, // include longLat in key to force remount of marker and popup when vehicle moves, ensuring popup content updates
        position:vehicleDatum.longLat,
        icon: createVehicleIcon(vehicleDatum),
        id: COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId,
        autoPan: autopan,
    };

    
    
    let popupOptions = {
        autoPan: autopan

    }
    log.info("SelectedVehicleComponent popup options: ", popupOptions, "marker options: ", markerOptions)

    selectedElementLocation.current = vehicleDatum.longLat ? { lat: vehicleDatum.longLat[0], lng: vehicleDatum.longLat[1] } : null;
    log.info("SelectedVehicleComponent set selectedElementLocation to: ", selectedElementLocation.current)

    let out = (<Marker {...markerOptions}
                        
                        
                       eventHandlers={{
                            // click : (event : L.LeafletMouseEvent)=>{vehicleDatum.longLat = [event.latlng.lat,event.latlng.lng];},
                            add: (e) => {log.info("SelectedVehicleComponent add event: ", e);if(popupOpen.current) {e.target.openPopup()}},
                            popupclose: () => {popupOpen.current = false},
                            popupopen: () => {popupOpen.current = true}
                       }}
                       keyboard={false}
    >
        <Popup
            key={vehicleDatum.vehicleId+"_"+vehicleDatum.longLat}
            className="map-popup vehicle-popup"
            {... popupOptions}
        >
            <PopupContents vehicleDatum={vehicleDatum} getServiceAlert={getServiceAlert}/>
        </Popup>
    </Marker>);



    return out
}


