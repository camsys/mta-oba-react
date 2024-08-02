import React, {useContext} from "react";
import RouteVehicleComponent from "./RouteVehicleComponent"
import {useSearch} from "../../js/updateState/SearchEffect";
import {stopSortedDataIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";

function getRouteStopComponent  ({stopDatum, routeId, index}) {
    // console.log("generating RouteStopComponent for ",stopDatum)

    const {vehicleState} = useContext(VehicleStateContext)
    const { search } = useSearch();
    routeId=routeId.split("_")[1]

    let vehicleChildComponents = vehicleState[routeId+stopSortedDataIdentifier]
    let hasVehicleChildren = vehicleChildComponents!==null && typeof vehicleChildComponents!=="undefined"
    if(hasVehicleChildren){
        hasVehicleChildren = vehicleChildComponents.has(stopDatum.id)
        vehicleChildComponents = vehicleChildComponents.get(stopDatum.id)
    }

    let uniqueId = stopDatum.name + "_" + stopDatum.id + "_"+index

    return (
        <li  className={hasVehicleChildren?"has-info":null}
             key={uniqueId}
             id={uniqueId}>
            <a href="#" onClick={() => search(stopDatum.id.split("_")[1])} tabIndex={stopDatum.id}>{stopDatum.name}</a>
            {
                hasVehicleChildren ?
                    <ul className="approaching-buses">
                        {vehicleChildComponents.map((vehicleDatum)=>{
                            return <RouteVehicleComponent vehicleDatum={vehicleDatum} lastUpdateTime={null} />})}
                    </ul>
                    :null
            }
        </li>
    )
}
export default getRouteStopComponent;