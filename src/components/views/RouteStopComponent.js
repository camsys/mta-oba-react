import React from "react";
import RouteVehicleComponent from "./routeVehicleComponent"

function getRouteStopComponent  (stopData) {
    console.log("generating RouteStopComponent for ",stopData)
    return (
        <li className="has-info" key={stopData.name + " " + stopData.id}>
            <a href="#" tabIndex={stopData.id}>{stopData.name}</a>
        </li>
    )
}
export default getRouteStopComponent;