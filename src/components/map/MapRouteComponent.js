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

    let highlightedPolylineOptions = {
        key:mapRouteComponentDatum.id + "_highlighted",
        positions:mapRouteComponentDatum.points,
        color:"#" + mapRouteComponentDatum.color,
        opacity: 0.6,
        weight:10,
        zIndex: 10,
        zIndexOffset: 10
    }

    let out = (<React.Fragment>
        <Polyline {...polylineOptions}/>
        {highlightedId==mapRouteComponentDatum.routeId ? <Polyline {...highlightedPolylineOptions}/>: null
        }
    </React.Fragment>)
    return out
}
export default MapRouteComponent;