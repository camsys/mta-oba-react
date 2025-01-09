import React, {useContext} from "react";
import {OBA} from "../../js/oba";
import {useSearch} from "../../js/updateState/SearchEffect";
import {VehicleRtInterface} from "../../js/updateState/DataModels";
import meeples from '../../../public/img/meeples/meeples-blank.png';
import log from 'loglevel';

function VehicleComponent({vehicleDatum,tabbable}:
                              { vehicleDatum :VehicleRtInterface, tabbable: number}):JSX.Element{
    let {vehicleSearch} = useSearch()

    // log.info("generating VehicleComponent",vehicleDatum)
    let hasArrivalData = typeof vehicleDatum?.vehicleArrivalData!=='undefined'
    return(
        <li key={vehicleDatum.vehicleId}>
            <span className="bus-info">
                <span className="approaching">
                    {OBA.Util.getArrivalEstimateForISOString(vehicleDatum?.vehicleArrivalData?.[0].ISOTime,vehicleDatum.lastUpdate)}
                    {hasArrivalData?
                        vehicleDatum?.vehicleArrivalData?.[0].prettyDistance
                        :null}
                </span>
                {vehicleDatum.passengerCount != null && (
                    vehicleDatum.passengerCapacity != null ?
                        <span className="passengers">
                            <span className={'meeples meeples-'+`${Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 4)}`}>
                                <img src={meeples} alt={`vehicle is ~${Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100)}% full`} title={`vehicle is ~${Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100)}% full`} className="meeples-blank" />
                            </span>
                            {vehicleDatum.passengerCount != null
                                ?(<span class="passenger-count">{`~${vehicleDatum.passengerCount} passengers`}</span>)
                                : null}
                        </span>
                        : null)}
            </span>
            <a href="#" tabIndex={tabbable?0:-1}
               onClick={()=>{vehicleSearch(vehicleDatum)}}
               className={vehicleDatum?.strollerVehicle?"bus stroller-friendly":"bus"}>{vehicleDatum.vehicleId.split("_")[1]}</a>
        </li>
    )

}
export default VehicleComponent