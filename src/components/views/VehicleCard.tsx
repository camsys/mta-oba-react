import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./ServiceAlertContainerComponent";
import {updatedTimeIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import {useSearch} from "../../js/updateState/SearchEffect";
import {OBA} from "../../js/oba";
import {MapHighlightingStateContext, useHighlight} from "../util/MapHighlightingStateComponent.tsx";
import {MatchType, RouteMatch, SearchMatch, VehicleRtInterface} from "../../js/updateState/DataModels";
import meeples from '../../../public/img/meeples/meeples-blank.png';

export const VehicleCardContentComponent = ({routeMatch,vehicleDatum}
                                                :{routeMatch:RouteMatch,vehicleDatum:VehicleRtInterface})
                                                : JSX.Element=>{
    const { search } = useSearch();
    // console.log("generating vehicleCardContentComponent for ",vehicleDatum.vehicleId)
    let {highlightId} = useHighlight()

    return(
        <React.Fragment>
            <ul className="card-details">
                <li className="vehicle-info">
                    <span className="vehicle">{`Vehicle #${vehicleDatum.vehicleId.split("_")[1]}`}</span>
                    {vehicleDatum?.strollerVehicle?<span className="stroller">Stroller storage available</span>:null}
                </li>
                {vehicleDatum.passengerCount != null && (
                    vehicleDatum.passengerCapacity != null ? (
                        <li className="passengers">
                            <span className={'meeples meeples-'+`${Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 10)}`}>
                                <img src={meeples} alt={`vehicle is ~${Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100)}% full`} title={`vehicle is ~${Math.ceil((vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100)}% full`} className="meeples-blank" />
                            </span>
                        </li>
                    ) : (
                        <li className="passengers">{`~${vehicleDatum.passengerCount} passengers`}</li>
                    )
                )}
            </ul>
            <h4>Next Stops:</h4>
            <ul className="next-stops route-stops" style={{ color: '#'+routeMatch.color}}>
                {
                    vehicleDatum?.vehicleArrivalData!=null?
                    vehicleDatum.vehicleArrivalData.map(vehicleArrival=>{
                        return(
                            <li
                            onMouseEnter={() => highlightId(vehicleArrival.stopId)}
                            onMouseLeave={() => highlightId(null)}>
                                <a href="#" onClick={() => search(vehicleArrival.stopId)}>{vehicleArrival.stopName}</a>
                                <span className="stop-details">
                                    {OBA.Util.getArrivalEstimateForISOString(vehicleArrival.ISOTime,vehicleDatum.lastUpdate)}
                                    {vehicleArrival.prettyDistance}
                                </span>
                            </li>)
                    }) :null
                }
            </ul>
        </React.Fragment>
    )
}

const VehicleCard = (routeMatch:RouteMatch,vehicleId:string) : JSX.Element=> {
    console.log("generating route card: ", routeMatch);
    if (routeMatch.type !== MatchType.RouteMatch) {
        return null
    }

    let {highlightId} = useHighlight()

    const { search } = useSearch();
    const { vehicleState} = useContext(VehicleStateContext)
    let routeId = routeMatch.routeId.split("_")[1];
    let vehicleDatum = vehicleState[routeId+vehicleDataIdentifier].get(vehicleId)
    console.log("generating VehicleCard ",routeId,vehicleDatum,vehicleState[routeId+updatedTimeIdentifier])
    let serviceAlertIdentifier = routeMatch.routeId
    return (
        <div className={`card vehicle-card ${routeMatch.routeId}`}>
            <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}
                 onMouseEnter={() => highlightId(routeMatch.routeId)}
                 onMouseLeave={() => highlightId(null)}>
                <h3 className="card-title" onClick={() => search(routeMatch.routeId.split("_")[1])}>
                    <img src={vehicleDatum.strollerVehicle?"/img/icon/bus-stroller.svg":"/img/icon/bus.svg"}
                         alt={vehicleDatum.strollerVehicle?"bus and stroller icon":"bus icon"} className="icon" />
                    {OBA.Config.noWidows(routeMatch.routeTitle)}
                </h3>
            </div>
            <div className="card-content">
                <VehicleCardContentComponent {...{ routeMatch, vehicleDatum}}/>
                <ServiceAlertContainerComponent {...{routeId,serviceAlertIdentifier}}/>
            </div>
        </div>
    );
}


//This one breaks the pattern because vehicles are not searched elsewhere. sorry
const getVehicleCardsWrapper = () : JSX.Element => {
        const { state} = useContext(CardStateContext);
        console.log("adding vehicles for match:", state.currentCard.searchMatches);

        return (<React.Fragment>
            <h2 className="cards-header">Vehicle:</h2>
            <div className="cards">
                {state.currentCard.searchMatches.map(route=>{
                    console.log("vehicleCard",route)
                    return VehicleCard(route,state.currentCard.vehicleId)})}
            </div>
        </React.Fragment>);

    }
export default getVehicleCardsWrapper