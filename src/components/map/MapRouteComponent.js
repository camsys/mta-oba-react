import React, {Component, useContext, useEffect, useState} from 'react';
import {Marker, Polyline, Popup} from "react-leaflet";

import {MapHighlightingStateContext} from "../util/MapHighlightingStateComponent";
import {CardStateContext} from "../util/CardStateComponent";

function MapRouteComponent  (mapRouteComponentDatum) {
    // console.log('generating mapRouteComponent: ', mapRouteComponentDatum)

    const { mapHighlightingState} = useContext(MapHighlightingStateContext);
    let highlightedId = mapHighlightingState.highlightedComponentId

    let polylineOptions = {
        key:mapRouteComponentDatum.id,
        positions:mapRouteComponentDatum.points,
        color:"#" + mapRouteComponentDatum.color,
        weight:3
    }
    if(highlightedId!==mapRouteComponentDatum.routeId){
        console.log("route ",mapRouteComponentDatum.routeId," and ",highlightedId,"do not match")
    } else{
        polylineOptions = {
            ... polylineOptions,
            key:mapRouteComponentDatum.id + "_highlighted",
            positions:mapRouteComponentDatum.points,
            color:"#" + mapRouteComponentDatum.color,
            opacity: 0.6,
            weight:10
        }
        console.log("hovering over route ",mapRouteComponentDatum.routeId,polylineOptions)
    }

    let out = (<Polyline {...polylineOptions}
    />)
    return out
}
export default MapRouteComponent;