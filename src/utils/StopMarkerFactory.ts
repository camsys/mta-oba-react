import L, { map } from "leaflet";
import { StopMarker } from "./dataLayer";
import {useNavigation} from "../js/updateState/NavigationEffect.ts";
import log from 'loglevel';

export const createStopMarker = (
    stopDatum,
    selectStop: Function,
    popupOptions: L.PopupOptions,
    icon: L.Icon,
    zIndexOverride: number=0,
    mapRef: L.Map
) => {

    const marker = new StopMarker(stopDatum.longLat, {
        icon,
        zIndexOffset: zIndexOverride || -10,
        title: stopDatum.name,
        // keyboard: true,
    },stopDatum);

    // Note: Popup content and binding for stop markers are handled elsewhere;
    // this factory is responsible only for marker creation and click selection.

    marker.on("click", () => {
        selectStop(stopDatum);
    });

    marker.on("keypress", (e:L.LeafletKeyboardEvent) => {
        if (e.originalEvent.key === 'Enter') {
            selectStop(stopDatum);
        }
    });



    const setMapLatLngAndZoom = (map: L.Map, lat : number, lon :number,zoom:number,override:boolean) :void =>{
            let duration = .85
            log.info("Assessing zoom. based on requested values:",lat,lon,zoom)
            if(zoom===null){zoom = map.getZoom()}
            if(lat===null|lon===null|zoom===null){return}
            let mapWidth=map.getBounds().getEast()-map.getBounds().getWest();
            let mapHeight=map.getBounds().getNorth()-map.getBounds().getSouth();
            let [currentLat, currentLong,currentZoom] = [map.getCenter().lat,map.getCenter().lng,map.getZoom()]
            let latsMatch = currentLat+mapHeight/3>lat && currentLat-mapHeight/3<lat
            let latsOnScreen = currentLat+mapHeight>lat && currentLat-mapHeight<lat
            let lonsMatch = currentLong+mapWidth/3>lon && currentLong-mapWidth/3<lon
            let lonsOnScreen = currentLong+mapWidth>lon && currentLong-mapWidth<lon
            let zoomsMatch =  zoom-.3<currentZoom && zoom+.3>currentZoom
            let zoomSeemsIntentional = currentZoom>16
        
            let performZoom = override
            
            if(override){
                log.info("Assessing zoom. override requested, performing zoom")
            }
        
            if(zoomSeemsIntentional){
                log.info("Assessing zoom. zoom seems intentional, checking if new selection is on screen ",currentLat,currentLong,currentZoom,"new: ",lat,lon,zoom, "matches",lonsOnScreen,latsOnScreen)
                if(!(lonsOnScreen && latsOnScreen)){
                    performZoom = true
                }
            } else {
                log.info("Assessing zoom. update map bounds and zoom? current: ",currentLat,currentLong,currentZoom,"new: ",lat,lon,zoom, "matches",latsMatch,lonsMatch,zoomsMatch)
                if(!(latsMatch&&lonsMatch&&zoomsMatch)){ performZoom = true }
            }
            if(performZoom){
                log.info("Assessing zoom. updating map bounds and zoom")
                map.flyTo([lat, lon], zoom, {
                    animate: true,
                    duration: duration
                });
            }
        }

    // TODO: Refactor marker focus logic to use event bubbling (marker.fire).
    // Current mapRef tunneling is a shortcut to bypass Leaflet's focus 
    // event propagation limits and meet launch deadline.
    marker.on('add', () => {
        log.trace("Stop marker added to map, setting up focus event listener");
        const el = marker.getElement();
        log.trace("Marker element:", el);
        if (!el) return;
        log.info("Adding focus event listener to marker element");
        el.setAttribute('tabindex', '0');

        el.addEventListener('focus', (e) => {
            e.preventDefault();
            log.trace("Browser focus event fired on marker element");
            if (el.matches(':focus-visible')) {
                const pos = marker.getLatLng();
                log.info("Marker is focus-visible, checking if it's within map bounds", pos);
                setMapLatLngAndZoom(mapRef,pos.lat,pos.lng,null,true)
            }
        }, { passive: false });
    });
    return marker;
};