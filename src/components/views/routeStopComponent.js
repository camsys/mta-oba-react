import React from "react";
import RouteVehicleComponent from "./routeVehicleComponent"

function getRouteStopComponent  (stopData, i) {
    return (
        <li className="has-info" key={stopData.name + " " + i}>
            <a href="#" tabIndex="-1">{stopData.name}</a>
        </li>
    )
}
export default getRouteStopComponent;