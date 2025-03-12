import React, { useContext, useState } from "react";
import { OBA } from "../../js/oba";
import { CardStateContext } from "../util/CardStateComponent";
import ServiceAlertContainerComponent, {ServiceAlertSvg, useServiceAlert} from "./ServiceAlertContainerComponent";
import { useHighlight } from "../util/MapHighlightingStateComponent";
import {
    RouteDirectionInterface,
    MatchType,
    SearchMatch, StopInterface, RouteMatch
} from "../../js/updateState/DataModels";
import {stopSortedDataIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import {useSearch} from "../../js/updateState/SearchEffect"
import VehicleComponent from "./VehicleComponent"
import {useFavorite} from "../util/MiscStateComponent";
import {ViewSearchItem} from "./MiscComponents";
import log from 'loglevel';



export function RouteStopComponent
({stopDatum, routeId, index}:{stopDatum:StopInterface,routeId:string,index:string}):JSX.Element{

    const { highlightId } = useHighlight();
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

    let out = null;

    try{
        out = (
            <li  className={hasVehicleChildren?"has-info":null}
                 key={uniqueId}
                 id={uniqueId}
                 onMouseEnter={() => highlightId(stopDatum.id)}
                 onMouseLeave={() => highlightId(null)}
            >
                <a href="#" onClick={() => search(stopDatum.id.split("_")[1])} tabIndex="-1">{stopDatum.name}</a>
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
                <span className="label">to <strong> {datum.routeDestination}</strong></span>
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

export function RouteFavoriteButton({routeMatch,collapsed}:{RouteMatch,boolean}):JSX.Element {
    let {addFavorite,removeFavorite,isFavorite} = useFavorite();
    return (<React.Fragment>
        <button className="favorite-toggle" tabIndex={collapsed?-1:0} aria-label='Toggle favorites status for this route'
                onClick={()=>{isFavorite(routeMatch)?removeFavorite(routeMatch):addFavorite(routeMatch)}}
        >
                        <span className="svg-icon-wrap add-icon" role="presentation" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><g fill="#0E61A9" clipPath="url(#a)"><path d="M8.75001 14.9417C8.7503 14.9031 8.73944 14.8653 8.71875 14.8328C8.69805 14.8002 8.66839 14.7744 8.63334 14.7583C8.60144 14.7365 8.56368 14.7248 8.52501 14.7248C8.48634 14.7248 8.44857 14.7365 8.41667 14.7583L5.60001 16.8333C5.56585 16.8611 5.52318 16.8762 5.47917 16.8762C5.43517 16.8762 5.3925 16.8611 5.35834 16.8333C5.32056 16.8093 5.29237 16.7728 5.27867 16.7302C5.26497 16.6876 5.26662 16.6415 5.28334 16.6L6.75001 12.2083C6.80389 12.0486 6.80805 11.8762 6.76193 11.714C6.7158 11.5519 6.62157 11.4075 6.49167 11.3L2.85001 8.28333C2.81758 8.25687 2.79387 8.22125 2.78198 8.18111C2.77009 8.14098 2.77056 8.09819 2.78334 8.05833C2.79848 8.01729 2.82569 7.98179 2.86138 7.9565C2.89708 7.93122 2.9396 7.91733 2.98334 7.91667H7.20834C7.3806 7.91598 7.54842 7.86192 7.6887 7.76194C7.82898 7.66195 7.93483 7.52095 7.99167 7.35833L9.50834 3.05833C9.52096 3.01506 9.54728 2.97705 9.58334 2.95C9.6194 2.92295 9.66326 2.90833 9.70834 2.90833C9.75342 2.90833 9.79728 2.92295 9.83334 2.95C9.8694 2.97705 9.89572 3.01506 9.90834 3.05833L11.425 7.35833C11.4819 7.52095 11.5877 7.66195 11.728 7.76194C11.8683 7.86192 12.0361 7.91598 12.2083 7.91667H16.4333C16.4759 7.91784 16.5172 7.93205 16.5514 7.95738C16.5857 7.98272 16.6114 8.01795 16.625 8.05833C16.6413 8.09705 16.6444 8.14003 16.6338 8.18068C16.6233 8.22134 16.5997 8.2574 16.5667 8.28333L16.2583 8.54167C16.2275 8.56583 16.2041 8.5982 16.1909 8.63504C16.1776 8.67189 16.175 8.71174 16.1833 8.75C16.1949 8.78638 16.2154 8.81923 16.2431 8.84547C16.2708 8.87171 16.3047 8.89047 16.3417 8.9C16.8056 9.00263 17.2559 9.15925 17.6833 9.36667C17.7169 9.3882 17.756 9.39965 17.7958 9.39965C17.8357 9.39965 17.8748 9.3882 17.9083 9.36667L18.975 8.48333C19.1706 8.31612 19.3099 8.09259 19.3737 7.84328C19.4376 7.59398 19.4229 7.33104 19.3318 7.09037C19.2406 6.8497 19.0774 6.64304 18.8644 6.4986C18.6514 6.35416 18.399 6.27898 18.1417 6.28333H12.8L10.875 0.833333C10.7906 0.590851 10.633 0.380507 10.4241 0.231267C10.2152 0.0820262 9.9651 0.00122879 9.70834 0C9.45102 0.00310259 9.20075 0.0845067 8.99085 0.233376C8.78094 0.382245 8.62136 0.591517 8.53334 0.833333L6.61667 6.25H1.25001C0.992114 6.25072 0.740757 6.3312 0.530397 6.48039C0.320037 6.62958 0.160971 6.84019 0.0750071 7.08333C-0.0113524 7.32592 -0.0217249 7.58907 0.0452722 7.8377C0.112269 8.08634 0.253453 8.30865 0.450007 8.475L5.00001 12.225L3.08334 17.9333C3.00009 18.1841 2.99842 18.4547 3.07858 18.7065C3.15874 18.9582 3.3166 19.1781 3.5295 19.3345C3.74241 19.491 3.9994 19.5759 4.2636 19.5772C4.52779 19.5785 4.7856 19.496 5.00001 19.3417L8.80834 16.5417C8.84066 16.5185 8.86568 16.4866 8.88045 16.4497C8.89522 16.4128 8.89911 16.3724 8.89167 16.3333C8.79796 15.8951 8.75048 15.4482 8.75001 15V14.9417Z"/><path d="M15 10C14.0111 10 13.0444 10.2932 12.2222 10.8427C11.3999 11.3921 10.759 12.173 10.3806 13.0866C10.0022 14.0002 9.90315 15.0055 10.0961 15.9755C10.289 16.9454 10.7652 17.8363 11.4645 18.5355C12.1637 19.2348 13.0546 19.711 14.0246 19.9039C14.9945 20.0969 15.9998 19.9978 16.9134 19.6194C17.827 19.241 18.6079 18.6001 19.1573 17.7779C19.7068 16.9556 20 15.9889 20 15C20 13.6739 19.4732 12.4021 18.5355 11.4645C17.5979 10.5268 16.3261 10 15 10ZM16.6667 15.625H15.8333C15.7781 15.625 15.7251 15.6469 15.686 15.686C15.647 15.7251 15.625 15.7781 15.625 15.8333V16.6667C15.625 16.8324 15.5592 16.9914 15.4419 17.1086C15.3247 17.2258 15.1658 17.2917 15 17.2917C14.8342 17.2917 14.6753 17.2258 14.5581 17.1086C14.4408 16.9914 14.375 16.8324 14.375 16.6667V15.8333C14.375 15.7781 14.3531 15.7251 14.314 15.686C14.2749 15.6469 14.2219 15.625 14.1667 15.625H13.3333C13.1676 15.625 13.0086 15.5592 12.8914 15.4419C12.7742 15.3247 12.7083 15.1658 12.7083 15C12.7083 14.8342 12.7742 14.6753 12.8914 14.5581C13.0086 14.4408 13.1676 14.375 13.3333 14.375H14.1667C14.2219 14.375 14.2749 14.3531 14.314 14.314C14.3531 14.2749 14.375 14.2219 14.375 14.1667V13.3333C14.375 13.1676 14.4408 13.0086 14.5581 12.8914C14.6753 12.7742 14.8342 12.7083 15 12.7083C15.1658 12.7083 15.3247 12.7742 15.4419 12.8914C15.5592 13.0086 15.625 13.1676 15.625 13.3333V14.1667C15.625 14.2219 15.647 14.2749 15.686 14.314C15.7251 14.3531 15.7781 14.375 15.8333 14.375H16.6667C16.8324 14.375 16.9914 14.4408 17.1086 14.5581C17.2258 14.6753 17.2917 14.8342 17.2917 15C17.2917 15.1658 17.2258 15.3247 17.1086 15.4419C16.9914 15.5592 16.8324 15.625 16.6667 15.625Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0H20V20H0z"/></clipPath></defs></svg>
                        </span>
            <span className="svg-icon-wrap remove-icon" style={{ display: 'none'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><g fill="#0E61A9" clipPath="url(#a)"><path d="M8.75001 14.9417C8.7503 14.9031 8.73944 14.8653 8.71875 14.8328C8.69805 14.8002 8.66839 14.7744 8.63334 14.7583C8.60144 14.7365 8.56368 14.7248 8.52501 14.7248C8.48634 14.7248 8.44857 14.7365 8.41667 14.7583L5.60001 16.8333C5.56585 16.8611 5.52318 16.8762 5.47917 16.8762C5.43517 16.8762 5.3925 16.8611 5.35834 16.8333C5.32056 16.8093 5.29237 16.7728 5.27867 16.7302C5.26497 16.6876 5.26662 16.6415 5.28334 16.6L6.75001 12.2083C6.80389 12.0486 6.80805 11.8762 6.76193 11.714C6.7158 11.5519 6.62157 11.4075 6.49167 11.3L2.85001 8.28333C2.81758 8.25687 2.79387 8.22125 2.78198 8.18111C2.77009 8.14098 2.77056 8.09819 2.78334 8.05833C2.79848 8.01729 2.82569 7.98179 2.86138 7.9565C2.89708 7.93122 2.9396 7.91733 2.98334 7.91667H7.20834C7.3806 7.91598 7.54842 7.86192 7.6887 7.76194C7.82898 7.66195 7.93483 7.52095 7.99167 7.35833L9.50834 3.05833C9.52096 3.01506 9.54728 2.97705 9.58334 2.95C9.6194 2.92295 9.66326 2.90833 9.70834 2.90833C9.75342 2.90833 9.79728 2.92295 9.83334 2.95C9.8694 2.97705 9.89572 3.01506 9.90834 3.05833L11.425 7.35833C11.4819 7.52095 11.5877 7.66195 11.728 7.76194C11.8683 7.86192 12.0361 7.91598 12.2083 7.91667H16.4333C16.4759 7.91784 16.5172 7.93205 16.5514 7.95738C16.5857 7.98272 16.6114 8.01795 16.625 8.05833C16.6413 8.09705 16.6444 8.14003 16.6338 8.18068C16.6233 8.22134 16.5997 8.2574 16.5667 8.28333L16.2583 8.54167C16.2275 8.56583 16.2041 8.5982 16.1909 8.63504C16.1776 8.67189 16.175 8.71174 16.1833 8.75C16.1949 8.78638 16.2154 8.81923 16.2431 8.84547C16.2708 8.87171 16.3047 8.89047 16.3417 8.9C16.8056 9.00263 17.2559 9.15925 17.6833 9.36667C17.7169 9.3882 17.756 9.39965 17.7958 9.39965C17.8357 9.39965 17.8748 9.3882 17.9083 9.36667L18.975 8.48333C19.1706 8.31612 19.3099 8.09259 19.3737 7.84328C19.4376 7.59398 19.4229 7.33104 19.3318 7.09037C19.2406 6.8497 19.0774 6.64304 18.8644 6.4986C18.6514 6.35416 18.399 6.27898 18.1417 6.28333H12.8L10.875 0.833333C10.7906 0.590851 10.633 0.380507 10.4241 0.231267C10.2152 0.0820262 9.9651 0.00122879 9.70834 0C9.45102 0.00310259 9.20075 0.0845067 8.99085 0.233376C8.78094 0.382245 8.62136 0.591517 8.53334 0.833333L6.61667 6.25H1.25001C0.992114 6.25072 0.740757 6.3312 0.530397 6.48039C0.320037 6.62958 0.160971 6.84019 0.0750071 7.08333C-0.0113524 7.32592 -0.0217249 7.58907 0.0452722 7.8377C0.112269 8.08634 0.253453 8.30865 0.450007 8.475L5.00001 12.225L3.08334 17.9333C3.00009 18.1841 2.99842 18.4547 3.07858 18.7065C3.15874 18.9582 3.3166 19.1781 3.5295 19.3345C3.74241 19.491 3.9994 19.5759 4.2636 19.5772C4.52779 19.5785 4.7856 19.496 5.00001 19.3417L8.80834 16.5417C8.84066 16.5185 8.86568 16.4866 8.88045 16.4497C8.89522 16.4128 8.89911 16.3724 8.89167 16.3333C8.79796 15.8951 8.75048 15.4482 8.75001 15V14.9417Z"/><path d="M15 10C14.0111 10 13.0444 10.2932 12.2222 10.8427C11.3999 11.3921 10.759 12.173 10.3806 13.0866C10.0022 14.0002 9.90315 15.0055 10.0961 15.9755C10.289 16.9454 10.7652 17.8363 11.4645 18.5355C12.1637 19.2348 13.0546 19.711 14.0246 19.9039C14.9945 20.0969 15.9998 19.9978 16.9134 19.6194C17.827 19.241 18.6079 18.6001 19.1573 17.7779C19.7068 16.9556 20 15.9889 20 15C20 13.6739 19.4732 12.4021 18.5355 11.4645C17.5979 10.5268 16.3261 10 15 10ZM16.6667 15.625H13.3333C13.1676 15.625 13.0086 15.5592 12.8914 15.4419C12.7742 15.3247 12.7083 15.1658 12.7083 15C12.7083 14.8342 12.7742 14.6753 12.8914 14.5581C13.0086 14.4408 13.1676 14.375 13.3333 14.375H16.6667C16.8324 14.375 16.9914 14.4408 17.1086 14.5581C17.2258 14.6753 17.2917 14.8342 17.2917 15C17.2917 15.1658 17.2258 15.3247 17.1086 15.4419C16.9914 15.5592 16.8324 15.625 16.6667 15.625Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0H20V20H0z"/></clipPath></defs></svg>
                        </span>
            <span className="add">Add Route to Favorites</span>
            <span className="remove" style={{ display: 'none'}} >Remove Route from Favorites</span>
        </button>
    </React.Fragment>)
}

export function RouteCardContent({ routeMatch, collapsed}: {RouteMatch,boolean}): JSX.Element  {
    let routeId = routeMatch.routeId.split("_")[1];
    let serviceAlertIdentifier = routeMatch.routeId;

    return(
        <React.Fragment>
            <ul className="card-details">
                <li className="via">{routeMatch.description}</li>
            </ul>
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
    let {isFavorite} = useFavorite();
    return (
        <React.Fragment>
            <div className={`card route-card ${routeMatch.routeId} ${isFavorite(routeMatch)?"favorite":""}`}>
                <div
                    className="card-header"
                    style={{ borderColor: "#" + routeMatch.color }}
                    onMouseEnter={() => highlightId(routeMatch.routeId)}
                    onMouseLeave={() => highlightId(null)}
                >
                    <h3 className="card-title">{OBA.Config.noWidows(routeMatch.routeTitle)}</h3>
                </div>
                <div className="card-content">
                    <RouteCardContent routeMatch={routeMatch}/>
                    <ul className="menu icon-menu card-menu">
                        <li>
                            <RouteFavoriteButton routeMatch={routeMatch}/>
                        </li>
                    </ul>
                </div>
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
    let {isFavorite} = useFavorite();

    let routeId = routeMatch.routeId.split("_")[1];
    let serviceAlertIdentifier = routeMatch.routeId;
    let {getServiceAlert} = useServiceAlert();
    let hasServiceAlert = getServiceAlert(routeId,serviceAlertIdentifier)!==null;
    return (
        <React.Fragment>
            <div className={`card route-card
             ${oneOfMany?"collapsible":""}
             ${isFavorite(routeMatch)?"favorite":""}`}>
                {oneOfMany?
                <button
                    className="card-header collapse-trigger"
                    style={{ borderColor: "#" + routeMatch.color }}
                    onMouseEnter={() => highlightId(routeMatch.routeId)}
                    onMouseLeave={() => highlightId(null)}
                    aria-haspopup="true" aria-expanded="true"
                    aria-label={`Toggle ${routeMatch.routeId.split("_")[1]} ${routeMatch.description} open/close`}
                >
                    {hasServiceAlert?<ServiceAlertSvg/>:null}
                    <span className="card-title label">{OBA.Config.noWidows(routeMatch.routeTitle)}</span>
                </button>
                :
                <div
                    className="card-header"
                    style={{ borderColor: "#" + routeMatch.color }}
                    onMouseEnter={() => highlightId(routeMatch.routeId)}
                    onMouseLeave={() => highlightId(null)}
                >
                    <h3 className="card-title">{OBA.Config.noWidows(routeMatch.routeTitle)}</h3>
                </div>
            }

                <div className="card-content collapse-content">
                    <RouteCardContent routeMatch={routeMatch} collapsed={true}/>
                    <ul className="menu icon-menu card-menu">
                        <li>
                            <RouteFavoriteButton routeMatch={routeMatch} collapsed={true}/>
                        </li>
                        <li>
                            <ViewSearchItem datumId={routeMatch.routeId} text={"Route"} collapsed={true}/>
                        </li>
                    </ul>
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