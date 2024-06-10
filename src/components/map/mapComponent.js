import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {MapContainer, Marker, Polyline, Popup, StyledMapType} from "react-leaflet";
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
            const mapVehicleComponents = state.mapVehicleComponents;
            const routeComponents = state.currentCard.routeComponents
            const mapStopComponents = state.mapStopComponents
            console.log("map route components")
            console.log(routeComponents)
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
                        {routeComponents}
                        {mapVehicleComponents}
                        {mapStopComponents}
                    </MapContainer>
                </React.Fragment>)
        }
    }
})();

export default mapComponent;