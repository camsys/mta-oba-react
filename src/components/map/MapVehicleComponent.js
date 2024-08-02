import {OBA} from "../../js/oba";
import React, {useContext, useEffect, useRef} from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import busStroller from "../../img/icon/bus-stroller.svg";
import {CardStateContext} from "../util/CardStateComponent";
import {selectVehicleCard} from "../../js/updateState/SearchEffect";

const COMPONENT_IDENTIFIER = "MapVehicleComponent"




function MapVehicleComponent  (vehicleData,state, setState,targetVehicleId) {
    // console.log('generating mapVehicle: ',vehicleData.vehicleId,vehicleData)
    let imgDegrees = vehicleData.bearing - vehicleData.bearing%5
    OBA.Util.trace("img degrees" + imgDegrees)
    let scheduled = vehicleData.hasRealtime?"":"scheduled/"
    OBA.Util.trace(scheduled)
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    OBA.Util.trace("vehicleImageUrl:")
    OBA.Util.trace(vehicleImageUrl)
    let vehicleIdParts = vehicleData.vehicleId.split("_");
    let vehicleIdWithoutAgency = vehicleIdParts[1];

    const selectVehicle = (vehicleData) =>{
        console.log("clicked on " + vehicleData.vehicleId)
        selectVehicleCard(vehicleData,state,setState)
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
        title: "Vehicle " + vehicleIdWithoutAgency + ", " + vehicleData.route + " to " + vehicleData.destination,
        vehicleId: vehicleData.vehicleId,
        routeId: vehicleData.route,
        // key:COMPONENT_IDENTIFIER+"_"+vehicleData.vehicleId,
        key:COMPONENT_IDENTIFIER+"_"+vehicleData.vehicleId + "_"+vehicleData.longLat,
        position:vehicleData.longLat,
        icon: icon,
        id: COMPONENT_IDENTIFIER+"_"+vehicleData.vehicleId
    };


    // console.log("mapVehicle key: ",markerOptions.key,vehicleData)


    let out = (<Marker {...markerOptions}
                       eventHandlers={{click : ()=>{selectVehicle(vehicleData)}}}>
        <Popup key={vehicleData.vehicleId+"_"+vehicleData.longLat} className="map-popup vehicle-popup">
            <img src={vehicleData.strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
            <div className="popup-info">
                <span className="route">{vehicleData.route} {vehicleData.destination}</span>
                <span className="vehicle">Vehicle #{vehicleIdWithoutAgency}</span>
            </div>
        </Popup>
    </Marker>);

    return out
}
export default MapVehicleComponent;

