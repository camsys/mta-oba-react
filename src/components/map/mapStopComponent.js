import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import stopMapIcon from "../../img/icon/star_black.svg"
import stopPopupIcon from "../../img/icon/bus-stop.svg"

const COMPONENT_IDENTIFIER = "mapStopComponent"

function mapStopComponent  (stopData) {
    OBA.Util.trace('generating mapStopComponent: ' + stopData.id)
    let icon = L.icon({
        iconUrl: stopMapIcon,
        className: "svg-icon",
        iconSize: [24, 40],
        iconAnchor: [12, 40]
    })
    let out = (<Marker position={stopData.longLat} key={stopData.id} icon={icon} id={COMPONENT_IDENTIFIER+"_"+stopData.id}>
        <Popup key={stopData.id} className="map-popup">
            <div className="popup-content">
                <img src={stopPopupIcon} alt="busstop icon" className="stopIcon"/>
                <div className="stop-info">
                    <span className="StopPopupStopName">{stopData.name}</span>
                    <span className="StopPopupStopCode">{"Stopcode "+stopData.id}</span>
                </div>
            </div>
            <button className="close-popup-button">
                <span className="stop-icon-wrap">
                    <img src="/img/icon/close-circle.svg" alt="Close Popup" className="icon"/>
                </span>
            </button>
        </Popup>
    </Marker>);

    return out
}
export default mapStopComponent;
