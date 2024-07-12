import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {MapContainer, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import {CardStateContext} from "../util/CardStateComponent";
import {VehicleStateContext} from "../util/VehicleStateComponent";
import vehicleComponent from "./vehicleComponent";
import MapRouteComponent from "./MapRouteComponent";
import MapStopComponent from "./MapStopComponent";
import siriEffect from "../../js/updateState/siriEffect";

const mapComponent = (function() {

    function updateVehicles(){
        const { state } = useContext(CardStateContext);
        siriEffect(state.currentCard.searchTerm);
    }
    return {
        getMap: function() {
            updateVehicles()
            OBA.Util.log("generating map")

            const { vehicleState} = useContext(VehicleStateContext);
            const { state} = useContext(CardStateContext);
            let mapRouteComponents = []
            let mapStopComponents = []
            let mapVehicleComponents = []
            const processRoute = (route)=>{
                console.log("processing route for map: ",route)
                console.log("vehicle state:", vehicleState)
                let routeId = route.routeId.split("_")[1]
                console.log("using abbreviated routeId ",routeId)
                let vehicleComponentsForRoute = vehicleState[routeId+"_mapVehicleComponents"]
                console.log("found these vehicle components", routeId,vehicleComponentsForRoute)
                if(vehicleComponentsForRoute!=null){
                    vehicleComponentsForRoute.forEach(x=>{mapVehicleComponents.push(x)});
                }
                route.directions.forEach(dir=>{
                    dir.mapRouteComponentData.forEach((datum)=>{
                        console.log("requesting new MapRouteComponent from: ",datum)
                        mapRouteComponents.push(new MapRouteComponent(datum))
                    })
                    dir.mapStopComponentData.forEach((datum)=>{
                        mapStopComponents.push(new MapStopComponent(datum))
                    })
                })
            }
            {state.currentCard.searchMatches.forEach(searchMatch=>{
                if(searchMatch.type=="routeMatch"){
                    let route = searchMatch
                    processRoute(route)
                }
                if(searchMatch.type=="geocodeMatch") {
                    searchMatch.nearbyRoutes.forEach(route => {processRoute(route)})
                }
                if(searchMatch.type=="stopMatch") {
                    searchMatch.routesAvailable.forEach(route => {processRoute(route)})
                }
            })}

            console.log("map route components")
            console.log(mapRouteComponents)
            console.log("map vehicle components")
            console.log(mapVehicleComponents)
            console.log("map stop components")
            console.log(mapStopComponents)

            const [Zoom, setZoom] = useState(11);


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

            return (
                <React.Fragment>
                    <MapContainer
                        style={{height: '100vh', width: '100wh'}}
                        center={OBA.Config.defaultMapCenter}
                        zoom={Zoom} scrollWheelZoom={true}

                    >
                        <ReactLeafletGoogleLayer
                            apiKey='AIzaSyA-PBbsL_sXOTfo2KbkVx8XkEfcIe48xzw'
                            type={'roadmap'}
                            styles={OBA.Config.mutedTransitStylesArray}
                        />
                        <MapEvents />

                        {mapRouteComponents}
                        {mapVehicleComponents}
                        { Zoom >= 15.1 ? mapStopComponents:null }
                    </MapContainer>
                </React.Fragment>)
        }
    }
})();

export default mapComponent;