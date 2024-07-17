import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import busStroller from "../../img/icon/bus-stroller.svg";

const COMPONENT_IDENTIFIER = "mapVehicleComponent"

const selectVehicle = (vehicleData) =>{
    console.log("clicked on " + vehicleData.vehicleId)
}


function vehicleComponent  (vehicleData) {
    OBA.Util.trace('generating vehicle: ' + vehicleData.vehicleId)
    let imgDegrees = vehicleData.direction - vehicleData.direction%5
    OBA.Util.trace("img degrees" + imgDegrees)
    let scheduled = vehicleData.hasRealtime?"":"scheduled/"
    OBA.Util.trace(scheduled)
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    OBA.Util.trace("vehicleImageUrl:")
    OBA.Util.trace(vehicleImageUrl)
    let vehicleIdParts = vehicleData.vehicleId.split("_");
    let vehicleIdWithoutAgency = vehicleIdParts[1];


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
        key:COMPONENT_IDENTIFIER+"_"+vehicleData.longLat,
        position:vehicleData.longLat,
        icon: icon,
        id: COMPONENT_IDENTIFIER+"_"+vehicleData.longLat
    };




    let out = (<Marker {...markerOptions} eventHandlers={{click : ()=>{selectVehicle(vehicleData)}}}>
        <Popup key={vehicleData.longLat} className="map-popup vehicle-popup">
            <img src={vehicleData.strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
            <div className="popup-info">
                <span className="route">{vehicleData.route} {vehicleData.destination}</span>
                <span className="vehicle">Vehicle #{vehicleIdWithoutAgency}</span>
            </div>
        </Popup>
    </Marker>);

    return out
}
export default vehicleComponent;

