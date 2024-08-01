import React, {useContext} from "react";
import RouteVehicleComponent from "./RouteVehicleComponent"
import {useSearch} from "../../js/updateState/SearchEffect";
import {stopSortedDataIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";

function getRouteStopComponent  (stopData,routeId) {
    // console.log("generating RouteStopComponent for ",stopData)

    const {vehicleState} = useContext(VehicleStateContext)
    const { search } = useSearch();
    routeId=routeId.split("_")[1]

    let vehicleChildComponents = vehicleState[routeId+stopSortedDataIdentifier]
    let hasVehicleChildren = vehicleChildComponents!==null && typeof vehicleChildComponents!=="undefined"
    if(hasVehicleChildren){
        hasVehicleChildren = vehicleChildComponents.has(stopData.id)
        vehicleChildComponents = vehicleChildComponents.get(stopData.id)
    }


    return (
        <li  class={hasVehicleChildren?"has-info":null} key={stopData.name + " " + stopData.id}>
            <a href="#" onClick={() => search(stopData.id.split("_")[1])} tabIndex={stopData.id}>{stopData.name}</a>
            {
                hasVehicleChildren ?
                    <ul className="approaching-buses">
                        {vehicleChildComponents.map((vehicleDatum)=>{return new RouteVehicleComponent(vehicleDatum)})}
                    </ul>
                    :null
            }
        </li>
    )
}
export default getRouteStopComponent;