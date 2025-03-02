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





const MapVehicleElements = () :JSX.Element =>{
    const { state} = useContext(CardStateContext);
    const { vehicleState} = useContext(VehicleStateContext);
    const vehicleComponentsRef = useRef(new Map())
    const vehicleObjsRefs = useRef(new Map())
    const showFocusVehicle = useRef(true)

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
                    log.info(`processing vehicleDataForRoute`,vehicleDataForRoute)
                    log.info("vehicle object refs",vehicleObjsRefs.current)
                    vehicleDataForRoute.forEach(vehicleDatum=>{
                        if(vehicleObjsRefs.current.has(vehicleDatum.vehicleId) && typeof vehicleObjsRefs.current.get(vehicleDatum.vehicleId)!==undefined){
                            // update vehicle to be in new pos
                            vehicleObjsRefs.current.get(vehicleDatum.vehicleId).setLatLng(vehicleDatum.longLat)
                        }
                        else{
                            vehicleComponentsRef.current.set(vehicleDatum.vehicleId,
                                <MapVehicleComponent {...{vehicleDatum,vehicleRefs: vehicleObjsRefs}} key={vehicleDatum.vehicleId}/>)
                        }
                        mapVehicleComponents.push(vehicleComponentsRef.current.get(vehicleDatum.vehicleId))
                        // mapVehicleComponents.push(<MapVehicleComponent {...{vehicleDatum,vehicleRefs: vehicleObjsRefs}} key={vehicleDatum.vehicleId}/>)
                    });
                    //todo: remove vehicles that are no longer in the list
                    // vehicleObjsRefs.current.forEach((value, key) => {
                    //     if(!vehicleDataForRoute.some(vehicle=>vehicle.vehicleId===key)){
                    //         value.remove()
                    //         vehicleObjsRefs.current.delete(key)
                    //     }
                    // });
                    if (vehicleObjsRefs && typeof vehicleObjsRefs.current === "object"
                        && typeof vehicleObjsRefs.current.get === 'function'
                        && state.currentCard.type === CardType.VehicleCard)
                    {
                        let vehicleId = state.currentCard.datumId;
                        let vehicleDatum = vehicleObjsRefs.current.get(vehicleId)
                        if (typeof vehicleDatum !== 'undefined'
                            && vehicleDatum.getPopup()
                            && showFocusVehicle==true
                        ) {
                            log.info("map vehicle component markers popup value is",
                                vehicleDatum.getPopup(),
                                state.currentCard.datumId)
                            vehicleDatum.openPopup()
                        }
                    } else{
                        if(showFocusVehicle==false){
                            showFocusVehicle.current=true
                        }
                    }
                }
                log.info("map vehicle components", mapVehicleComponents)
            })
        }
    }
    catch (e) {
        log.error("error in vehicle element creation",e)
    }


    // useEffect(() => {
    //     // log.info("updating vehicle markers ",state.currentCard,vehicleObjsRefs.current)
    //         try {
    //             if (vehicleObjsRefs && typeof vehicleObjsRefs.current === "object"
    //                 && typeof vehicleObjsRefs.current.get === 'function'
    //                 && state.currentCard.type === CardType.VehicleCard) {
    //                 let vehicleId = state.currentCard.datumId;
    //                 let vehicleDatum = vehicleObjsRefs.current.get(vehicleId)
    //                 if (typeof vehicleDatum !== 'undefined'
    //                     && vehicleDatum.getPopup()
    //                     && showFocusVehicle==true
    //                 ) {
    //
    //                     // vehicleDatum.getPopup().on('remove', function() {
    //                     //     console.log("map vehicle component popup removed")
    //                     //     showFocusVehicle.current=false;
    //                     // });
    //                     // vehicleDatum.getPopup().on('add', function() {
    //                     //     console.log("map vehicle component popup opened")
    //                     //     showFocusVehicle.current=true;
    //                     // });
    //                     log.info("map vehicle component markers popup value is",
    //                         vehicleDatum.getPopup(),
    //                         state.currentCard.datumId)
    //                     vehicleDatum.openPopup()
    //                 }
    //             } else{
    //                 if(showFocusVehicle==false){
    //                     showFocusVehicle.current=true
    //                 }
    //             }
    //         }catch(e){log.error("caught vehicle datum error when using vehicleObjsRefs.current.get")}
    // },[state,vehicleState])


    return (
        <React.Fragment>
            {mapVehicleComponents}
        </React.Fragment>
    )
}


