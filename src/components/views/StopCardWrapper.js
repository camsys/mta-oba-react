import React, {useContext} from 'react';
import busStopIcon from "../../img/icon/bus-stop.svg"
import {CardStateContext} from "../util/CardStateComponent";
import {fetchSearchData} from "../../js/updateState/searchEffect";
import {
    stopSortedFutureVehicleDataIdentifier, updatedTimeIdentifier,
    VehiclesApproachingStopsContext,
    VehicleStateContext
} from "../util/VehicleStateComponent";
import ServiceAlertContainerComponent from "./ServiceAlertContainerComponent";
import RouteVehicleComponent from "./RouteVehicleComponent";
import {OBA} from "../../js/oba";
import {MapHighlightingStateContext} from "../util/MapHighlightingStateComponent";
import {getRouteCard} from "./RouteCard";
import {SearchMatch} from "../../js/updateState/dataModels";



const RouteDirection = (routeDirectionDatum,stopId) =>{
    const {mapHighlightingState, setHighlightingState} = useContext(MapHighlightingStateContext);

    const setHoveredItemId = (id) =>{
        console.log("highlighting: ",id)
        if(mapHighlightingState.highlightedComponentId!=id){
            setHighlightingState((prevState)=>{return {
                ...prevState,
                highlightedComponentId:id}})
        }
    }

    const {vehiclesApproachingStopsState} = useContext(VehiclesApproachingStopsContext)
    console.log("generating StopCard RouteDirection",routeDirectionDatum,vehiclesApproachingStopsState)
    let routeAndDir = routeDirectionDatum.routeId + "_"+routeDirectionDatum.directionId
    let stopCardVehicleData = vehiclesApproachingStopsState[routeAndDir+stopSortedFutureVehicleDataIdentifier]

    stopCardVehicleData = typeof stopCardVehicleData !== 'undefined' &&
        stopCardVehicleData.has("MTA_"+stopId)
            ?stopCardVehicleData.get("MTA_"+stopId):null
    let routeId = routeDirectionDatum.routeId.split("_")[1];
    let serviceAlertIdentifier = routeAndDir+ "_" + routeDirectionDatum.directionId
    let timeUpdated = stopCardVehicleData!==null
        ? OBA.Util.ISO8601StringToDate(vehiclesApproachingStopsState[routeAndDir+updatedTimeIdentifier]).getTime()
        : null
    console.log("StopCard RouteDirection stopCardVehicleData",stopCardVehicleData,timeUpdated)
    return (stopCardVehicleData === null? null :
        <div className="inner-card route-direction en-route collapsible open">
            <button
                className="card-header collapse-trigger open"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label={`Toggle ${routeDirectionDatum.routeId.split("_")[1]} to ${routeDirectionDatum.destination}`}
                onMouseEnter={() => setHoveredItemId(routeDirectionDatum.routeId)}
                onMouseLeave={() => setHoveredItemId(null)}
            >
              <span className="label" style={{ borderColor: '#'+routeDirectionDatum.color}}>
                <strong>{routeDirectionDatum.routeId.split("_")[1]}</strong> {routeDirectionDatum.destination}
              </span>
            </button>
            <div className="card-content collapse-content" style={{ maxHeight: '0px' }}>
                <ul className="approaching-buses">
                    {stopCardVehicleData.map(datum=>RouteVehicleComponent(datum,timeUpdated))}
                </ul>
                <ServiceAlertContainerComponent {...{routeId,serviceAlertIdentifier}}/>
            </div>
        </div>
    )
}

