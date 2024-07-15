import React, {Component, useContext, useEffect, useState} from 'react';
import {Marker, Polyline, Popup} from "react-leaflet";

import {MapHighlightingStateContext} from "../util/MapHighlightingStateComponent";
import {CardStateContext} from "../util/CardStateComponent";

function MapRouteComponent  (mapRouteComponentDatum, highlightedId) {
    // console.log('generating mapRouteComponent: ', mapRouteComponentDatum)

    const { mapHighlightingState} = useContext(MapHighlightingStateContext);
    const { state} = useContext(CardStateContext);

    const [weight, setWeight] = useState(10);
    useEffect(() => {
        if (state.highlightedComponentId === mapRouteComponentDatum.routeId) {
            setWeight(100);
        } else {
            setWeight(10);
        }
    }, [state.highlightedComponentId, mapRouteComponentDatum.routeId]);

    let polylineOptions = {
        key:mapRouteComponentDatum.id,
        positions:mapRouteComponentDatum.points,
        color:"#" + mapRouteComponentDatum.color,
        weight:weight
    }
    if(highlightedId!==mapRouteComponentDatum.routeId){
        // console.log("route ",mapRouteComponentDatum.routeId," and ",highlightedId,"do not match")
    } else{
        // polylineOptions.opacity = 0.6
        // polylineOptions.weight = 100
        polylineOptions = {
            key:mapRouteComponentDatum.id,
            positions:mapRouteComponentDatum.points,
            color:"#" + mapRouteComponentDatum.color,
            opacity: 0.6,
            weight:100
        }
        console.log("hovering over route ",mapRouteComponentDatum.routeId,polylineOptions)
    }

    let out = (<Polyline {...polylineOptions}
    />)
    return out
}
export default MapRouteComponent;