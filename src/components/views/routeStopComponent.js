import React from "react";

function routeStopComponent  (stopData) {
    return (
        <li className="has-info">
            <a href="#" tabIndex="-1">Seneca Av/DeKalb Av</a>
            <routeVehicleComponent/>
        </li>
    )
}
export default routeStopComponent;