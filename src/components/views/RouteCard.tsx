import React, { useContext, useState } from "react";
import { OBA } from "../../js/oba";
import { CardStateContext } from "../util/CardStateComponent";
import ServiceAlertContainerComponent, {ServiceAlertSvg, useServiceAlert} from "./ServiceAlertContainerComponent";
import { useHighlight } from "../util/MapHighlightingStateComponent";
import {
    RouteDirectionInterface,
    MatchType,
    SearchMatch, StopInterface, RouteMatch,
    Card
} from "../../js/updateState/DataModels";
import {stopSortedDataIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import {useNavigation} from "../../js/updateState/NavigationEffect"
import VehicleComponent from "./VehicleComponent"
import {useFavorite} from "../util/MiscStateComponent";
import {ViewSearchItem} from "./MiscComponents";
import log from 'loglevel';
import { RouteFavoriteButton} from "./AddToFavoriteButtons";
import {cn} from "../util/coreUtils";
import {BusStopIcon, StarBorderIcon, VehicleIcon} from "../shared/icons";
import { RouteCardHeader, RouteCardHeaderMany } from "./CardHeaderComponents";

export function RouteStopComponent
({stopDatum, routeId, index}:{stopDatum:StopInterface,routeId:string,index:string}):JSX.Element{

    const { highlightId } = useHighlight();
    const {vehicleState} = useContext(VehicleStateContext)
    const { search } = useNavigation();
    routeId=routeId.split("_")[1]

    let vehicleChildComponents = vehicleState[routeId+stopSortedDataIdentifier]
    let hasVehicleChildren = vehicleChildComponents!==null && typeof vehicleChildComponents!=="undefined"
    if(hasVehicleChildren){
        hasVehicleChildren = vehicleChildComponents.has(stopDatum.id)
        vehicleChildComponents = vehicleChildComponents.get(stopDatum.id)
    }

    let uniqueId = stopDatum.name + "_" + stopDatum.id + "_"+index

    let out = null;

    try{
        out = (
            <li  className={'pb-2 ' + (hasVehicleChildren ? "has-info" : "")}
                 key={uniqueId}
                 id={uniqueId}
                 onMouseEnter={() => highlightId(stopDatum.id)}
                 onMouseLeave={() => highlightId(null)}
            >
                <a href="#" onClick={(e) => {e.preventDefault();highlightId(null);search(stopDatum.id.split("_")[1])}} tabIndex="-1">{stopDatum.name}</a>
                {
                    hasVehicleChildren ?
                        <ul className="approaching-buses">
                            {vehicleChildComponents.map((vehicleDatum, index)=>{
                                return <VehicleComponent vehicleDatum={vehicleDatum} lastUpdateTime={null} key = {index}/>})}
                        </ul>
                        :null
                }
            </li>
        )
    } catch (e) {
        log.error("error in RouteStopComponent: ", e)
    }

    return (
        out
    )
}



export const RouteDirection = ({datum,color,collapsed}: { datum: RouteDirectionInterface, color: string ,collapsed:boolean}): JSX.Element => {
    log.info("generating RouteDirectionComponent:", datum)
    return (
        <div className="route-direction inner-card collapsible" key={datum.routeId+datum.directionId}>
            <button className="card-header collapse-trigger" aria-haspopup="true" aria-expanded="false" aria-label={"Toggle "+datum.routeId+" to " + datum.routeDestination +" Open / Closed"} tabIndex={collapsed?-1:0}>
                <span className="label">to <strong> {datum.routeDestination}</strong>
                    {datum.hasUpcomingService?null:<><br/><em className="no-scheduled-service">No scheduled service at this time.</em></>}
                </span>
            </button>
            
            <div className="card-content collapse-content">
                <ul className="route-stops" style={{ color: '#'+color}}>
                    {log.info("preparing to get RouteStopComponents from: ", datum)}
                    {
                        datum.routeStopComponentsData.map(
                            (stopDatum,index) =>{
                                return <RouteStopComponent stopDatum={stopDatum} routeId = {datum.routeId} key = {index}/>})
                    }
                </ul>
            </div>
        </div>
    )
}

function CardDetails({routeMatch}:{routeMatch:RouteMatch}) : JSX.Element|null{
    log.info("generating CardDetails for routeMatch: ", routeMatch)
    if(routeMatch.description === null || 
        typeof routeMatch.description === "undefined" || 
        routeMatch.description === ""  ||
        routeMatch.description.toLowerCase() === "null" ||
        routeMatch.description.trim().length === 0){
        return null
    }
    return (<ul className={"card-details"}>
            <li className="via">{routeMatch.description}</li>
        </ul>)
}

export function RouteCardContent({ routeMatch, collapsed}: {RouteMatch,boolean}): JSX.Element  {
    let routeId = routeMatch.routeId.split("_")[1];
    let serviceAlertIdentifier = routeMatch.routeId;

    return(
        <React.Fragment>
            <CardDetails routeMatch={routeMatch}/>
            <ServiceAlertContainerComponent {...{ routeId, serviceAlertIdentifier, collapsed}} />
            {routeMatch.directions.map((dir, index) =>
                (<RouteDirection
                    datum={dir.routeDirectionComponentData}
                    color={routeMatch.color} key={index} collapsed={collapsed}/>))}
        </React.Fragment>)
}


export function RouteCard({ routeMatch}: RouteMatch): JSX.Element {
    log.info("generating route card: ", routeMatch);
    if (routeMatch.type !== MatchType.RouteMatch) {
        return null
    }
    const { highlightId } = useHighlight();
    return (
        <React.Fragment>
            <div className={`card route-card ${routeMatch.datumId}}`}>
                <RouteCardHeader match={routeMatch}/>
                <div className="card-content">
                    <RouteCardContent routeMatch={routeMatch}/>
                    
                </div>
                <ul className="menu icon-menu card-menu border-t-0">
                        <li>
                            <RouteFavoriteButton item={routeMatch}/>
                        </li>
                    </ul>   
            </div>
        </React.Fragment>
    );
}


export function CollapsableRouteCard({ routeMatch, oneOfMany}: {routeMatch:RouteMatch, oneOfMany:boolean}): JSX.Element {
    log.info("generating route card: ", routeMatch);
    if (routeMatch.type !== MatchType.RouteMatch) {
        return null
    }

    const { highlightId } = useHighlight();

    let id = routeMatch.datumId.split("_")[1];
    let serviceAlertIdentifier = routeMatch.datumId;
    let {getServiceAlert} = useServiceAlert();
    let hasServiceAlert = getServiceAlert(id,serviceAlertIdentifier)!==null;
    return (
        <React.Fragment>
            <div className={`card route-card
             ${oneOfMany?"collapsible":""}`}>
                {oneOfMany?
                <RouteCardHeaderMany match={routeMatch} hasServiceAlert={hasServiceAlert}/>
                :
                <RouteCardHeader match={routeMatch}/>
            }

                <div className="collapse-content">
                    <div className="card-content px-2">
                        <RouteCardContent routeMatch={routeMatch} collapsed={true}/>
                        <ul className="menu icon-menu card-menu">
                            <li>
                                <ViewSearchItem datumId={routeMatch.datumId} text={"Route"} collapsed={true}/>
                            </li>
                        </ul>
                    </div>
                    <RouteFavoriteButton className="w-full" item={routeMatch} collapsed={true}/>
                </div>
            </div>
        </React.Fragment>
    );
}

export function RouteCardWrapper(): JSX.Element {
    const { state } = useContext(CardStateContext);
    log.info("adding route cards for matches:", state.currentCard.searchMatches);

    return (
        <React.Fragment>
            <h2 className="cards-header">Routes:</h2>
    <div className="cards">
        {state.currentCard.searchMatches.map((searchMatch, index) =>
                <RouteCard routeMatch={searchMatch} key={index}/>
            )}
        </div>
        </React.Fragment>
);
}