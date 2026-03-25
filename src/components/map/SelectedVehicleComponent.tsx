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
import { useServiceAlert } from "../views/ServiceAlertContainerComponent.tsx";

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

export function SelectedVehicleComponent  () :JSX.Element{
    const { state } = useContext(CardStateContext);
    const { vehicleState} = useContext(VehicleStateContext);
    const vehicleRefs = useRef<Map<string, L.Marker>>(new Map());
    const {search} = useNavigation();
    const popupOpen = useRef(true)
    let {getServiceAlert} = useServiceAlert();
    

    if (state.currentCard.type !== CardType.VehicleCard) {
        return <></>
    }


    let vehicleDatum : VehicleRtInterface | null = null;
    let shortenedRouteIds = new Set(Array.from(state.currentCard.routeIdList).map(shortenRoute));
    
    [...shortenedRouteIds].some(shortenedRouteId=>{
        let routeData = vehicleState[shortenedRouteId+vehicleDataIdentifier]
        vehicleDatum = typeof routeData!=="undefined"?routeData.get(state.currentCard.datumId):null
        log.info("SelectedVehicleComponent looking for vehicle data with key: ",routeData,shortenedRouteId+vehicleDataIdentifier,vehicleDatum)
        return typeof vehicleDatum!=="undefined"
    })
    if(typeof vehicleDatum === "undefined" || vehicleDatum === null){
        log.error("SelectedVehicleComponent could not find vehicle data for selected vehicle",state.currentCard.datumId,shortenedRouteIds,vehicleState, vehicleDatum)
        return <></>
    }
    vehicleDatum = vehicleDatum as VehicleRtInterface

    let vehicleIdParts = vehicleDatum.vehicleId.split("_");
    let vehicleIdWithoutAgency = vehicleIdParts[1];

    let markerOptions = {
        zIndexOffset: 1000,
        title: "Vehicle " + vehicleIdWithoutAgency + ", " + vehicleDatum.routeId + " to " + vehicleDatum.destination,
        vehicleId: vehicleDatum.vehicleId,
        routeId: vehicleDatum.routeId,
        // key:COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId,
        key:COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId + "_"+vehicleDatum.longLat,
        position:vehicleDatum.longLat,
        icon: createVehicleIcon(vehicleDatum),
        id: COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId
    };

    let popupOptions = {}


    let id = vehicleDatum.routeId.split("_")[1];
    let serviceAlertIdentifier = vehicleDatum.routeId;
    let hasServiceAlert = getServiceAlert(id,serviceAlertIdentifier)!==null;


    let out = (<Marker {...markerOptions}
                       eventHandlers={{
                            click : (event : L.LeafletMouseEvent)=>{vehicleDatum.longLat = [event.latlng.lat,event.latlng.lng];},
                             add: (e) => {if(popupOpen.current) {e.target.openPopup()}},
                             popupclose: () => {popupOpen.current = false},
                             popupopen: () => {popupOpen.current = true}
                       }}
                       ref={r=>{
                           // log.info("ref for vehicle component",vehicleDatum,r);
                           typeof vehicleRefs!=='undefined'
                               ?vehicleRefs.current.set(vehicleDatum.vehicleId,r):null
                       }}
                       keyboard={false}
    >
        <Popup
            key={vehicleDatum.vehicleId+"_"+vehicleDatum.longLat}
            className="map-popup vehicle-popup"
            {... popupOptions}
        >
            <div className="popup-header">
                <div className="popup-header-info">
                <img src={vehicleDatum?.strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
                    <div className="popup-info">
                        <span className={`route ${hasServiceAlert ? 'has-service-alert' : ''}`}>{vehicleDatum.routeId.split("_")[1]} {vehicleDatum.destination}</span>
                        <span className="vehicle">Vehicle #{vehicleIdWithoutAgency}</span>
                        <MeeplesComponentSpan vehicleDatum={vehicleDatum}/>
                    </div>
                </div>
                <strong className="next-stops-text">Next Stops</strong>
            </div>
            <div className="next-stops">
                {vehicleDatum?.vehicleArrivalData!=null?
                vehicleDatum.vehicleArrivalData.map((vehicleArrival, index)=>{
                    log.info("adding vehicle arrival data to popup",vehicleArrival)
                    if(index>=MAX_NEXT_STOPS){
                        return null
                    }
                    return (
                        <div key={index} className="next-stop">
                            <span className="stop-name">{vehicleArrival.stopName}</span>
                            <span className="arrival-time">{OBA.Util.getArrivalEstimateForISOString(vehicleArrival.ISOTime,vehicleDatum.lastUpdate)}</span>
                        </div>
                    )
                }):null}
            </div>
            <button className="view-full close-map" aria-label="view full vehicle details">
                View Vehicle Details
            </button>
        </Popup>
    </Marker>);

    return out
}


