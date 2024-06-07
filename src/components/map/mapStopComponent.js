import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import stopMapIcon from "../../img/icon/star_black.svg"
import stopPopupIcon from "../../img/icon/bus-stop.svg"

const COMPONENT_IDENTIFIER = "mapStopComponent"

function mapStopComponent  (stopData) {
    OBA.Util.trace('generating mapStopComponent: ' + stopData.id)
    // let stopImageUrl = "img/stop/stop-" + stopData?.directionKey==null? "unknown":stopData.directionKey + ".png"
    let stopImageUrl = "img/stop/stop-" + "unknown" + ".png"
    console.log(stopImageUrl)

    let icon = L.icon({
        iconUrl: stopImageUrl,
        className: "svg-icon",
        iconSize: [21, 21],
        iconAnchor: [0, 0]
    })



    let out = (
        <Marker position={stopData.longLat} key={COMPONENT_IDENTIFIER+"_"+stopData.id} icon={icon} id={COMPONENT_IDENTIFIER+"_"+stopData.id}>
            <Popup key={stopData.id} className="map-popup">
                <img src={stopPopupIcon} alt="busstop icon" className="icon"/>
                <div className="popup-info">
                    <span className="name">{stopData.name}</span>
                    <span className="stop-code">{"Stopcode "+stopData.id}</span>
                </div>
            </Popup>
    </Marker>);

    return out
}
export default mapStopComponent;

