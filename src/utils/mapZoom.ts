import L from 'leaflet';
import log from 'loglevel';


export const isCenteredOn = (map: L.Map, lat : number, lon :number,zoom:number) :boolean =>{
    log.info("Assessing zoom. based on requested values:",lat,lon,zoom)
    if(zoom===null){zoom = map.getZoom()}
    if(lat===null|lon===null|zoom===null){return false}
    let mapWidth=map.getBounds().getEast()-map.getBounds().getWest();
    let mapHeight=map.getBounds().getNorth()-map.getBounds().getSouth();
    let [currentLat, currentLong,currentZoom] = [map.getCenter().lat,map.getCenter().lng,map.getZoom()]
    let latsMatch = currentLat+mapHeight/3>lat && currentLat-mapHeight/3<lat
    let latsOnScreen = currentLat+mapHeight>lat && currentLat-mapHeight<lat
    let lonsMatch = currentLong+mapWidth/3>lon && currentLong-mapWidth/3<lon
    let lonsOnScreen = currentLong+mapWidth>lon && currentLong-mapWidth<lon
    let zoomsMatch =  zoom-.3<currentZoom && zoom+.3>currentZoom
    let zoomSeemsIntentional = currentZoom>16
    if(zoomSeemsIntentional){
        log.info("Assessing zoom. zoom seems intentional, checking if new selection is on screen ",currentLat,currentLong,currentZoom,"new: ",lat,lon,zoom, "matches",lonsOnScreen,latsOnScreen)
        if(!(lonsOnScreen && latsOnScreen)){
            return true
        }
    } else {
        log.info("Assessing zoom. update map bounds and zoom? current: ",currentLat,currentLong,currentZoom,"new: ",lat,lon,zoom, "matches",latsMatch,lonsMatch,zoomsMatch)
        if(!(latsMatch&&lonsMatch&&zoomsMatch)){ return false }
    }
    return true
}

export const setMapLatLngAndZoom = (map: L.Map, lat : number, lon :number,zoom:number,override:boolean) :void =>{
    let duration = .85

    if(zoom===null){zoom = map.getZoom()}
    if(lat===null|lon===null|zoom===null){return}
    
    if(override){
        log.info("Assessing zoom. override requested, performing zoom")
    } else if(!isCenteredOn(map,lat,lon,zoom)){
        log.info("Assessed zoom and latlong, zoom is intentional or onscreen. skipping zoom")
        return
    }
    log.info("Assessed zoom. updating map bounds and zoom")
    map.flyTo([lat, lon], zoom, {
        animate: true,
        duration: duration
    });
}