import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {MapContainer, Marker, Polyline, Popup, StyledMapType} from "react-leaflet";
import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import {GlobalStateContext} from "../util/globalState";
import vehicleComponent from "./vehicleComponent";
import MapRouteComponent from "./MapRouteComponent";
import MapStopComponent from "./MapStopComponent";

const mapComponent = (function() {

    return {
        getMap: function() {
            OBA.Util.log("generating map")

            const { state} = useContext(GlobalStateContext);
            const mapVehicleComponents = state.mapVehicleComponents;
            let mapRouteComponents = []
            let mapStopComponents = []
            {state.currentCard.searchMatches.forEach(route=>{
                if(route.type=="routeMatch"){
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
            })}

            // {state.currentCard.searchMatches.forEach(route=>{
            //     if(route.type=="routeMatch"){
            //         route.directions.forEach(dir=>{
            //             dir.mapRouteComponentData.forEach((datum)=>{
            //                 console.log("requesting new MapRouteComponent from: ",datum)
            //                 mapRouteComponents.push(new MapRouteComponent(datum))
            //             })
            //
            //         })
            //     }
            // })}
            console.log("map route components")
            console.log(mapRouteComponents)
            console.log("map vehicle components")
            console.log(mapVehicleComponents)
            console.log("map stop components")
            console.log(mapStopComponents)

            return (
                <React.Fragment>
                    <MapContainer
                        style={{height: '100vh', width: '100wh'}}
                        center={OBA.Config.defaultMapCenter}
                        zoom={16} scrollWheelZoom={true}

                    >
                        <ReactLeafletGoogleLayer
                            apiKey='AIzaSyA-PBbsL_sXOTfo2KbkVx8XkEfcIe48xzw'
                            type={'roadmap'}
                            styles={OBA.Config.mutedTransitStylesArray}
                        />
                        {mapRouteComponents}
                        {mapVehicleComponents}
                        {mapStopComponents}
                    </MapContainer>
                </React.Fragment>)
        }
    }
})();

export default mapComponent;