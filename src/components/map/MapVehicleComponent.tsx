import {OBA} from "../../js/oba";
import React, {useContext, useEffect, useRef} from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import busStroller from "../../img/icon/bus-stroller.svg";
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";
import {VehicleRtInterface} from "../../js/updateState/DataModels";
import log from 'loglevel';

const COMPONENT_IDENTIFIER = "MapVehicleComponent"




function MapVehicleComponent  (
    {vehicleDatum,vehicleRefs,vehicleIcon}:{vehicleDatum:VehicleRtInterface,vehicleRefs:React.MutableRefObject<Map<string,Marker>>,vehicleIcon:L.Icon}) :JSX.Element{

    // let targetVehicleId = state.currentCard.vehicleId
    // log.info('generating mapVehicle: ',vehicleDatum.vehicleId,vehicleDatum)
    let vehicleIdParts = vehicleDatum.vehicleId.split("_");
    let vehicleIdWithoutAgency = vehicleIdParts[1];

    let {vehicleSearch} = useNavigation()
    const selectVehicle = (vehicleData:VehicleRtInterface) =>{
        log.info("clicked on " + vehicleData.vehicleId)
        vehicleData.longLat = vehicleData.longLat
        vehicleSearch(vehicleData)
    }

    let markerOptions = {
        zIndex: 3,
        title: "Vehicle " + vehicleIdWithoutAgency + ", " + vehicleDatum.routeId + " to " + vehicleDatum.destination,
        vehicleId: vehicleDatum.vehicleId,
        routeId: vehicleDatum.routeId,
        // key:COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId,
        key:COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId + "_"+vehicleDatum.longLat,
        position:vehicleDatum.longLat,
        icon: vehicleIcon,
        id: COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId
    };

    let popupOptions = {
        // autoPan: false
        // keepInView: false
    }


    // log.info("mapVehicle key: ",markerOptions.key,vehicleDatum)


    let out = (<Marker {...markerOptions}
                       eventHandlers={{click : (event : L.LeafletMouseEvent)=>{
                            vehicleDatum.longLat = [event.latlng.lat,event.latlng.lng];
                            selectVehicle(vehicleDatum)}}}
                       ref={r=>{
                           // log.info("ref for vehicle component",vehicleDatum,r);
                           typeof vehicleRefs!=='undefined'
                               ?vehicleRefs.current.set(vehicleDatum.vehicleId,r):null
                       }}
                       keyboard={false}
    >
        <Popup key={vehicleDatum.vehicleId+"_"+vehicleDatum.longLat} className="map-popup vehicle-popup" {... popupOptions}>
            <img src={vehicleDatum?.strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
            <div className="popup-info">
                <span className="route">{vehicleDatum.routeId.split("_")[1]} {vehicleDatum.destination}</span>
                <span className="vehicle">Vehicle #{vehicleIdWithoutAgency}</span>
                <button className="view-full close-map" aria-label="view full vehicle details">
                    View Vehicle Details
                </button>
            </div>
        </Popup>
    </Marker>);

    return out
}
export default MapVehicleComponent;

