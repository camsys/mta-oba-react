import React, { Component } from 'react';
import {Marker, Polyline, Popup} from "react-leaflet";
import {OBA} from "../../js/oba";

function routeComponent  (id,points,color) {
    OBA.Util.trace('generating route: ' + id)
    let out = (<Polyline key={id} positions={points} color={"#" + color}/>)
    return out
}
export default routeComponent;