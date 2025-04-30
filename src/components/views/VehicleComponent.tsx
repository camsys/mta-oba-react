import React, {useContext} from "react";
import {OBA} from "../../js/oba";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import {VehicleRtInterface} from "../../js/updateState/DataModels";
import meeples from '../../../public/img/meeples/meeples-blank.png';
import log from 'loglevel';


function MeeplesComponentInner({vehicleDatum}: {VehicleRtInterface}):JSX.Element{
    let percentFull = null;
    let numberOfMeeples = null;
    if(vehicleDatum.apcLevel != -1 && vehicleDatum.apcLevel != null){numberOfMeeples = vehicleDatum?.apcLevel;}
    if(vehicleDatum.passengerCount != null
        && vehicleDatum.passengerCapacity!=null
        && vehicleDatum.passengerCapacity != 0){
        percentFull = Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100);
    }
    if(vehicleDatum.passengerCount==null){
        return null
    }
    return(
        <React.Fragment>
            {(percentFull !==null && numberOfMeeples!==null) && (
                <span className={'meeples meeples-' + `${numberOfMeeples}`}>
                            <img src={meeples}
                                 alt={`vehicle is ~${percentFull}% full`}
                                 title={`vehicle is ~${percentFull}% full`}
                                 className={`meeples-${numberOfMeeples}`}/>
                        </span>
            )}
            <span className="passenger-count">{`~${vehicleDatum.passengerCount} passengers`}</span>
        </React.Fragment>
    )
}

export function MeeplesComponentSpan({vehicleDatum}: {VehicleRtInterface}):JSX.Element{
    if(vehicleDatum.passengerCount==null){
        return null
    }
    return(
        <span className="passengers">
            <MeeplesComponentInner vehicleDatum={vehicleDatum}/> </span>
    )
}

export function MeeplesComponentLi({vehicleDatum}: {VehicleRtInterface}):JSX.Element{
    if(vehicleDatum.passengerCount==null){
        return null
    }
    return(
        <li className="passengers">
            <MeeplesComponentInner vehicleDatum={vehicleDatum}/> </li>
    )
}




function VehicleComponent({vehicleDatum,tabbable}:
                              { vehicleDatum :VehicleRtInterface, tabbable: number}):JSX.Element{
    let {vehicleSearch} = useNavigation()

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
                " (+layover, scheduled to depart terminal at " + OBA.Util.ISO8601StringToDate(vehicleDatum.departureTimeAsText).toLocaleTimeString() + ")"
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
                    <span>{OBA.Util.getArrivalEstimateForISOString(vehicleDatum?.vehicleArrivalData?.[0].ISOTime,vehicleDatum.lastUpdate)}</span>
                    {hasArrivalData?
                        vehicleDatum?.vehicleArrivalData?.[0].prettyDistance
                        :null}
                    <div>{departureInfo}</div>
                </span>
                <MeeplesComponentSpan vehicleDatum={vehicleDatum}/>
            </span>
            <a href="#" tabIndex={tabbable?0:-1}
               onClick={(e)=>{e.preventDefault(); vehicleSearch(vehicleDatum.routeId, vehicleDatum.vehicleId, [vehicleDatum.lat, vehicleDatum.lon])}}
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