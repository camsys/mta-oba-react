import React, {useContext} from "react";
import {OBA} from "../../js/oba";
import {useSearch} from "../../js/updateState/SearchEffect";
import {VehicleRtInterface} from "../../js/updateState/DataModels";


function VehicleComponent({vehicleDatum}:
                              { vehicleDatum :VehicleRtInterface}):JSX.Element{
    let {vehicleSearch} = useSearch()

    console.log("generating VehicleComponent",vehicleDatum)
    let hasArrivalData = typeof vehicleDatum?.vehicleArrivalData!=='undefined'
    return(
        <li key={vehicleDatum.vehicleId}>
            <a href="#"
               onClick={()=>{vehicleSearch(vehicleDatum)}}
               className={vehicleDatum?.strollerVehicle?"bus stroller-friendly":"bus"}>{vehicleDatum.vehicleId.split("_")[1]}</a>
            <span className="bus-info">
                <span className="approaching">
                    {OBA.Util.getArrivalEstimateForISOString(vehicleDatum?.vehicleArrivalData?.[0].ISOTime,vehicleDatum.lastUpdate)}
                    {hasArrivalData?
                        vehicleDatum?.vehicleArrivalData?.[0].prettyDistance
                        :null}
                </span>
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