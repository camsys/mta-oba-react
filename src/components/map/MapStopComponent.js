import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import stopMapIcon from "../../img/icon/star_black.svg"
import stopPopupIcon from "../../img/icon/bus-stop.svg"

const COMPONENT_IDENTIFIER = "mapStopComponent"

function MapStopComponent  (stopData) {
    OBA.Util.trace('generating mapStopComponent: ' + stopData.id)



    // let zoom = map.getZoom()
    let zoom = 10
    var defaultVisibility = ( zoom < 16) ? false : true;


    var direction = stop?.stopDirection;
    var directionKey = direction;

    if(directionKey === null) {
        directionKey = "unknown";
    }
    let stopImageUrl = "img/stop/stop-" + (directionKey==null? "unknown":directionKey) + ".png"
    // let stopImageUrl = "img/stop/stop-" + "unknown" + ".png"
    // console.log(stopImageUrl)

    let icon = L.icon({
        iconUrl: stopImageUrl,
        className: "svg-icon",
        iconSize: [27, 27],
        iconAnchor: [13, 13],
        popupAnchor: [0,0]
    })

    // console.log(stopData.longLat)
    var markerOptions = {
        position: stopData.longLat,
        icon: icon,
        zIndex: 1,
        title: stopData.name,
        stopId: stopData.stopId,
        // map: map,
        // visible: defaultVisibility,
        key: COMPONENT_IDENTIFIER+"_"+stopData.id,
        id: COMPONENT_IDENTIFIER+"_"+stopData.id
    };

    let out = (
        <Marker {...markerOptions}>
            <Popup key={stopData.id} className="map-popup stop-popup">
                <img src={stopPopupIcon} alt="busstop icon" className="icon"/>
                <div className="popup-info">
                    <span className="name">{stopData.name}</span>
                    <span className="stop-code">{"Stopcode "+stopData.id}</span>
                </div>
            </Popup>
        </Marker>);

    return out
}
export default MapStopComponent;

