import {OBA} from "../../js/oba";
import React, {useContext} from "react";
import {Marker, Popup, useMap} from "react-leaflet";
import L from "leaflet";
import stopMapIcon from "../../img/icon/star_black.svg"
import stopPopupIcon from "../../img/icon/bus-stop.svg"
import {useHighlight} from "../util/MapHighlightingStateComponent.tsx";
import {useSearch} from "../../js/updateState/SearchEffect";

const COMPONENT_IDENTIFIER = "mapStopComponent"

function MapStopComponent  (stopDatum,zIndexOverride) {
    // console.log('generating MapStopComponent: ', stopDatum)


    let {getHighlightedId} = useHighlight()
    let highlightedId = getHighlightedId()
    // const { mapHighlightingState} = useContext(MapHighlightingStateContext);
    // if(mapHighlightingState.highlightedComponentId!=mapRouteComponentDatum.id){
    //     markerOptions.zIndexOffset=10
    // }


    var direction = stopDatum?.stopDirection;
    var directionKey = direction;

    if(directionKey === null) {
        directionKey = "unknown";
    }
    let stopImageUrl = "img/stop/stop-" + (directionKey==null? "unknown":directionKey) + ".png"
    let {search} = useSearch()

    let icon = L.icon({
        iconUrl: stopImageUrl,
        className: "svg-icon",
        iconSize: [27, 27],
        iconAnchor: [13, 13],
        popupAnchor: [0,0]
    })

    // console.log(stopDatum.longLat)
    var markerOptions = {
        position: stopDatum.longLat,
        icon: icon,
        zIndexOffset: zIndexOverride!==null?zIndexOverride:-10,
        title: stopDatum.name,
        stopId: stopDatum.id,
        // map: map,
        // visible: defaultVisibility,
        key: COMPONENT_IDENTIFIER+"_"+String(stopDatum.id),
        id: COMPONENT_IDENTIFIER+"_"+String(stopDatum.id)
    };



    let out = (
        <Marker {...markerOptions} eventHandlers={{click : ()=>{search(stopDatum.id)}}}>
            <Popup key={stopDatum.id} className="map-popup stop-popup">
                <img src={stopPopupIcon} alt="busstop icon" className="icon"/>
                <div className="popup-info">
                    <span className="name">{stopDatum.name}</span>
                    <span className="stop-code">{"Stopcode "+stopDatum.id}</span>
                </div>
            </Popup>
        </Marker>);

    return out
}
export default MapStopComponent;

