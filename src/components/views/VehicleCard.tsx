import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./ServiceAlertContainerComponent";
import {updatedTimeIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import {useSearch} from "../../js/updateState/SearchEffect";
import {OBA} from "../../js/oba";
import {useHighlight} from "../util/MapHighlightingStateComponent.tsx";
import {MatchType, RouteMatch, SearchMatch, VehicleRtInterface} from "../../js/updateState/DataModels";
import meeples from "../../../public/img/meeples/meeples-blank.png";
import {useEffect, useState} from "react";
import ErrorBoundary from "../util/errorBoundary";

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


    const [loading, setLoading] = useState(true);
    // bug where vehicle datum was null, happened shortly before release, temp fix, assuming it's because asyncs
    // if vehicle datum is null, check every half second and then load

    const checkLoading = () =>{
        if(loading && vehicleDatum!==null && typeof vehicleDatum!=='undefined'){
            setLoading(false)
        }
    }
    checkLoading()
    useEffect(() => {
        if(loading){
            const interval = setInterval(()=>{
                checkLoading();
                !loading?clearInterval(interval):null}, 100);
            return () => clearInterval(interval);
        }
    }, [loading]);
    if(loading) return(<ErrorBoundary><div>Loading...</div></ErrorBoundary>)


    console.log("generating VehicleCard ",routeId,vehicleDatum,vehicleState[routeId+updatedTimeIdentifier])
    let serviceAlertIdentifier = routeMatch.routeId
    return (
        <div className={`card vehicle-card ${routeMatch.routeId}`}>
            <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}
                 onMouseEnter={() => highlightId(routeMatch.routeId)}
                 onMouseLeave={() => highlightId(null)}>
                <h3 className="card-title"
                    tabIndex={0}
                    onClick={() => search(routeMatch.routeId.split("_")[1])}>
                    <img src={vehicleDatum.strollerVehicle?"/img/icon/bus-stroller.svg":"/img/icon/bus.svg"}
                         alt={vehicleDatum.strollerVehicle?"bus and stroller icon":"bus icon"} className="icon" />
                    {OBA.Config.noWidows(routeMatch.routeTitle)}
                </h3>
            </div>
            <div className="card-content">
                <VehicleCardContentComponent {...{ routeMatch, vehicleDatum}}/>
                <ServiceAlertContainerComponent {...{routeId,serviceAlertIdentifier}}/>
                <ul className="menu icon-menu card-menu">
                    <li>
                        <button className="favorite-toggle" tabIndex="0" aria-label='Toggle favorites status for this stop' onClick={() => search(routeMatch.routeId.split("_")[1])}>
                            <span className="svg-icon-wrap">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#0E61A9" fill-rule="evenodd" d="M10.078 1.78571H15.1071C17.5727 1.78571 19.5714 3.78444 19.5714 6.25C19.5714 8.71556 17.5727 10.7143 15.1071 10.7143H14.3637C13.9399 11.7614 12.9133 12.5 11.7143 12.5C10.5152 12.5 9.48867 11.7614 9.06483 10.7143H5.46429C4.1822 10.7143 3.14286 11.7536 3.14286 13.0357C3.14286 14.0935 3.85031 14.986 4.81789 15.266C5.26324 14.2674 6.26463 13.5714 7.42857 13.5714C8.62763 13.5714 9.65419 14.31 10.078 15.3571H15.9133L15.2424 14.6861C14.824 14.2678 14.824 13.5894 15.2424 13.171C15.6609 12.7525 16.3391 12.7525 16.7576 13.171L19.2576 15.671C19.676 16.0894 19.676 16.7677 19.2576 17.1861L16.7576 19.6861C16.3391 20.1046 15.6609 20.1046 15.2424 19.6861C14.824 19.2677 14.824 18.5894 15.2424 18.171L15.9133 17.5H10.078C9.65419 18.5471 8.62763 19.2857 7.42857 19.2857C6.20837 19.2857 5.16681 18.5209 4.75726 17.4443C2.62767 17.1054 1 15.2607 1 13.0357C1 10.5702 2.99873 8.57143 5.46429 8.57143H9.06483C9.48867 7.52434 10.5152 6.78571 11.7143 6.78571C12.9133 6.78571 13.9399 7.52434 14.3637 8.57143H15.1071C16.3893 8.57143 17.4286 7.53209 17.4286 6.25C17.4286 4.96791 16.3893 3.92857 15.1071 3.92857H10.078C9.65419 4.97566 8.62763 5.71429 7.42857 5.71429C6.22951 5.71429 5.20296 4.97566 4.77911 3.92857H2.07143C1.47969 3.92857 1 3.44887 1 2.85714C1 2.26541 1.47969 1.78571 2.07143 1.78571H4.77911C5.20296 0.738631 6.22951 0 7.42857 0C8.62763 0 9.65419 0.738631 10.078 1.78571Z" clip-rule="evenodd"/></svg>
                            </span>
                            View Full Route
                        </button>
                    </li>
                </ul>
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