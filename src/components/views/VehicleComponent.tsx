import React, {useContext} from "react";
import {OBA} from "../../js/oba";
import {useSearch} from "../../js/updateState/SearchEffect";


function VehicleComponent({vehicleDatum,lastUpdateTime}){
    let {vehicleSearch} = useSearch()
    const selectVehicle = (vehicleData) =>{
        console.log("clicked on " + vehicleData.vehicleId)
        vehicleSearch(vehicleData)
    }

    console.log("generating VehicleComponent",vehicleDatum,lastUpdateTime)
    let hasArrivalData = typeof vehicleDatum?.vehicleArrivalData!=='undefined'
    return(
        <li key={vehicleDatum.vehicleId}>
            <a href="#"
               onClick={()=>{selectVehicle(vehicleDatum)}}
               className={vehicleDatum?.strollerVehicle?"bus stroller-friendly":"bus"}>{vehicleDatum.vehicleId.split("_")[1]}</a>
            <span className="bus-info">
                <span className="approaching">
                    {OBA.Util.getArrivalEstimateForISOString(vehicleDatum?.vehicleArrivalData?.[0].ISOTime,lastUpdateTime)}
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
export default VehicleComponent