import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {MapContainer, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import {CardStateContext} from "../util/CardStateComponent";
import {vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import MapRouteComponent from "./MapRouteComponent";
import MapStopComponent from "./MapStopComponent";
import {MapHighlightingStateContext} from "../util/MapHighlightingStateComponent";
import MapVehicleComponent from "./MapVehicleComponent";






const MapVehicleElements = ({routeIds}) =>{
    const { state, setState} = useContext(CardStateContext);
    console.log("looking for vehicles from route ids: ",routeIds)
    let mapVehicleComponents = []
    if(routeIds!=null){
        routeIds.forEach(route=>{
            console.log("looking for vehicles from route id: ",route)
            const { vehicleState} = useContext(VehicleStateContext);
            console.log("vehicle state:", vehicleState)
            let routeId = route.split("_")[1]
            console.log("using abbreviated routeId ",routeId)
            let vehicleDataForRoute = vehicleState[routeId+vehicleDataIdentifier]
            if(vehicleDataForRoute!=null){
                console.log(`processing {vehicleDataForRoute}`,vehicleDataForRoute)
                vehicleDataForRoute.forEach(datum=>{mapVehicleComponents.push(new MapVehicleComponent(datum,state, setState))});
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

export const MapComponent = () => {

    OBA.Util.log("generating map")

    let startingMapCenter = OBA.Config.defaultMapCenter;
    let startingZoom = 11;

    const { state} = useContext(CardStateContext);
    let mapRouteComponents = []
    let mapStopComponents = []



    const processRoute = (route)=>{
        console.log("processing route for map: ",route)

        route.directions.forEach(dir=>{
            dir.mapRouteComponentData.forEach((datum)=>{
                console.log("requesting new MapRouteComponent from: ",datum)
                mapRouteComponents.push(new MapRouteComponent(datum))
            })
            dir.mapStopComponentData.forEach((datum)=>{
                mapStopComponents.push(new MapStopComponent(datum))
            })
        })

        console.log("making collectedPoints")
        let collectedPoints = []
        route.directions.forEach(dir=> {
            dir.mapRouteComponentData.forEach(routeDir=>{
                if (typeof routeDir.points !== 'undefined') {
                    let coordinates = routeDir.points;
                    for (let k=0; k < coordinates.length; k++) {
                        let coordinate = coordinates[k];
                        console.log("adding cord to collectedPoints",coordinate)
                        collectedPoints.push(coordinate);
                    }
                }
            })
        });
        let newBounds = L.latLngBounds(collectedPoints);
        console.log("made newbounds",newBounds)
        return newBounds
    }
    {state.currentCard.searchMatches.forEach(searchMatch=>{
        console.log("adding routes for:",searchMatch)
        if(searchMatch.type=="routeMatch"){
            let route = searchMatch
            processRoute(route)
            // map.fitBounds(newBounds);
        }
        if(searchMatch.type=="geocodeMatch") {
            startingMapCenter = [searchMatch.latitude,searchMatch.longitude]
            startingZoom = 16
            searchMatch.routeMatches.forEach(route => {processRoute(route)})
        }
        if(searchMatch.type=="stopMatch") {
            startingMapCenter = [searchMatch.latitude,searchMatch.longitude]
            startingZoom = 16
            searchMatch.routeMatches.forEach(route => {processRoute(route)})
        }
    })}

    console.log("map route components", mapRouteComponents)
    console.log("map stop components", mapStopComponents)
    console.log("map center set to: ",startingMapCenter)


    let routeIds = state.currentCard.routeIdList

    const MapEvents = () => {
        let map = useMap()
        useMapEvents({
            zoomend() { // zoom event (when zoom animation ended)
                console.log("tryna use map")
                console.log("map used")
                const zoom = map.getZoom(); // get current Zoom of map
                setZoom(zoom);
            },
        });
        return false;
    };

    const [Zoom, setZoom] = useState(startingZoom);
    const [mapCenter, setMapCenter] = useState(startingMapCenter)

    return (
        <React.Fragment>
            <MapContainer
                style={{ height: '100vh', width: '100wh' }}
                center={mapCenter}
                zoom={Zoom}
                scrollWheelZoom={true}
            >
                <ReactLeafletGoogleLayer
                    apiKey='AIzaSyA-PBbsL_sXOTfo2KbkVx8XkEfcIe48xzw'
                    type={'roadmap'}
                    styles={OBA.Config.mutedTransitStylesArray}
                />
                <MapEvents />
                {mapRouteComponents}
                {Zoom >= 15.1 ? mapStopComponents : null}
                <MapVehicleElements routeIds={routeIds}/>
            </MapContainer>
        </React.Fragment>
    );
};

// export default MapComponent;