const loadPopup = (datumId,leafletRefObjs) :void=>{
    if(leafletRefObjs && typeof leafletRefObjs.current.get(datumId)!=='undefined'
        && leafletRefObjs.current.get(datumId)!==null
        && leafletRefObjs.current.get(datumId).getPopup()){
        leafletRefObjs.current.get(datumId).openPopup()
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
            // map.fitBounds(newBounds);
        }
        else if(state.currentCard.type===CardType.VehicleCard){
            log.info("vehicle route works here");
            let route = searchMatch;
            processRoute(route);
        }
        else if(state.currentCard.type===CardType.GeocodeCard) {
            searchMatch.routeMatches.forEach(match => {
                if(match.type === MatchType.RouteMatch){processRoute(match);}
                if(match.type === MatchType.StopMatch){
                    match.routeMatches.forEach(route => {
                        processRoute(route);
                    })
                }})
        }
        else if(state.currentCard.type===CardType.StopCard) {
            searchMatch.routeMatches.forEach(route => {
                processRoute(route);
            })
            let stopId =state.currentCard.datumId;
            stopsToNonConditionallyDisplay.set(stopId,mapStopComponents.current.get(stopId));
            mapStopComponentsToDisplay.delete(stopId)
        }
    })


    let mapRouteElementsLayerGroupRef : L.LayerGroup = null


    log.info("map stop component markers opening popup outside of effect",mapStopMarkers.current)
    const addStopPopup = () =>{
        log.info("map stop component markers opening popup ",mapStopMarkers,mapStopMarkers.current)
        if( state.currentCard.type===CardType.StopCard) {
            loadPopup(state.currentCard.datumId,mapStopMarkers)
        }
    }
    useEffect(() => {
        addStopPopup()
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
                addStopPopup()
                if(mapRouteElementsLayerGroupRef!==null) {
                    mapRouteElementsLayerGroupRef.addTo(map)
                }
            }
        }
    )


    log.info("map route components", mapRouteComponents);
    log.info("map stop components", mapStopComponents.current);
    log.info("map stop component markers", mapStopMarkers.current);

    return (
        <React.Fragment>
            <LayerGroup className={"MapRouteElements"}
                    ref = {r=>{mapRouteElementsLayerGroupRef=r}}>
                {Array.from(mapRouteComponents.values()).flat()}
            </LayerGroup>
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
    let [currentLat, currentLong,currentZoom] = [map.getCenter().lat,map.getCenter().lng,map.getZoom()]
    let latsMatch = currentLat+.1>lat && currentLat-.1<lat
    let longsMatch = currentLong+.1>long && currentLong-.1<long
    let zoomsMatch = zoom-.3<currentZoom && zoom+.3>currentZoom
    log.info("update map bounds and zoom?",latsMatch,longsMatch,zoomsMatch)

    if(latsMatch&&longsMatch&&zoomsMatch){ return }
    log.info("updating map bounds and zoom. current: ",currentLat,currentLong,currentZoom,"new: ",lat,long,zoom, "matches",latsMatch,longsMatch,zoomsMatch)
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
            console.log("vehicle card",state.currentCard)
            let vehicleId = state.currentCard.vehicleId;
            [lat, long] = state.currentCard.longlat;
            zoom = 16;
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

    useMapEvents({
        click() {
            log.info("running map click method")

        },
        zoomend() { // zoom event (when zoom animation ended)
            log.info("map zoom event end")
            setZoom(map.getZoom())

        }
    });

    log.info("show stops? ",map.getZoom() >= 15.1)
    // return(Zoom>15.1?<LayerGroup>stopComponents</LayerGroup>:<LayerGroup display={false}>stopComponents</LayerGroup>)
    return(Zoom>15.1?stopComponents:<LayerGroup display={false}>stopComponents</LayerGroup>)
    // return stopComponents
}

const MapEvents = () :boolean=> {
    log.info("generating map events")
    // let map = useMap()
    // useMapEvents({
    //     click() {
    //         log.info("running map click method")
    //
    //     },
    //     zoomend() { // zoom event (when zoom animation ended)
    //         // log.info("tryna use map")
    //         // log.info("map used")
    //         // const zoom = map.getZoom(); // get current Zoom of map
    //
    //     }
    // });

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