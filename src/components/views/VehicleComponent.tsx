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
    let hasArrivalData = typeof vehicleDatum?.vehicleArrivalData!=='undefined';
    let departureInfo = "";
    if(vehicleDatum.vehicleDepartureData.ISOTime !== undefined) {
        departureInfo = vehicleDatum.layover
            ?
            vehicleDatum.vehicleDepartureData.isDepartureOnSchedule
                ?
                " (at terminal, scheduled to depart at " + OBA.Util.ISO8601StringToDate(vehicleDatum.departureTimeAsText).toLocaleTimeString() + ")"
                :
                " (at terminal)"
            :
            vehicleDatum.prevTrip
                ?
                " (+layover, scheduled to depart terminal at " + OBA.Util.ISO8601StringToDate(vehicleDatum.departureTimeAsText).toLocaleTimeString()
                :
                " (+ scheduled layover at terminal)"
    }
    else{
        departureInfo = vehicleDatum.layover ? " (at terminal)" : ""
    }
    if (vehicleDatum.spooking) {
        departureInfo = departureInfo + " (Estimated)"
    }

    let out = null;

    try {
        out = (<li key={vehicleDatum.vehicleId}>
            <span className="bus-info">
                <span className="approaching">
                    {OBA.Util.getArrivalEstimateForISOString(vehicleDatum?.vehicleArrivalData?.[0].ISOTime,vehicleDatum.lastUpdate)}
                    {hasArrivalData?
                        vehicleDatum?.vehicleArrivalData?.[0].prettyDistance
                        :null}
                    {departureInfo}
                </span>
                {vehicleDatum.passengerCount != null && vehicleDatum.passengerCapacity != null
                    ?
                    <span className="passengers">
                            {
                                vehicleDatum.apcLevel!=-1?
                                    <span className={'meeples meeples-' + `${vehicleDatum?.apcLevel}`}>
                                        <img src={meeples}
                                             alt={`vehicle is ~${Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100)}% full`}
                                             title={`vehicle is ~${Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100)}% full`}
                                             className="meeples-blank"/>
                                    </span>
                                    :null
                            }
                        {vehicleDatum.passengerCount != null
                            ?(<span className="passenger-count">{`~${vehicleDatum.passengerCount} passengers`}</span>)
                            : null}
                        </span>
                    :
                    null}
            </span>
            <a href="#" tabIndex={tabbable?0:-1}
               onClick={()=>{vehicleSearch(vehicleDatum)}}
               className={vehicleDatum?.strollerVehicle?"bus stroller-friendly":"bus"}>{vehicleDatum.vehicleId.split("_")[1]}</a>
        </li>)
    } catch (e) {
        log.error("error in VehicleComponent", e)
    }
    return(
        out
    )

}
export default VehicleComponent