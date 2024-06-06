import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import busStroller from "../../img/icon/bus-stroller.svg";


function vehicleComponent  (vehicleData) {
    OBA.Util.trace('generating vehicle: ' + vehicleData.vehicleId)
    let imgDegrees = vehicleData.direction - vehicleData.direction%5
    OBA.Util.trace("img degrees" + imgDegrees)
    let scheduled = vehicleData.hasRealtime?"":"scheduled/"
    OBA.Util.trace(scheduled)
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    OBA.Util.trace("vehicleImageUrl:")
    OBA.Util.trace(vehicleImageUrl)
    let icon = L.icon({
        iconUrl: vehicleImageUrl,
        className: "svg-icon",
        iconSize: [24, 40],
        iconAnchor: [12, 40]
    })
    let out = (<Marker position={vehicleData.longLat} key={vehicleData.longLat} icon={icon}>
        <Popup key={vehicleData.longLat} className="map-popup">
            <img src={vehicleData.strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
            <div className="popup-info">
                <span className="route">{vehicleData.route} {vehicleData.destination}</span>
                <span className="vehicle">Vehicle #{vehicleData.vehicleId}</span>
            </div>
        </Popup>
    </Marker>);

    return out
}
export default vehicleComponent;

