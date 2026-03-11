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
        <span className="passengers ml-[.33rem]">
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
    let departureInfo = null;
    if(vehicleDatum.vehicleDepartureData.ISOTime !== undefined) {
        departureInfo = vehicleDatum.layover
            ?
            vehicleDatum.vehicleDepartureData.isDepartureOnSchedule
                ?
                (<React.Fragment>
                    <span>(at terminal, scheduled to depart at </span>
                    <span className="font-bold">{OBA.Util.ISO8601StringToDate(vehicleDatum.departureTimeAsText).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    <span>)</span>
                </React.Fragment>)
                :
                (<span>(at terminal)</span>)
            :
            vehicleDatum.prevTrip
                ?
                (<React.Fragment>
                    <span>(+layover, scheduled to depart terminal at </span>
                    <span className="font-bold">{OBA.Util.ISO8601StringToDate(vehicleDatum.departureTimeAsText).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    <span>)</span>
                </React.Fragment>)
                :
                (<span>(+ scheduled layover at terminal)</span>)
    }
    else{
        departureInfo = vehicleDatum.layover ? (<span>(at terminal)</span>) : null;
    }
    if (vehicleDatum.spooking) {
        departureInfo = departureInfo ? (<>{departureInfo} <span>(Estimated)</span></>) : (<span>(Estimated)</span>);
    }

    let out = null;

    try {
        out = (<li className="pb-1 pl-2 pt-0 text-base" key={vehicleDatum.vehicleId}>
            <span className="bus-info">
                <span className="approaching">
                    <span>{OBA.Util.getArrivalEstimateForISOString(vehicleDatum?.vehicleArrivalData?.[0].ISOTime,vehicleDatum.lastUpdate)}</span>
                    {hasArrivalData?
                        vehicleDatum?.vehicleArrivalData?.[0].prettyDistance
                        :null}
                    <div className="m-0 p-0 ml-[.33rem] leading-[1.125rem] font-normal">{departureInfo}</div>
                </span>
                <MeeplesComponentSpan vehicleDatum={vehicleDatum}/>
            </span>
            <a href="#" tabIndex={tabbable?0:-1}
               onClick={(e)=>{e.preventDefault(); vehicleSearch(vehicleDatum.id, vehicleDatum.vehicleId)}}
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