import log from 'loglevel';
import React, {useContext, useEffect} from "react";
import {Marker, Popup, useMap} from "react-leaflet";
import L from "leaflet";
import stopMapIcon from "../../img/icon/star_black.svg"
import stopPopupIcon from "../../img/icon/bus-stop.svg"
import {useHighlight} from "../util/MapHighlightingStateComponent.tsx";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import {CardType, StopInterface} from "../../js/updateState/DataModels";
import {CardStateContext} from "../util/CardStateComponent";

const COMPONENT_IDENTIFIER = "mapStopComponent"


function MapStopComponent  ({stopDatum, mapStopMarkers, zIndexOverride}:
                                {stopDatum:StopInterface,
                                mapStopMarkers:React.MutableRefObject<Map<string,L.Marker>>,
                                zIndexOverride:number}) : JSX.Element{
    // log.info('generating MapStopComponent: ', stopDatum,mapStopMarkers,zIndexOverride)


    let {getHighlightedId} = useHighlight()
    let highlightedId = getHighlightedId()


    let direction = stopDatum?.stopDirection;
    let directionKey = direction;

    if(directionKey === null) {
        directionKey = "unknown";
    }
    let stopImageUrl = "img/stop/stop-" + (directionKey==null? "unknown":directionKey) + ".png"
    if(zIndexOverride){stopImageUrl = "img/stop/stop-" + (directionKey==null? "unknown":directionKey) + "-active.png"}
    let {search} = useNavigation()

    let icon = L.icon({
        iconUrl: stopImageUrl,
        className: "svg-icon",
        iconSize: zIndexOverride?[40,40]:[27, 27],
        iconAnchor: zIndexOverride?[20,20]:[13, 13],
        popupAnchor: [0,0]
    })

    // log.info(stopDatum.longLat)
    var markerOptions = {
        position: stopDatum.longLat,
        icon: icon,
        zIndexOffset: zIndexOverride!==null?zIndexOverride:-10,
        title: stopDatum.name,
        stopId: stopDatum.id,
        // map: map,
        // visible: defaultVisibility,
        key: COMPONENT_IDENTIFIER+"_"+String(stopDatum.id),
        id: COMPONENT_IDENTIFIER+"_"+String(stopDatum.id),
        keyboard:false
    };
    // log.info('generating MapStopComponent: ', stopDatum,markerOptions,mapStopMarkers,zIndexOverride)

    let popupOptions = {
        autoPan: false,
        keepInView: false
    }

    const { state} = useContext(CardStateContext);

    let out = (
        <Marker {...markerOptions}
                eventHandlers={{click : ()=>{search(stopDatum.id)}}}
                ref={r=>
                {
                    // log.info("ref for stop component",stopDatum,r);
                    typeof mapStopMarkers!=='undefined'
                        ?mapStopMarkers.current.set(stopDatum.id,r):null
                }}
                tabIndex={-1}
                >
            <Popup key={stopDatum.id} className="map-popup stop-popup" tabIndex={-1} {...popupOptions}>
                <img src={stopPopupIcon} alt="busstop icon" className="icon"/>
                <div className="popup-info">
                    <span className="name">{stopDatum.name}</span>
                    <span className="stop-code">{"Stopcode "+stopDatum.id.split("_")[1]}</span>
                    <button className="view-full close-map" aria-label="view full stop details">
                        View Stop Details
                    </button>
                </div>
            </Popup>
        </Marker>);

    return out
}
export default MapStopComponent;

