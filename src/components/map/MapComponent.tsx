import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {LayerGroup, MapContainer, Marker, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useRef, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import log from 'loglevel';
import L, {LatLngBounds} from "leaflet";
import bus from "../../img/icon/bus.svg";
import {CardStateContext, RoutesContext, StopsContext} from "../util/CardStateComponent.tsx";
import {vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import MapRouteComponent from "./MapRouteComponent";
import MapStopComponent from "./MapStopComponent";
import MapVehicleComponent from "./MapVehicleComponent";
import {
    CardType,
    MapRouteComponentInterface,
    MatchType,
    RouteMatch,
    StopInterface,
    StopMatch
} from "../../js/updateState/DataModels";
import {useHighlight} from "Components/util/MapHighlightingStateComponent";
import MapSearchedHereComponent from "./MapSearchedHereComponent";
import {v4 as uuidv4} from "uuid";


const createVehicleIcon = (vehicleDatum):L.Icon => {
    let scheduled = vehicleDatum.hasRealtime?"":"scheduled/"
    let imgDegrees = vehicleDatum.bearing - vehicleDatum.bearing%5
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    let icon = L.icon({
        iconUrl: vehicleImageUrl,
        className: "svg-icon",
        iconSize: [51,51],
        iconAnchor: [25,25],
        popupAnchor: [0,0]
    })
    return icon
}


const MapVehicleElements = () :JSX.Element =>{
    const { state} = useContext(CardStateContext);
    const { vehicleState} = useContext(VehicleStateContext);
    const vehicleComponentsRef = useRef(new Map())
    const vehicleObjsRefs = useRef(new Map())
    const showFocusVehicle = useRef(true)
    const lastCardWasNotVehicleView = useRef(state.currentCard.type !== CardType.VehicleCard)

    let routeIds = state.currentCard.routeIdList
    log.info("looking for vehicles from route ids: ",routeIds)
    let mapVehicleComponents = []
    // todo: if this was done just right it probably wouldn't hit the try catch
    try{
        if(routeIds!=null){
            [...routeIds].forEach(route=>{
                log.info("looking for vehicles from route id: ",route)
                log.info("vehicle state:", vehicleState)
                let routeId = route.split("_")[1]
                log.info("using abbreviated routeId ",routeId)
                let vehicleDataForRoute = vehicleState[routeId+vehicleDataIdentifier]
                if(vehicleDataForRoute!=null &&
                    vehicleObjsRefs &&
                    vehicleObjsRefs.current!=null && vehicleObjsRefs.current!=undefined
                    && typeof vehicleObjsRefs.current === "object"
                    && typeof vehicleObjsRefs.current.get === 'function'){
                    log.info(`MapVehicleElements: processing vehicleDataForRoute`,vehicleDataForRoute)
                    log.info("MapVehicleElements: vehicle object refs",vehicleObjsRefs.current)
                    vehicleDataForRoute.forEach(vehicleDatum=>{
                        let vehicleIcon = createVehicleIcon(vehicleDatum)
                        if(vehicleObjsRefs.current.has(vehicleDatum.vehicleId)
                            && vehicleObjsRefs.current.get(vehicleDatum.vehicleId)!==null
                            && typeof vehicleObjsRefs.current.get(vehicleDatum.vehicleId)!==undefined){
                            // update vehicle to be in new pos
                            let vehicle = vehicleObjsRefs.current.get(vehicleDatum.vehicleId);
                            vehicle.setLatLng(vehicleDatum.longLat)
                            vehicle.setIcon(vehicleIcon)
                            log.trace("updated vehicle position",vehicleDatum.vehicleId,vehicleObjsRefs.current.get(vehicleDatum.vehicleId))
                        }
                        else{
                            vehicleComponentsRef.current.set(vehicleDatum.vehicleId,
                                <MapVehicleComponent {...{vehicleDatum,vehicleRefs: vehicleObjsRefs,vehicleIcon}} key={vehicleDatum.vehicleId}/>)
                        }
                        mapVehicleComponents.push(vehicleComponentsRef.current.get(vehicleDatum.vehicleId))
                        // mapVehicleComponents.push(<MapVehicleComponent {...{vehicleDatum,vehicleRefs: vehicleObjsRefs}} key={vehicleDatum.vehicleId}/>)
                    });
                    vehicleObjsRefs.current.forEach((value, key) => {
                        if(!vehicleDataForRoute.has(key)){
                            vehicleObjsRefs.current.delete(key)
                        }
                    });
                    if (vehicleObjsRefs && typeof vehicleObjsRefs.current === "object"
                        && typeof vehicleObjsRefs.current.get === 'function'
                        && state.currentCard.type === CardType.VehicleCard
                        && lastCardWasNotVehicleView.current === true
                        && vehicleObjsRefs.current.get(state.currentCard.datumId)!=null
                        && vehicleObjsRefs.current.get(state.currentCard.datumId)!=undefined)
                    {
                        log.info("map vehicle component popup opening on load",
                            state.currentCard.datumId,
                            vehicleObjsRefs.current.get(state.currentCard.datumId))
                        let vehicleId = state.currentCard.datumId;
                        let vehicleObj = vehicleObjsRefs.current.get(vehicleId)
                        vehicleObj.openPopup()
                        log.info("map vehicle component popup opening on load is",vehicleObj)
                        lastCardWasNotVehicleView.current = false
                    }
                }
                log.info("map vehicle components", mapVehicleComponents)
            })
        }

        let map = useMap()
        useMapEvents(
            {
                zoomend() {
                    try {
                        if (vehicleObjsRefs && typeof vehicleObjsRefs.current === "object"
                            && typeof vehicleObjsRefs.current.get === 'function'
                            && state.currentCard.type === CardType.VehicleCard
                            && lastCardWasNotVehicleView.current === true
                            && vehicleObjsRefs.current.get(state.currentCard.datumId)!=null
                            && vehicleObjsRefs.current.get(state.currentCard.datumId)!=undefined)
                        {
                            log.info("map vehicle component markers zoomend",
                                state.currentCard.datumId,
                                vehicleObjsRefs.current.get(state.currentCard.datumId))
                            let vehicleId = state.currentCard.datumId;
                            let vehicleObj = vehicleObjsRefs.current.get(vehicleId)
                            vehicleObj.openPopup()
                            lastCardWasNotVehicleView.current = false
                            log.info("map vehicle component markers zoomend completed",vehicleObj)
                        }
                    } catch (e) {
                        log.error("error in vehicle element creation", e)
                    }
                }
            }
        )

        log.info("end of map vehicle elements creation, state, vehicleObjsRefs,lastCardWasNotVehicleView",state,vehicleObjsRefs.current,lastCardWasNotVehicleView)
        if(state.currentCard.type !== CardType.VehicleCard){
            lastCardWasNotVehicleView.current = true
        }
    }
    catch (e) {
        log.error("error in vehicle element creation",e)
    }


    return (
        <React.Fragment>
            {mapVehicleComponents}
        </React.Fragment>
    )
}


const loadPopup = (datumId,leafletRefObjs) :void=>{
    try{
        if(leafletRefObjs && typeof leafletRefObjs.current.get(datumId)!=='undefined'
            && leafletRefObjs.current.get(datumId)!==null
            && leafletRefObjs.current.get(datumId).getPopup()
            && leafletRefObjs.current.get(datumId).getPopup()!==undefined){
            leafletRefObjs.current.get(datumId).openPopup()
        }
    } catch (e) {
        log.error("error in loadPopup",e)
    }

}




const RoutesAndStops = () :JSX.Element=>{
    log.info("generating RoutesAndStops")

    const processRoute = (route : RouteMatch)=> {
        log.info("processing route for map: ", route)

        route.directions.forEach(dir => {
            dir.mapRouteComponentData.forEach((datum:MapRouteComponentInterface) => {
                // log.info("requesting new MapRouteComponent from: ", datum)
                mapRouteComponents.set(datum.id,<MapRouteComponent mapRouteComponentDatum ={datum} key={datum.id}/>)
            })
            dir.mapStopComponentData.forEach((datum:StopInterface) => {
                let stopId = datum.id;
                (! mapStopComponents.current.has(stopId))
                    ? mapStopComponents.current.set(
                        datum.id,<MapStopComponent stopDatum={datum} mapStopMarkers={mapStopMarkers} key={datum.id}/>)
                    : null
                mapStopComponentsToDisplay.set(datum.id,mapStopComponents.current.get(datum.id));

            })
        })
    }


    const stops = useContext(StopsContext);
    const routes = useContext(RoutesContext);
    const { state} = useContext(CardStateContext);

    let mapRouteComponents = new Map();
    const mapStopComponents = useRef(new Map());
    const mapStopMarkers = useRef(new Map()<string,Marker>);
    const searchedHereMarkers = useRef(new Map()<number,Marker>);
    const searchedHereComponents = useRef(new Map()<number,Marker>);
    let mapStopComponentsToDisplay = new Map();
    let stopsToNonConditionallyDisplay = new Map();


    log.info("map route components before", mapRouteComponents);
    log.info("map stop components before", mapStopComponents.current);
    log.info("map stop component markers before", mapStopMarkers.current);

    state.currentCard.searchMatches.forEach(searchMatch=>{
        log.info("adding routes for:",searchMatch)
        if(state.currentCard.type===CardType.RouteCard){
            let route = searchMatch
            processRoute(route)
            searchedHereComponents.current.clear();
            searchedHereMarkers.current.clear();
            // map.fitBounds(newBounds);
        }
        else if(state.currentCard.type===CardType.VehicleCard){
            log.info("vehicle route works here");
            let route = searchMatch;
            processRoute(route);
            searchedHereComponents.current.clear();
            searchedHereMarkers.current.clear();
        }
        else if(state.currentCard.type===CardType.GeocodeCard) {
            searchMatch.routeMatches.forEach(match => {
                if(match.type === MatchType.RouteMatch){processRoute(match);}
                if(match.type === MatchType.StopMatch){
                    match.routeMatches.forEach(route => {
                        processRoute(route);
                    })
                }
            })
            let latlon = [searchMatch.latitude,searchMatch.longitude]
            if(latlon !== null || latlon !== undefined){
                let key = uuidv4()
                searchedHereComponents.current.set(uuidv4(),<MapSearchedHereComponent latlon={latlon} key = {key} searchedHereMarkers={searchedHereMarkers}/>);
            }
        }
        else if(state.currentCard.type===CardType.StopCard) {
            searchMatch.routeMatches.forEach(route => {
                processRoute(route);
            })
            let stopId =state.currentCard.datumId;
            stopsToNonConditionallyDisplay.set(stopId,mapStopComponents.current.get(stopId));
            mapStopComponentsToDisplay.delete(stopId)
            searchedHereComponents.current.clear();
            searchedHereMarkers.current.clear();
        }
    })


    let mapRouteElementsLayerGroupRef : L.LayerGroup = null


    log.info("map stop component markers opening popup outside of effect",mapStopMarkers.current)
    const addStablePopups = () =>{
        try{
            log.info("map stop component markers opening popup ",mapStopMarkers,mapStopMarkers.current)
            if( state.currentCard.type===CardType.StopCard) {
                loadPopup(state.currentCard.datumId,mapStopMarkers)
            }
            searchedHereMarkers.current.forEach((marker, key) => {
                if(marker && typeof marker!=='undefined' && marker!==null
                    && marker.getPopup() && marker!==undefined){
                    marker.openPopup()
                }
            })
        } catch (e) {
            log.error("error adding stable popups",e)
        }


    }
    useEffect(() => {
        addStablePopups()
    },[state])

    let map = useMap()
    useMapEvents(
        {
            zoom() {
                // log.info("zoomstart mapRouteElementsLayerGroupRef",mapRouteElementsLayerGroupRef)
                if(mapRouteElementsLayerGroupRef!==null){
                    mapRouteElementsLayerGroupRef.removeFrom(map)
                }
            },
            zoomend() {
                addStablePopups()
                if(mapRouteElementsLayerGroupRef!==null) {
                    mapRouteElementsLayerGroupRef.addTo(map)
                }
            }
        }
    )


    log.info("map route components", Array.from(mapRouteComponents.values()).flat());
    log.info("map stop components", mapStopComponents.current);
    log.info("map stop component markers", mapStopMarkers.current);
    log.info("map \"searched here\" pin marker", Array.from(searchedHereComponents.current).flat());

    return (
        <React.Fragment>
            <LayerGroup className={"MapRouteElements"}
                    ref = {r=>{mapRouteElementsLayerGroupRef=r}}>
                {Array.from(mapRouteComponents.values()).flat()}
            </LayerGroup>
            {Array.from(searchedHereComponents.current).flat()}
            {ConditionallyDisplayStopComponents(Array.from(mapStopComponentsToDisplay.values()).flat())}
            {Array.from(stopsToNonConditionallyDisplay.values()).flat()}
            <LayerGroup>
                <Highlighted/>
            </LayerGroup>
        </React.Fragment>
    )
}

const Highlighted = () =>{
    let {getHighlightedId} = useHighlight()
    let highlightedId = getHighlightedId()

    const stops = useContext(StopsContext)
    const routes = useContext(RoutesContext)

    let stopDatum = stops.current[highlightedId]
    if(stopDatum!==null && typeof stopDatum !=='undefined'){
        return <MapStopComponent stopDatum={stopDatum} zIndexOverride={20}/>
    }
}

const setMapLatLngAndZoom = (duration :number , lat : number, long :number,zoom:number) :void =>{
    log.info("setting map bounds:",duration,lat,long,zoom)
    if(lat===null|long===null|zoom===null){return}
    let map = useMap()
    let mapWidth=map.getBounds().getEast()-map.getBounds().getWest();
    let mapHeight=map.getBounds().getNorth()-map.getBounds().getSouth();
    let [currentLat, currentLong,currentZoom] = [map.getCenter().lat,map.getCenter().lng,map.getZoom()]
    let latsMatch = currentLat+mapHeight/3>lat && currentLat-mapHeight/3<lat
    let longsMatch = currentLong+mapWidth/3>long && currentLong-mapWidth/3<long
    let zoomsMatch =  zoom-.3<currentZoom
    // let zoomsMatch = zoom-.3<currentZoom && zoom+.3>currentZoom
    log.info("update map bounds and zoom? current: ",currentLat,currentLong,currentZoom,"new: ",lat,long,zoom, "matches",latsMatch,longsMatch,zoomsMatch)

    if(latsMatch&&longsMatch&&zoomsMatch){ return }
    log.info("updating map bounds and zoom")
    map.flyTo([lat, long], zoom, {
        animate: true,
        duration: duration
    });
}

const setMapBounds = (bounds: LatLngBounds):void =>{
    let map = useMap()
    map.flyToBounds(bounds)
}

const HandleMapForVehiclesBoundsAndZoom = () :void=>{
    // todo: later have it just confirm it's in the bounding box
    const { vehicleState} = useContext(VehicleStateContext);
    const { state} = useContext(CardStateContext);
    if(state.currentCard.type!==CardType.VehicleCard){
        return
    }
    let duration = .85
    let zoom = 16;
    let [lat, long] = vehicleState[state.currentCard.routeIdList.values().next().value.split("_")[1]
    +vehicleDataIdentifier].get(state.currentCard.vehicleId).longLat;
    setMapLatLngAndZoom(duration,lat,long,zoom)
}

const getBoundsForRoute = (route:RouteMatch)=> {
    let collectedPoints = []
    route.directions.forEach(dir=> {
        dir.mapRouteComponentData.forEach(routeDir=>{
            if (typeof routeDir.points !== 'undefined') {
                let coordinates = routeDir.points;
                for (let k=0; k < coordinates.length; k++) {
                    let coordinate = coordinates[k];
                    collectedPoints.push(coordinate);
                }
            }
        })
    });
    let newBounds = L.latLngBounds(collectedPoints);
    log.info("made newbounds",newBounds)
    return newBounds
}

const HandleMapBoundsAndZoom = () : void=>{
    const { state} = useContext(CardStateContext);
    let duration = .85
    let [lat, long] = [null,null]
    let zoom = null


    state.currentCard.searchMatches.forEach(searchMatch=>{
        if(state.currentCard.type===CardType.RouteCard){
            setMapBounds(getBoundsForRoute(searchMatch))
            return
        }
        else if(state.currentCard.type===CardType.GeocodeCard) {
            [lat, long] = [searchMatch.latitude,searchMatch.longitude];
            zoom = 16;

        }
        else if(state.currentCard.type===CardType.StopCard) {
            [lat, long] = [searchMatch.latitude, searchMatch.longitude];
            zoom = 16;
        }
        else if(state.currentCard.type===CardType.VehicleCard) {
            let vehicleId = state.currentCard.vehicleId;
            [lat, long] = state.currentCard.longlat;
            zoom = 16;
            console.log("vehicle card zoom requested",state.currentCard, lat, long, zoom)
        }
    })
    if(state.currentCard.type===CardType.HomeCard)
        {
            [lat, long] = OBA.Config.defaultMapCenter;
            zoom = 11;
        }

    setMapLatLngAndZoom(duration,lat,long,zoom)
}

const ConditionallyDisplayStopComponents = (stopComponents) => {
    let map = useMap()
    let [Zoom,setZoom] = useState(map.getZoom().valueOf())
    const stopLayerRef = useRef(null)

    useMapEvents({
        click() {
            log.info("running map click method")

        },
        zoomend() { // zoom event (when zoom animation ended)
            log.info("map zoom event end",Zoom,map.getZoom())
            setZoom(map.getZoom())

        }
    });

    return(Zoom>15.1?stopComponents:null)

    // log.info("show stops? ",map.getZoom() >= 15.1)
    // return(Zoom>15.1?stopComponents:<LayerGroup display={false}>stopComponents</LayerGroup>)
}

const MapEvents = () :boolean=> {
    log.info("generating map events")
    let map = useMap()
    useMapEvents({
        popupopen(e) {

            const popupContent = e.popup.getElement();
            log.info("popup opened", popupContent);
            popupContent.addEventListener('click', function (event) {
                if (event.target.matches('.close-map')) {
                    // console.log('boop popup button clicked');
                    var mapWrap = document.querySelector('#map-wrap');
                    var mapToggle = document.querySelector('#map-toggle');
                    if (mapWrap) {
                    // window.console.log('boop map close');
                    mapWrap.classList.remove('open');
                    mapToggle.setAttribute('aria-expanded', 'false');
                    mapToggle.setAttribute('aria-label', 'Toggle Map Visibility (currently hidden)');
                    mapToggle.setAttribute('aria-pressed', 'false');
                    }
                }
            });
        },

        // popupclose(e) {
        //     const popupContent = e.popup.getElement();
        //     log.info("popup closed", e);
        // }
        
        // click() {
        //     log.info("running map click method")
    
        // },
        // zoomend() { // zoom event (when zoom animation ended)
        //     // const zoom = map.getZoom(); // get current Zoom of map
        // }
    });

    return false;
};


const CardChange = () =>{

}


export const MapComponent = () :JSX.Element => {
    log.info("generating map")

    let startingMapCenter = OBA.Config.defaultMapCenter;
    let startingZoom = 11;

    return (
        <React.Fragment>
            <MapContainer
                center={startingMapCenter}
                zoom={startingZoom}
                scrollWheelZoom={true}
                tabIndex={-1}
                id="map"
            >
                <ReactLeafletGoogleLayer
                    apiKey='AIzaSyA-PBbsL_sXOTfo2KbkVx8XkEfcIe48xzw'
                    type={'roadmap'}
                    styles={OBA.Config.mutedTransitStylesArray}
                />
                <MapEvents />
                <RoutesAndStops/>
                <MapVehicleElements/>
                <HandleMapBoundsAndZoom />
                {/*<HandleMapForVehiclesBoundsAndZoom/>*/}
            </MapContainer>
        </React.Fragment>
    );
};

// export default MapComponent;