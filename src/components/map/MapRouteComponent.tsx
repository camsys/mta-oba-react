import React, {Component, useContext, useEffect, useState} from 'react';
import {Marker, Polyline, Popup} from "react-leaflet";

import {useHighlight} from "../util/MapHighlightingStateComponent.tsx";
import {CardStateContext} from "../util/CardStateComponent.tsx";
import {RouteDirectionInterface} from "../../js/updateState/DataModels";
import log from 'loglevel';

function MapRouteComponent  ({mapRouteComponentDatum}:RouteDirectionInterface) :JSX.Element{
    // log.info('generating mapRouteComponent: ', mapRouteComponentDatum)

    let {getHighlightedId} = useHighlight()
    let highlightedId = getHighlightedId()

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
        <Polyline {...polylineOptions} tabIndex={-1}/>
        {highlightedId==mapRouteComponentDatum.routeId ? <Polyline {...highlightedPolylineOptions} tabIndex={-1}/>: null
        }
    </React.Fragment>)
    return out
}
export default MapRouteComponent;