import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {MapContainer, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import {CardStateContext, RoutesContext, StopsContext} from "../util/CardStateComponent.tsx";
import {vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import MapRouteComponent from "./MapRouteComponent";
import MapStopComponent from "./MapStopComponent";
import MapVehicleComponent from "./MapVehicleComponent";
import {CardType, MatchType} from "../../js/updateState/DataModels";






const MapVehicleElements = ({routeIds}) =>{
    const { state, setState} = useContext(CardStateContext);
    console.log("looking for vehicles from route ids: ",routeIds)
    let mapVehicleComponents = []
    if(routeIds!=null){
        [...routeIds].forEach(route=>{
            console.log("looking for vehicles from route id: ",route)
            const { vehicleState} = useContext(VehicleStateContext);
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

export const MapComponent = () => {

    const stops = useContext(StopsContext)
    const routes = useContext(RoutesContext)

    const processRoute = (route)=> {
        console.log("processing route for map: ", route)

        route.directions.forEach(dir => {
            dir.mapRouteComponentData.forEach((datum) => {
                console.log("requesting new MapRouteComponent from: ", datum)
                mapRouteComponents.set(datum.id,<MapRouteComponent mapRouteComponentDatum ={datum} key={datum.id}/>)
            })
            dir.mapStopComponentData.forEach((datum) => {
                let stopId = datum.id
                ! mapStopComponents.has(stopId)
                    ? mapStopComponents.set(datum.id,new MapStopComponent(datum))
                    : null
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

    OBA.Util.log("generating map")

    let startingMapCenter = OBA.Config.defaultMapCenter;
    let startingZoom = 11;

    const { state} = useContext(CardStateContext);
    const { vehicleState} = useContext(VehicleStateContext);
    let mapRouteComponents = new Map()
    let mapStopComponents = new Map()


    state.currentCard.searchMatches.forEach(searchMatch=>{
        console.log("adding routes for:",searchMatch)
        if(state.currentCard.type===CardType.RouteCard){
            let route = searchMatch
            processRoute(route)
            // map.fitBounds(newBounds);
        }
        else if(state.currentCard.type===CardType.VehicleCard){
            let route = searchMatch
            processRoute(route)
            startingZoom = 16
            // console.log("getting vehicle from ",vehicleState,
            //     state.currentCard.routeIdList[0].split("_")[1]+vehicleDataIdentifier,
            //     state.currentCard.vehicleId)
            startingMapCenter = vehicleState
                [state.currentCard.routeIdList[0].split("_")[1]+vehicleDataIdentifier]
                .get(state.currentCard.vehicleId).longLat
            // map.fitBounds(newBounds);
        }
        else if(state.currentCard.type===CardType.GeocodeCard) {
            startingMapCenter = [searchMatch.latitude,searchMatch.longitude]
            startingZoom = 16
            searchMatch.routeMatches.forEach(match => {
                if(match.type === MatchType.RouteMatch){processRoute(match)}
                if(match.type === MatchType.StopMatch){
                    match.routeMatches.forEach(route => {
                        processRoute(route)
                    })
                }})
        }
        else if(state.currentCard.type===CardType.StopCard) {
            startingMapCenter = [searchMatch.latitude, searchMatch.longitude]
            startingZoom = 16
            searchMatch.routeMatches.forEach(route => {
                processRoute(route)
            })
        }
    })

    console.log("map route components", mapRouteComponents)
    console.log("map stop components", mapStopComponents)
    console.log("map center set to: ",startingMapCenter)


    let routeIds = state.currentCard.routeIdList



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
                {Array.from(mapRouteComponents.values()).flat()}
                {Zoom >= 15.1 ? Array.from(mapStopComponents.values()).flat() : null}
                <MapVehicleElements routeIds={routeIds}/>
            </MapContainer>
        </React.Fragment>
    );
};

// export default MapComponent;