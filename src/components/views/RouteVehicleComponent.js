import React, {useContext} from "react";
import {OBA} from "../../js/oba";
import {selectVehicleCard} from "../../js/updateState/SearchEffect";
import {CardStateContext} from "../util/CardStateComponent";


const prettyArrivalTime = (arrivalTime,updateTime) =>{
    console.log("getting pretty time for ",arrivalTime)
    return (arrivalTime==="null" || typeof updateTime==="undefined")? "" :
        `${OBA.Util.getArrivalEstimateForISOString(arrivalTime,updateTime)},`
    if(out==="null,"){console.error("found null bug for VehicleCard, check arrival times is there a weird result?")}
    return typeof out==="undefined" || out===null || out==="null,"?"":out
}



function RouteVehicleComponent({vehicleDatum,lastUpdateTime}){
    let {state,setState} = useContext(CardStateContext)
    const selectVehicle = (vehicleData) =>{
        console.log("clicked on " + vehicleData.vehicleId)
        selectVehicleCard(vehicleData,state,setState)
    }

    console.log("generating RouteVehicleComponent",vehicleDatum,lastUpdateTime)
    let hasArrivalData = typeof vehicleDatum?.vehicleArrivalData!=='undefined'
    let hasUpdateTime = typeof lastUpdateTime !=="undefined"
    let arrivalTime = hasArrivalData && hasUpdateTime
        ? prettyArrivalTime(vehicleDatum?.vehicleArrivalData?.[0].ISOTime,lastUpdateTime)+" "
        :null

    return(
        <li key={vehicleDatum.vehicleId}>
            <a href="#"
               onClick={()=>{selectVehicle(vehicleDatum)}}
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
                        <span className="passengers">{`~${(vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100}% full`}</span>
                        :
                        <span className="passengers">{`~${vehicleDatum.passengerCount} passengers`}</span>
                    )}
                </span>
            </span>
        </li>
    )

}
export default RouteVehicleComponent