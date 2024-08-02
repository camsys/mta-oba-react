import React, { useContext, useState } from "react";
import { OBA } from "../../js/oba";
import { CardStateContext } from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./ServiceAlertContainerComponent";
import { useHighlight } from "../util/MapHighlightingStateComponent";
import {
    RouteDirectionInterface,
    MatchType,
    SearchMatch, StopInterface
} from "../../js/updateState/DataModels";
import {stopSortedDataIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import {useSearch} from "../../js/updateState/SearchEffect"
import VehicleComponent from "./VehicleComponent"



export function RouteStopComponent
({stopDatum, routeId, index}:{stopDatum:StopInterface,routeId:string,index:string}):JSX.Element{

    const {vehicleState} = useContext(VehicleStateContext)
    const { search } = useSearch();
    routeId=routeId.split("_")[1]

    let vehicleChildComponents = vehicleState[routeId+stopSortedDataIdentifier]
    let hasVehicleChildren = vehicleChildComponents!==null && typeof vehicleChildComponents!=="undefined"
    if(hasVehicleChildren){
        hasVehicleChildren = vehicleChildComponents.has(stopDatum.id)
        vehicleChildComponents = vehicleChildComponents.get(stopDatum.id)
    }

    let uniqueId = stopDatum.name + "_" + stopDatum.id + "_"+index

    return (
        <li  className={hasVehicleChildren?"has-info":null}
             key={uniqueId}
             id={uniqueId}>
            <a href="#" onClick={() => search(stopDatum.id.split("_")[1])} tabIndex={stopDatum.id}>{stopDatum.name}</a>
            {
                hasVehicleChildren ?
                    <ul className="approaching-buses">
                        {vehicleChildComponents.map((vehicleDatum)=>{
                            return <VehicleComponent vehicleDatum={vehicleDatum} lastUpdateTime={null} />})}
                    </ul>
                    :null
            }
        </li>
    )
}



export const RouteDirection = ({datum,color}: { datum: RouteDirectionInterface, color: string }): JSX.Element => {
    console.log("generating RouteDirectionComponent:", datum)
    return (
        <div className="route-direction inner-card collapsible" key={datum.routeId+datum.directionId}>
            <button className="card-header collapse-trigger" aria-haspopup="true"
                    aria-expanded="false"
                    aria-label={"Toggle "+datum.routeId+" to " + datum.routeDestination +" Open / Closed"}>
                <span className="label">to <strong> {datum.routeDestination}</strong></span>
            </button>
            <div className="card-content collapse-content" styles="max-height: 0px;">
                <ul className="route-stops" style={{ color: '#'+color}}>
                    {console.log("preparing to get RouteStopComponents from: ", datum)}
                    {
                        datum.routeStopComponentsData.map(
                            (stopDatum,index) =>{
                                return <RouteStopComponent stopDatum={stopDatum} routeId = {datum.routeId} index = {index}/>})
                    }
                </ul>
            </div>
        </div>
    )
}


export function RouteCard({ routeMatch }: SearchMatch): JSX.Element {
    console.log("generating route card: ", routeMatch);
    if (routeMatch.type !== MatchType.RouteMatch) {
        return null
    }

    const { highlightId } = useHighlight();
    let routeId = routeMatch.routeId.split("_")[1];
    let serviceAlertIdentifier = routeMatch.routeId;

    return (
        <React.Fragment>
            <div className={`card route-card ${routeMatch.routeId}`}>
                <div
                    className="card-header"
                    style={{ borderColor: "#" + routeMatch.color }}
                    onMouseEnter={() => highlightId(routeMatch.routeId)}
                    onMouseLeave={() => highlightId(null)}
                    >
                    <h3 className="card-title">{OBA.Config.noWidows(routeMatch.routeTitle)}</h3>
                </div>
                <div className="card-content">
                    <ul className="card-details">
                        <li className="via">{routeMatch.description}</li>
                    </ul>
                    <ServiceAlertContainerComponent {...{ routeId, serviceAlertIdentifier }} />
                    {routeMatch.directions.map((dir, index) =>
                        (<RouteDirection
                            datum={dir.routeDirectionComponentData}
                            color={routeMatch.color}/>))}
                </div>
            </div>
        </React.Fragment>
);
}

export function RouteCardWrapper(): JSX.Element {
    const { state } = useContext(CardStateContext);
    console.log("adding route cards for matches:", state.currentCard.searchMatches);

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