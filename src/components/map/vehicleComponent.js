import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";

const baseVehicleIcon = L.icon({
    iconUrl: bus,
    className: "svg-icon",
    iconSize: [24, 40],
    iconAnchor: [12, 40]
});

function vehicleComponent  (longLat,vid) {
    OBA.Util.trace('generating vehicle: ' + vid)
    let out = (<Marker position={longLat} key={longLat} icon={baseVehicleIcon}>
        <Popup key={longLat}>
            A popup at {longLat}. Bus # {vid}.
        </Popup>
    </Marker>)
    return out
}
export default vehicleComponent;

