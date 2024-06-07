import React from "react";
import RouteVehicleComponent from "./routeVehicleComponent"

function getRouteStopComponent  (stopData, i) {
    return (
        <li className="has-info" key={stopData.name + " " + i}>
            <a href="#" tabIndex={i}>{stopData.name}</a>
        </li>
    )
}
export default getRouteStopComponent;