import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {MapContainer, Marker, Polyline, Popup} from "react-leaflet";
import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import {GlobalStateContext} from "../util/globalState";
import vehicleComponent from "./vehicleComponent";
import routeComponent from "./routeComponent";

const mapComponent = (function() {

    return {
        getMap: function() {
            OBA.Util.log("generating map")

            const { state} = useContext(GlobalStateContext);
            const vehicleMarkers = state.vehicleMarkers;
            const routeComponents = state.routeComponents
            const mapStopComponents = state.mapStopComponents
            console.log("map route components")
            console.log(routeComponents)
            console.log("map vehicle components")
            console.log(vehicleMarkers)
            console.log("map stop components")
            console.log(mapStopComponents)

            return (<React.Fragment> <MapContainer style={{height: '100vh', width: '100wh'}} center={OBA.Config.defaultMapCenter} zoom={15}
                                  scrollWheelZoom={true}>
                <ReactLeafletGoogleLayer apiKey='AIzaSyC65u47U8CJxTrmNcXDP2KwCYGxmQO3ZfU' type={'roadmap'}/>
                {routeComponents}
                {vehicleMarkers}
                {mapStopComponents}
            </MapContainer></React.Fragment>)
        }
    }
})();

export default mapComponent;