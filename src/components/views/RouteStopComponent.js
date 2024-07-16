import React from "react";
import RouteVehicleComponent from "./routeVehicleComponent"

function getRouteStopComponent  (stopData) {
    console.log("generating RouteStopComponent for ",stopData)
    return (
        <li key={stopData.name + " " + stopData.id}>
            <a href={stopData.longLat[0] + "," + stopData.longLat[1]} tabIndex={stopData.id}>{stopData.name}</a>
        </li>
    )
}
export default getRouteStopComponent;