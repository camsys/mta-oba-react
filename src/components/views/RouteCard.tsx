import React, { useContext, useState } from "react";
import { OBA } from "../../js/oba";
import { useCardState } from "../util/CardStateComponent";
import ServiceAlertContainerComponent, {ServiceAlertSvg, useServiceAlert} from "./ServiceAlertContainerComponent";
import { useHighlight } from "../util/MapHighlightingStateComponent";
import {
    RouteDirectionInterface,
    MatchType,
    SearchMatch, EnhancedStopInterface, RouteMatch,
    Card,
    VehicleStateObject,
    AgencyAndId,
    primaryDelimiter
} from "../../js/updateState/DataModels";
import {stopSortedDataIdentifier, vehicleDataIdentifier, useVehicleState} from "../util/VehicleStateComponent";
import {useNavigation} from "../../js/updateState/NavigationEffect"
import {VehicleComponent} from "./VehicleComponent"
import {useFavorite} from "../util/MiscStateComponent";
import {ViewSearchItem} from "./MiscComponents";
import log from 'loglevel';
import { RouteFavoriteButton} from "./AddToFavoriteButtons";
import {cn} from "../util/coreUtils";
import {BusStopIcon, StarBorderIcon, VehicleIcon} from "../shared/icons";
import { RouteCardHeader, RouteCardHeaderMany } from "./CardHeaderComponents";
import { UnderlineOnFocusElement } from "../shared/common";

export function RouteStopComponent
({stopDatum, routeId, index}:{stopDatum:EnhancedStopInterface,routeId:AgencyAndId,index:string}):JSX.Element{

    const { highlightId } = useHighlight();
    const {vehicleState} = useVehicleState()
    const { search } = useNavigation();
    let routeName=routeId.id

    // todo: please clean up when moving to easier keys for vehicle state
    let vehicleData=null
    let vehicleChildComponents = vehicleState[(routeName + stopSortedDataIdentifier) as keyof VehicleStateObject];
    let hasVehicleChildren = vehicleChildComponents!==null && typeof vehicleChildComponents!=="undefined"
    if (vehicleChildComponents instanceof Map) {
        //todo: should just use the datumId for key
        const datumId = stopDatum.datumId.toString();
        hasVehicleChildren = vehicleChildComponents.has(datumId);
        // todo: we know it is one of the other because of which key we used, yes this needs to be fixed
        vehicleData = vehicleChildComponents.get(datumId) as Map<string,VehicleStateObject> | null;
    }

    let uniqueId = stopDatum.name + "_" + stopDatum.id + "_"+index

    let out = null;

    try{
        const detourClass = stopDatum.detourStatus ? stopDatum.detourStatus.toLowerCase() : '';
        out = (
            <li  className={'pb-4 ' + (hasVehicleChildren ? "has-info" : "") + (detourClass ? " " + detourClass : "")}
                 key={uniqueId}
                 id={uniqueId}
                 onMouseEnter={() => highlightId(stopDatum.datumId)}
                 onMouseLeave={() => highlightId(null)}
            >
                <a href="#" onClick={(e) => {e.preventDefault();highlightId(null);search(stopDatum.datumId.id)}} tabIndex={0}>{stopDatum.name}</a>
                {
                    hasVehicleChildren ?
                        <ul className="approaching-buses">
                            {vehicleData && vehicleData.map((vehicleDatum: any, idx: number)=>{
                                return <VehicleComponent vehicleDatum={vehicleDatum} tabbable={0} key = {idx}/>})}
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
        <div className="route-direction inner-card collapsible" key={datum.datumId.toString()+primaryDelimiter+datum.directionId}>
            <button className="card-header collapse-trigger group" aria-haspopup="true" aria-expanded="false" aria-label={"Toggle "+datum.datumId.id+" to " + datum.routeDestination +" Open / Closed"} tabIndex={collapsed?-1:0}>
                <span className="label">to <UnderlineOnFocusElement variant="black" as="strong"> {datum.routeDestination}</UnderlineOnFocusElement>
                    {datum.hasUpcomingService?null:<><br/><em className="no-scheduled-service">No scheduled service at this time.</em></>}
                </span>
            </button>
            
            <div className="card-content collapse-content">
                <ul className="route-stops" style={{ color: '#'+color}}>
                    {
                        datum.routeStopComponentsData.map(
                            (stopDatum,index) =>{
                                return <RouteStopComponent stopDatum={stopDatum} routeId = {datum.datumId} index={index.toString()} key = {index}/>})
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

export function RouteCardContent({ routeMatch, collapsed}: {routeMatch: RouteMatch, collapsed: boolean}): JSX.Element | null  {
    let routeId = typeof routeMatch.routeId === 'string' ? routeMatch.routeId : routeMatch.routeId.id;
    return(
        <React.Fragment>
            <CardDetails routeMatch={routeMatch}/>
            <ServiceAlertContainerComponent {...{ abbreviatedRouteId: routeId, routeAgencyAndId: routeMatch.routeId.toString(), collapsed}} />
            {routeMatch.directions.map((dir, index) =>
                (<RouteDirection
                    datum={dir.routeDirectionComponentData}
                    color={routeMatch.color} key={index} collapsed={collapsed}/>))}
        </React.Fragment>)
}


export function RouteCard({ routeMatch}: {routeMatch: RouteMatch}): JSX.Element | null {
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
                    <RouteCardContent routeMatch={routeMatch} collapsed={false}/>
                    
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


export function CollapsableRouteCard({ routeMatch, oneOfMany}: {routeMatch:RouteMatch, oneOfMany:boolean}): JSX.Element | null {
    log.info("generating route card: ", routeMatch);
    if (routeMatch.type !== MatchType.RouteMatch) {
        return null
    }

    const { highlightId } = useHighlight();

    let id = typeof routeMatch.datumId === 'string' ? routeMatch.datumId : routeMatch.datumId.id;
    let serviceAlertIdentifier = id;
    let {getServiceAlert} = useServiceAlert();
    let hasServiceAlert = getServiceAlert({abbreviatedRouteId: id, routeAgencyAndId: routeMatch.datumId.toString()})!==null;
    console.log("checking for service alert in Collapsable Route Card with id ",id," and identifier ",routeMatch.datumId," result: ",hasServiceAlert);
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
                                <ViewSearchItem datumId={id} text={"Route"} collapsed={true}/>
                            </li>
                        </ul>
                    </div>
                    <div className='card-menu'>
                        <RouteFavoriteButton className="w-full" item={routeMatch} collapsed={true}/>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export function RouteCardWrapper(): JSX.Element {
    const { state } = useCardState();
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