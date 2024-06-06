import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import busStroller from "../../img/icon/bus-stroller.svg";


const baseVehicleIcon = L.icon({
    iconUrl: bus,
    className: "svg-icon",
    iconSize: [24, 40],
    iconAnchor: [12, 40]
});

const scheduledVehicleIcon = L.icon({
    iconUrl: bus,
    className: "svg-icon",
    iconSize: [24, 40],
    iconAnchor: [12, 40]
});

function vehicleComponent  (longLat,vid, route, destination, strollerVehicle,hasRealtime,direction) {
    let imgDegrees = direction - direction%5
    console.log(imgDegrees)
    let scheduled = hasRealtime?"":"scheduled/"
    console.log(scheduled)
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    // let vehicleImageUrl = "img/vehicle/vehicle-50.png"
    console.log("vehicleImageUrl:")
    console.log(vehicleImageUrl)
    let icon = L.icon({
        iconUrl: vehicleImageUrl,
        className: "svg-icon",
        iconSize: [24, 40],
        iconAnchor: [12, 40]
    })

    OBA.Util.trace('generating vehicle: ' + vid)
    let img = < img
    src = "vehicleImageUrl"
    alt = "vehicle image" />
    let icon2 = L.icon({iconUrl:vehicleImageUrl,html:img})


    let out = (<Marker position={longLat} key={longLat} icon={icon}>
        <Popup key={longLat} className="map-popup">
            <div className="popup-content">
                <img src={strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
                    <div className="bus-info">
                        <span className="route">{route} {destination}</span>
                        <span className="vehicle">Vehicle #{vid}</span>
                    </div>
            </div>
            <button className="close-popup-button">
                <span className="icon-wrap">
                    <img src="/img/icon/close-circle.svg" alt="Close Popup" className="icon"/>
                </span>
            </button>
        </Popup>
    </Marker>);

    return out
}
export default vehicleComponent;

