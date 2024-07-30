import React from "react";

function RouteVehicleComponent(vehicleDatum){
    console.log("generating RouteVehicleComponent",vehicleDatum)
    return(
        <li>
            <a href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
               className={vehicleDatum?.strollerVehicle?"bus stroller-friendly":"bus"}>{vehicleDatum.vehicleId.split("_")[1]}</a>
            <span className="bus-info">
            <span className="approaching">{typeof vehicleDatum?.vehicleArrivalData!=='undefined'?
                vehicleDatum?.vehicleArrivalData?.[0].prettyDistance:null}</span>
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