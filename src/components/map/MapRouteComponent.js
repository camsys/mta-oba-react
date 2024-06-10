import React, { Component } from 'react';
import {Marker, Polyline, Popup} from "react-leaflet";
import {OBA} from "../../js/oba";
import {MapRouteComponentDatum} from "../../js/updateState/dataModels";

function MapRouteComponent  (mapRouteComponentDatum) {
    console.log('generating mapRouteComponent: ' + mapRouteComponentDatum)
    let out = (<Polyline key={mapRouteComponentDatum.id}
                         positions={mapRouteComponentDatum.points}
                         color={"#" + mapRouteComponentDatum.color}/>)
    return out
}
export default MapRouteComponent;