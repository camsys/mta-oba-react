import React from "react";
import {OBA} from "../../js/oba";


const prettyArrivalTime = (arrivalTime,updateTime) =>{
    console.log("getting pretty time for ",arrivalTime)
    return (arrivalTime==="null" || typeof updateTime==="undefined")? "" :
        `${OBA.Util.getArrivalEstimateForISOString(arrivalTime,updateTime)},`
    if(out==="null,"){console.error("found null bug for VehicleCard, check arrival times is there a weird result?")}
    return typeof out==="undefined" || out===null || out==="null,"?"":out
}

function RouteVehicleComponent(vehicleDatum,lastUpdateTime){
    console.log("generating RouteVehicleComponent",vehicleDatum,lastUpdateTime)
    let hasArrivalData = typeof vehicleDatum?.vehicleArrivalData!=='undefined'
    let hasUpdateTime = typeof lastUpdateTime !=="undefined"
    let arrivalTime = hasArrivalData && hasUpdateTime
        ? prettyArrivalTime(vehicleDatum?.vehicleArrivalData?.[0].ISOTime,lastUpdateTime)+" "
        :null
    return(
        <li>
            <a href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
               className={vehicleDatum?.strollerVehicle?"bus stroller-friendly":"bus"}>{vehicleDatum.vehicleId.split("_")[1]}</a>
            <span className="bus-info">
            <span className="approaching">
                {typeof arrivalTime !== "undefined" && arrivalTime!== "null, "
                    ? arrivalTime
                    :null}
                {hasArrivalData?
                    vehicleDatum?.vehicleArrivalData?.[0].prettyDistance
                    :null} </span>
            <span className="passengers">{vehicleDatum.passengerCount != null && (
                vehicleDatum.passengerCapacity != null ?
                    <li className="passengers">{`~${(vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100}% full`}</li>
                    :
                    <li className="passengers">{`~${vehicleDatum.passengerCount} passengers`}</li>
                )}
            </span>
        </span>
        </li>
    )

}
export default RouteVehicleComponent