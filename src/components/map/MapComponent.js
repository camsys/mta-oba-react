import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {LayerGroup, MapContainer, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useRef, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import {CardStateContext, RoutesContext, StopsContext} from "../util/CardStateComponent.tsx";
import {vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import MapRouteComponent from "./MapRouteComponent";
import MapStopComponent from "./MapStopComponent";
import MapVehicleComponent from "./MapVehicleComponent";
import {CardType, MatchType, StopMatch} from "../../js/updateState/DataModels";
import {useHighlight} from "Components/util/MapHighlightingStateComponent";






const MapVehicleElements = () =>{
    const { state} = useContext(CardStateContext);
    const { vehicleState} = useContext(VehicleStateContext);


    let routeIds = state.currentCard.routeIdList
    console.log("looking for vehicles from route ids: ",routeIds)
    let mapVehicleComponents = []
    if(routeIds!=null){
        [...routeIds].forEach(route=>{
            console.log("looking for vehicles from route id: ",route)
            console.log("vehicle state:", vehicleState)
            let routeId = route.split("_")[1]
            console.log("using abbreviated routeId ",routeId)
            let vehicleDataForRoute = vehicleState[routeId+vehicleDataIdentifier]
            if(vehicleDataForRoute!=null){
                console.log(`processing vehicleDataForRoute`,vehicleDataForRoute)
                vehicleDataForRoute.forEach(vehicleDatum=>{mapVehicleComponents.push(<MapVehicleComponent {...{vehicleDatum}} key={vehicleDatum.vehicleId}/>)});
            }
            console.log("map vehicle components", mapVehicleComponents)
        })
    }
    return (
        <React.Fragment>
            {mapVehicleComponents}
        </React.Fragment>
    )
}





const RoutesAndStops = () =>{
    console.log("generating RoutesAndStops")

    const processRoute = (route)=> {
        console.log("processing route for map: ", route)

        route.directions.forEach(dir => {
            dir.mapRouteComponentData.forEach((datum) => {
                // console.log("requesting new MapRouteComponent from: ", datum)
                mapRouteComponents.set(datum.id,<MapRouteComponent mapRouteComponentDatum ={datum} key={datum.id}/>)
            })
            dir.mapStopComponentData.forEach((datum) => {
                let stopId = datum.id;
                ! mapStopComponents.current.has(stopId)
                    ? mapStopComponents.current.set(
                        datum.id,<MapStopComponent stopDatum={datum} mapStopMarkers={mapStopMarkers}/>)
                    : null
                mapStopComponentsToDisplay.set(datum.id,mapStopComponents.current.get(datum.id));
            })
        })
    }
    const getBoundsForRoute = (route)=> {
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
        console.log("made newbounds",newBounds)
        return newBounds
    }

    const stops = useContext(StopsContext);
    const routes = useContext(RoutesContext);
    const { state} = useContext(CardStateContext);

    let mapRouteComponents = new Map();
    let mapStopComponents = useRef(new Map());
    let mapStopMarkers = useRef(new Map());
    let mapStopComponentsToDisplay = new Map();

    state.currentCard.searchMatches.forEach(searchMatch=>{
        console.log("adding routes for:",searchMatch)
        if(state.currentCard.type===CardType.RouteCard){
            let route = searchMatch
            processRoute(route)
            // map.fitBounds(newBounds);
        }
        else if(state.currentCard.type===CardType.VehicleCard){
            console.log("vehicle route works here");
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
            let stopId =state.currentCard.datumId
            mapStopComponentsToDisplay.set(stopId,mapStopComponents.current.get(stopId));
        }
    })

    console.log("map route components", mapRouteComponents)
    console.log("map stop components", mapStopComponents.current)
    console.log("map stop component markers", mapStopMarkers.current)

    return (
        <React.Fragment>
            <LayerGroup>
                {Array.from(mapRouteComponents.values()).flat()}
            </LayerGroup>
            <LayerGroup>
                {StopComponents(Array.from(mapStopComponentsToDisplay.values()).flat())}
            </LayerGroup>
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

const setMapBoundsAndZoom = (duration, lat, long,zoom) =>{
    console.log("setting map bounds:",duration,lat,long,zoom)
    if(lat===null|long===null|zoom===null){return}
    let map = useMap()
    let [currentLat, currentLong,currentZoom] = [map.getCenter().lat,map.getCenter().lng,map.getZoom()]
    let latsMatch = currentLat+.1<lat && currentLat-.1>lat
    let longsMatch = currentLong+.1<long && currentLong-.1>long
    let zoomsMatch = zoom-.3<currentZoom && zoom+.3>currentZoom
    console.log("update map bounds and zoom?",latsMatch,longsMatch,zoomsMatch)

    //todo: add a lil function so this is skipped if there's no meaningful change
    if(latsMatch&&longsMatch&&zoomsMatch){ return }
    map.flyTo([lat, long], zoom, {
        animate: true,
        duration: duration
    });
}

const HandleMapForVehiclesBoundsAndZoom = () =>{
    // todo: later have it just confirm it's in the bounding box
    const { vehicleState} = useContext(VehicleStateContext);
    const { state} = useContext(CardStateContext);
    if(state.currentCard.type!==CardType.VehicleCard){
        return
    }
    let duration = 1.15
    let zoom = 16;
    let [lat, long] = vehicleState[state.currentCard.routeIdList.values().next().value.split("_")[1]
    +vehicleDataIdentifier].get(state.currentCard.vehicleId).longLat;
    setMapBoundsAndZoom(duration,lat,long,zoom)
}

const HandleMapBoundsAndZoom = () =>{
    const { state} = useContext(CardStateContext);
    let duration = 1.15
    let [lat, long] = [null,null]
    let zoom = null


    state.currentCard.searchMatches.forEach(searchMatch=>{
        if(state.currentCard.type===CardType.RouteCard){
            // map.fitBounds(newBounds);
        }
        else if(state.currentCard.type===CardType.GeocodeCard) {
            [lat, long] = [searchMatch.latitude,searchMatch.longitude];
            zoom = 16;

        }
        else if(state.currentCard.type===CardType.StopCard) {
            [lat, long] = [searchMatch.latitude, searchMatch.longitude];
            zoom = 16;
        }
    })
    if(state.currentCard.type===CardType.HomeCard)
        {
            [lat, long] = OBA.Config.defaultMapCenter;
            zoom = 11;
        }

    setMapBoundsAndZoom(duration,lat,long,zoom)
}

const StopComponents = (stopComponents) => {
    let map = useMap()
    let [Zoom,setZoom] = useState(map.getZoom().valueOf())

    useMapEvents({
        click() {
            console.log("running map click method")

        },
        zoomend() { // zoom event (when zoom animation ended)
            console.log("map zoom event end")
            setZoom(map.getZoom())
        }
    });
    console.log("show stops? ",map.getZoom() >= 15.1)
    return(Zoom>15.1?stopComponents:null)
}

const MapEvents = () => {
    console.log("generating map events")
    let map = useMap()
    useMapEvents({
        click() {
            console.log("running map click method")

        },
        zoomend() { // zoom event (when zoom animation ended)
            // console.log("tryna use map")
            // console.log("map used")
            // const zoom = map.getZoom(); // get current Zoom of map

        }
    });

    return false;
};


const CardChange = () =>{

}


export const MapComponent = () => {
    OBA.Util.log("generating map")

    let startingMapCenter = OBA.Config.defaultMapCenter;
    let startingZoom = 11;

    return (
        <React.Fragment>
            <MapContainer
                style={{ height: '100vh', width: '100wh' }}
                center={startingMapCenter}
                zoom={startingZoom}
                scrollWheelZoom={true}
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