export function StopCard (match) {
    if(match.type!==SearchMatch.matchTypes.stopMatch){return <></>}
    const { state, setState } = useContext(CardStateContext);
    const search = (searchterm) =>{
        fetchSearchData(state, setState, searchterm.split("_")[1])
    }

    console.log("generating StopCard",match)
    return(
    <div className="card stop-card">
        <div className="card-header">
            <h3 className="card-title">
                <img src={busStopIcon} alt="bus stop icon" className="icon" />
                {match.name}
            </h3>
        </div>
        <div className="card-content">
            <ul className="card-details">
                <li className="stopcode">Stopcode {match.id.split("_")[1]}</li>
            </ul>
            <h4>Buses en-route:</h4>
            {match.routeMatches.map(
                route=>route.directions.map(
                    dir => RouteDirection(dir,match.id.split("_")[1])
            ))}

            <div className="text-note">
                <p>
                    Text stopcode <strong>{match.id.split("_")[1]}</strong> to 511123 to receive an up-to-date list of buses
                    en-route on your phone.
                </p>
            </div>
            <ul className="menu icon-menu card-menu">
                <li>
                    <button aria-label="Center & Zoom here on the Map">
                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                  >
                    <path
                        fill="#0E61A9"
                        fillRule="evenodd"
                        d="M2.14286 2.5C2.14286 2.30276 2.30276 2.14286 2.5 2.14286H3.21429C3.80601 2.14286 4.28571 1.66316 4.28571 1.07143C4.28571 0.479694 3.80601 0 3.21429 0H2.5C1.11929 0 0 1.11929 0 2.5V3.21429C0 3.80601 0.479694 4.28571 1.07143 4.28571C1.66316 4.28571 2.14286 3.80601 2.14286 3.21429V2.5ZM16.7857 0C16.194 0 15.7143 0.479694 15.7143 1.07143C15.7143 1.66316 16.194 2.14286 16.7857 2.14286H17.5C17.6973 2.14286 17.8571 2.30276 17.8571 2.5V3.21429C17.8571 3.80601 18.3369 4.28571 18.9286 4.28571C19.5203 4.28571 20 3.80601 20 3.21429V2.5C20 1.11929 18.8807 0 17.5 0H16.7857ZM1.0716 15.7143C1.66334 15.7143 2.14303 16.194 2.14303 16.7857V17.5C2.14303 17.6973 2.30293 17.8571 2.50017 17.8571H3.21446C3.8062 17.8571 4.28589 18.3369 4.28589 18.9286C4.28589 19.5203 3.8062 20 3.21446 20H2.50017C1.11946 20 0.000174386 18.8807 0.000174386 17.5V16.7857C0.000174386 16.194 0.47987 15.7143 1.0716 15.7143ZM8.57143 0C7.9797 0 7.5 0.479694 7.5 1.07143C7.5 1.66316 7.9797 2.14286 8.57143 2.14286H11.4286C12.0203 2.14286 12.5 1.66316 12.5 1.07143C12.5 0.479694 12.0203 0 11.4286 0H8.57143ZM1.07143 7.5C1.66316 7.5 2.14286 7.9797 2.14286 8.57143V11.4286C2.14286 12.0203 1.66316 12.5 1.07143 12.5C0.479694 12.5 0 12.0203 0 11.4286V8.57143C0 7.9797 0.479694 7.5 1.07143 7.5ZM18.2143 11.785C18.2143 13.1736 17.774 14.4593 17.0254 15.5103L19.6861 18.171C20.1046 18.5894 20.1046 19.2679 19.6861 19.6863C19.2677 20.1047 18.5894 20.1046 18.171 19.6863L15.5101 17.0254C14.4593 17.7736 13.1739 18.2136 11.7857 18.2136C8.23527 18.2136 5.3571 15.3354 5.3571 11.785C5.3571 8.23461 8.23527 5.35644 11.7857 5.35644C15.3361 5.35644 18.2143 8.23461 18.2143 11.785ZM11.7857 7.4993C9.41874 7.4993 7.49996 9.41809 7.49996 11.785C7.49996 14.152 9.41874 16.0707 11.7857 16.0707C14.1526 16.0707 16.0714 14.152 16.0714 11.785C16.0714 9.41809 14.1526 7.4993 11.7857 7.4993ZM11.7857 8.7493C12.2788 8.7493 12.6786 9.14904 12.6786 9.64216V10.8922H13.9286C14.4217 10.8922 14.8214 11.2919 14.8214 11.785C14.8214 12.2781 14.4217 12.6779 13.9286 12.6779H12.6786V13.9279C12.6786 14.421 12.2788 14.8207 11.7857 14.8207C11.2926 14.8207 10.8929 14.421 10.8929 13.9279V12.6779H9.64286C9.14974 12.6779 8.75 12.2781 8.75 11.785C8.75 11.2919 9.14974 10.8922 9.64286 10.8922H10.8929V9.64216C10.8929 9.14904 11.2926 8.7493 11.7857 8.7493Z"
                        clipRule="evenodd"
                    />
                  </svg>
                </span>
                        Center & Zoom Here on Map
                    </button>
                </li>
            </ul>
        </div>
    </div>
    )
}

export const StopCardWrapper = () => {
    const { state } = useContext(CardStateContext);
    let match = state.currentCard.searchMatches[0]
    return (
    <>
        <h2 className="cards-header">Stops:</h2>
        <div className="cards">
            {new StopCard(match)}
        </div>
    </>
)};
