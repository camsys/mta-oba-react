import L, { map } from "leaflet";
import bus from "../img/icon/bus.svg";
import busStroller from "../img/icon/bus-stroller.svg";
import {VehicleRtInterface} from "../js/updateState/DataModels";
import log from 'loglevel';

export const createVehicleMarker = (
    vehicleDatum: VehicleRtInterface,
    icon: L.Icon,
    popupOptions: L.PopupOptions,
    zIndexOverride: number = 3,
    mapRef: L.Map
): L.Marker => {
    const vehicleIdParts = vehicleDatum.vehicleId.split("_");
    const vehicleIdWithoutAgency = vehicleIdParts[1];

    const marker = L.marker(vehicleDatum.longLat, {
        icon: icon,
        zIndexOffset: zIndexOverride,
        title: `Vehicle ${vehicleIdWithoutAgency}, ${vehicleDatum.routeId} to ${vehicleDatum.destination}`,
        keyboard: true,
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
        log.trace("Vehicle marker added to map, setting up focus event listener");

        const el = marker.getElement();
        log.info("Vehicle marker added to map, Marker element:", el);
        if (!el) return;
        log.info("Vehicle marker added to map, Adding focus event listener to marker element");

        el.addEventListener('focus', (e) => {
            e.preventDefault();
            log.trace("Browser focus event fired on vehicle marker element");

            // Now check :focus-visible on the DOM element
            if (el.matches(':focus-visible')) {
                const pos = marker.getLatLng();
                log.info("Vehicle marker is focus-visible, checking if it's within map bounds", pos, mapRef.getBounds());
                setMapLatLngAndZoom(mapRef,pos.lat,pos.lng,null,true)
            }
        }, { passive: false });
    });


    return marker;
};