import {OBA} from "../../js/oba";
import React, {useContext, useEffect, useRef} from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import busStroller from "../../img/icon/bus-stroller.svg";
import {useSearch} from "../../js/updateState/SearchEffect.ts";
import {VehicleRtInterface} from "../../js/updateState/DataModels";
import log from 'loglevel';

const COMPONENT_IDENTIFIER = "MapVehicleComponent"




function MapVehicleComponent  (
    {vehicleDatum,vehicleRefs}:{vehicleDatum:VehicleRtInterface,vehicleRefs:React.MutableRefObject<Map<string,Marker>>}) :JSX.Element{

    // let targetVehicleId = state.currentCard.vehicleId
    // log.info('generating mapVehicle: ',vehicleDatum.vehicleId,vehicleDatum)
    let imgDegrees = vehicleDatum.bearing - vehicleDatum.bearing%5
    let scheduled = vehicleDatum.hasRealtime?"":"scheduled/"
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    let vehicleIdParts = vehicleDatum.vehicleId.split("_");
    let vehicleIdWithoutAgency = vehicleIdParts[1];

    let {vehicleSearch} = useSearch()
    const selectVehicle = (vehicleData) =>{
        log.info("clicked on " + vehicleData.vehicleId)
        vehicleSearch(vehicleData)
    }

    let icon = L.icon({
        iconUrl: vehicleImageUrl,
        className: "svg-icon",
        iconSize: [51,51],
        iconAnchor: [25,25],
        popupAnchor: [0,0]
    })

    let markerOptions = {
        zIndex: 3,
        title: "Vehicle " + vehicleIdWithoutAgency + ", " + vehicleDatum.routeId + " to " + vehicleDatum.destination,
        vehicleId: vehicleDatum.vehicleId,
        routeId: vehicleDatum.routeId,
        // key:COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId,
        key:COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId + "_"+vehicleDatum.longLat,
        position:vehicleDatum.longLat,
        icon: icon,
        id: COMPONENT_IDENTIFIER+"_"+vehicleDatum.vehicleId
    };


    // log.info("mapVehicle key: ",markerOptions.key,vehicleDatum)


    let out = (<Marker {...markerOptions}
                       eventHandlers={{click : ()=>{selectVehicle(vehicleDatum)}}}
                       ref={r=>{
                           // log.info("ref for vehicle component",vehicleDatum,r);
                           typeof vehicleRefs!=='undefined'
                               ?vehicleRefs.current.set(vehicleDatum.vehicleId,r):null
                       }}
                       keyboard={false}
    >
        <Popup key={vehicleDatum.vehicleId+"_"+vehicleDatum.longLat} className="map-popup vehicle-popup">
            <img src={vehicleDatum.strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
            <div className="popup-info">
                <span className="route">{vehicleDatum.routeId.split("_")[1]} {vehicleDatum.destination}</span>
                <span className="vehicle">Vehicle #{vehicleIdWithoutAgency}</span>
            </div>
        </Popup>
    </Marker>);

    return out
}
export default MapVehicleComponent;

