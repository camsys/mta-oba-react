import React, {useContext} from 'react';
import busStopIcon from "../../img/icon/bus-stop.svg"
import {CardStateContext} from "../util/CardStateComponent";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import {
    stopSortedFutureVehicleDataIdentifier, updatedTimeIdentifier,
    VehiclesApproachingStopsContext
} from "../util/VehicleStateComponent";
import ServiceAlertContainerComponent, {ServiceAlertSvg, useServiceAlert} from "./ServiceAlertContainerComponent";
import VehicleComponent from "./VehicleComponent.tsx";
import {OBA} from "../../js/oba";
import {useHighlight} from "../util/MapHighlightingStateComponent.tsx";
import {
    MatchType,
    RouteMatch,
    RouteMatchDirectionInterface,
    SearchMatch,
    StopMatch, VehicleRtInterface
} from "../../js/updateState/DataModels";
import {RunScriptAfterRender,ScriptForAfterCollapsible} from "../util/RunScriptAfterRender"
import {useFavorite} from "../util/MiscStateComponent";
import {ViewSearchItem} from "./MiscComponents";
import log from 'loglevel';
import {v4 as uuidv4} from "uuid";
import { StopFavoriteButton } from './AddToFavoriteButtons.tsx';
import { StopCardHeader, StopCardHeaderMany } from "./CardHeaderComponents.tsx";



const MiniStopDirectionList =({routeDirectionDatum,stopId, }:{routeDirectionDatum:RouteMatchDirectionInterface,stopId:string}) : JSX.Element=>{
    let {getServiceAlert} = useServiceAlert();
    const {vehiclesApproachingStopsState} = useContext(VehiclesApproachingStopsContext)
    log.info("generating StopCard MiniStopDirection",routeDirectionDatum,vehiclesApproachingStopsState)
    let routeAndDir = routeDirectionDatum.id + "_"+routeDirectionDatum.directionId
    let id = routeDirectionDatum.id.split("_")[1];
    let hasServiceAlert = getServiceAlert(id,routeAndDir)!==null;
    let stopsToVehicles = vehiclesApproachingStopsState[routeAndDir+stopSortedFutureVehicleDataIdentifier]
    let stopCardVehicleData = typeof stopsToVehicles !== 'undefined' &&
        stopsToVehicles.has("MTA_"+stopId)
        ?stopsToVehicles.get("MTA_"+stopId):null
    if(stopCardVehicleData === null){
        log.info("StopCard no vehicle data, not showing MiniStopDirection")
        return null
    }


    let vehicleDataByDestination = new Map<string,Array<VehicleRtInterface>>();
    if(stopCardVehicleData!==null){
        stopCardVehicleData.forEach((vehicleDatum:VehicleRtInterface)=>{
            if(vehicleDataByDestination.has(vehicleDatum.destination)){
                vehicleDataByDestination.get(vehicleDatum.destination).push(vehicleDatum)
            }else{
                vehicleDataByDestination.set(vehicleDatum.destination,[vehicleDatum])
            }
        })
        log.info("vehicleDataByDestination",vehicleDataByDestination)
    }
    
    return(
        <React.Fragment>
            {Array.from(vehicleDataByDestination.entries()).map(
                ([destination,vehicleData],index)=>{
                    return (
                        <li style={{ borderColor: '#'+routeDirectionDatum.color}}>
                            {hasServiceAlert?<ServiceAlertSvg/>:null}
                        <strong>{id}</strong> <span>{destination}</span>
                    </li>)
                }
            )}
        </React.Fragment>
    )
}

const MiniStopDirectionListContainer = ({routeMatches,stopId}:{routeMatches:[RouteMatch],stopId:string}) : JSX.Element=>{
    return(
        <ul className='stop-routes'>
            {routeMatches.map(
                route=>route.directions.map(
                (dir) => {return (<MiniStopDirectionList key={uuidv4()} routeDirectionDatum={dir} stopId ={stopId.split("_")[1]}/>)}
            ))}
        </ul>
    )
}



const RouteDirection = ({routeDirectionDatum,stopId, collapsed}:
    {routeDirectionDatum:RouteMatchDirectionInterface,stopId:string, collapsed:boolean}) : JSX.Element=>{
    const {highlightId} = useHighlight();
    const {vehiclesApproachingStopsState} = useContext(VehiclesApproachingStopsContext)
    log.info("generating StopCard RouteDirection",routeDirectionDatum,vehiclesApproachingStopsState)
    let routeAndDir = routeDirectionDatum.id + "_"+routeDirectionDatum.directionId
    let stopCardVehicleData = vehiclesApproachingStopsState[routeAndDir+stopSortedFutureVehicleDataIdentifier]

    stopCardVehicleData = typeof stopCardVehicleData !== 'undefined' &&
        stopCardVehicleData.has("MTA_"+stopId)
            ?stopCardVehicleData.get("MTA_"+stopId):null
    let id = routeDirectionDatum.id.split("_")[1];
    let serviceAlertIdentifier = routeAndDir
    let lastUpdateTime = stopCardVehicleData!==null
        ? OBA.Util.ISO8601StringToDate(vehiclesApproachingStopsState[routeAndDir+updatedTimeIdentifier]).getTime()
        : null
    let {getServiceAlert} = useServiceAlert();
    let hasServiceAlert = getServiceAlert(id,serviceAlertIdentifier)!==null;
    log.info("StopCard RouteDirection stopCardVehicleData",stopCardVehicleData,lastUpdateTime)


    //todo: this sorting here should be done a single time in SiriStopEffects, but it's too messy of a function for a quick fix
    // and slightly riskier before a release with a quick QA cycle. resolve after friends and family release

    let vehicleDataByDestination = new Map<string,Array<VehicleRtInterface>>();
    if(stopCardVehicleData!==null){
        stopCardVehicleData.forEach((vehicleDatum:VehicleRtInterface)=>{
            if(vehicleDataByDestination.has(vehicleDatum.destination)){
                vehicleDataByDestination.get(vehicleDatum.destination).push(vehicleDatum)
            }else{
                vehicleDataByDestination.set(vehicleDatum.destination,[vehicleDatum])
            }
        })
        log.info("vehicleDataByDestination",vehicleDataByDestination)
    }

    let vehicleComponents = null;

    let tabbable = !collapsed

    // OVERRIDING COLLAPSED STATE
    collapsed = false;
    log.info("StopCard RouteDirection is being prevented from collapsing")

    try{
        vehicleComponents = Array.from(vehicleDataByDestination.entries()).map(([destination,vehicleData],index)=>{
            return (<div className={`inner-card route-direction en-route collapsible ${collapsed?"":"open"}`} key={routeAndDir+destination}>
                <button
                    className={`card-header collapse-trigger ${collapsed?"":"open"}`}
                    aria-haspopup="true"
                    aria-expanded="true"
                    aria-label={`Toggle ${routeDirectionDatum.id.split("_")[1]} to ${destination}`}
                    onMouseEnter={() => highlightId(routeDirectionDatum.id)}
                    onMouseLeave={() => highlightId(null)}
                    tabIndex={tabbable?0:-1}
                >
                <span className="card-title" style={{ borderColor: '#'+routeDirectionDatum.color}}>
                    {hasServiceAlert?<ServiceAlertSvg/>:null}
                    <span className="label">
                        <strong>{routeDirectionDatum.id.split("_")[1]}</strong> {destination}
                    </span>
                </span>
                </button>
                <div className="card-content collapse-content">
                    <ul className="approaching-buses">
                        {vehicleData.map((vehicleDatum,index)=>{
                            if(index<3){return <VehicleComponent {...{vehicleDatum,lastUpdateTime}} tabbable={tabbable} key={index}/>}})}
                    </ul>
                    <ServiceAlertContainerComponent {...{id,serviceAlertIdentifier}} collapsed={!tabbable}/>
                    <ul className="menu icon-menu inner-card-menu">
                        <li>
                            <ViewSearchItem datumId={routeDirectionDatum.id} text={"Full Route"} collapsed={!tabbable}/>
                        </li>
                    </ul>
                </div>
            </div>)
        })
    } catch (e) {
        console.error("Error generating vehicleComponents",e)
    }


    return (stopCardVehicleData === null? null :
        <React.Fragment>
            {vehicleComponents}
        </React.Fragment>

    )
}




export function ZoomAndCenterOnStopButton():JSX.Element{
    return (
        <li>
            <button aria-label="Center & Zoom here on the Map" tabIndex="0">
                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path fill="#0E61A9" fillRule="evenodd" d="M2.14286 2.5C2.14286 2.30276 2.30276 2.14286 2.5 2.14286H3.21429C3.80601 2.14286 4.28571 1.66316 4.28571 1.07143C4.28571 0.479694 3.80601 0 3.21429 0H2.5C1.11929 0 0 1.11929 0 2.5V3.21429C0 3.80601 0.479694 4.28571 1.07143 4.28571C1.66316 4.28571 2.14286 3.80601 2.14286 3.21429V2.5ZM16.7857 0C16.194 0 15.7143 0.479694 15.7143 1.07143C15.7143 1.66316 16.194 2.14286 16.7857 2.14286H17.5C17.6973 2.14286 17.8571 2.30276 17.8571 2.5V3.21429C17.8571 3.80601 18.3369 4.28571 18.9286 4.28571C19.5203 4.28571 20 3.80601 20 3.21429V2.5C20 1.11929 18.8807 0 17.5 0H16.7857ZM1.0716 15.7143C1.66334 15.7143 2.14303 16.194 2.14303 16.7857V17.5C2.14303 17.6973 2.30293 17.8571 2.50017 17.8571H3.21446C3.8062 17.8571 4.28589 18.3369 4.28589 18.9286C4.28589 19.5203 3.8062 20 3.21446 20H2.50017C1.11946 20 0.000174386 18.8807 0.000174386 17.5V16.7857C0.000174386 16.194 0.47987 15.7143 1.0716 15.7143ZM8.57143 0C7.9797 0 7.5 0.479694 7.5 1.07143C7.5 1.66316 7.9797 2.14286 8.57143 2.14286H11.4286C12.0203 2.14286 12.5 1.66316 12.5 1.07143C12.5 0.479694 12.0203 0 11.4286 0H8.57143ZM1.07143 7.5C1.66316 7.5 2.14286 7.9797 2.14286 8.57143V11.4286C2.14286 12.0203 1.66316 12.5 1.07143 12.5C0.479694 12.5 0 12.0203 0 11.4286V8.57143C0 7.9797 0.479694 7.5 1.07143 7.5ZM18.2143 11.785C18.2143 13.1736 17.774 14.4593 17.0254 15.5103L19.6861 18.171C20.1046 18.5894 20.1046 19.2679 19.6861 19.6863C19.2677 20.1047 18.5894 20.1046 18.171 19.6863L15.5101 17.0254C14.4593 17.7736 13.1739 18.2136 11.7857 18.2136C8.23527 18.2136 5.3571 15.3354 5.3571 11.785C5.3571 8.23461 8.23527 5.35644 11.7857 5.35644C15.3361 5.35644 18.2143 8.23461 18.2143 11.785ZM11.7857 7.4993C9.41874 7.4993 7.49996 9.41809 7.49996 11.785C7.49996 14.152 9.41874 16.0707 11.7857 16.0707C14.1526 16.0707 16.0714 14.152 16.0714 11.785C16.0714 9.41809 14.1526 7.4993 11.7857 7.4993ZM11.7857 8.7493C12.2788 8.7493 12.6786 9.14904 12.6786 9.64216V10.8922H13.9286C14.4217 10.8922 14.8214 11.2919 14.8214 11.785C14.8214 12.2781 14.4217 12.6779 13.9286 12.6779H12.6786V13.9279C12.6786 14.421 12.2788 14.8207 11.7857 14.8207C11.2926 14.8207 10.8929 14.421 10.8929 13.9279V12.6779H9.64286C9.14974 12.6779 8.75 12.2781 8.75 11.785C8.75 11.2919 9.14974 10.8922 9.64286 10.8922H10.8929V9.64216C10.8929 9.14904 11.2926 8.7493 11.7857 8.7493Z" clipRule="evenodd"/>
                    </svg>
                </span>
                Center & Zoom Here on Map
            </button>
        </li>
    )
}

function CardDetails({stopMatch}:{stopMatch:StopMatch}) : JSX.Element{
    const {isFavorite} = useFavorite()
    let jsx = (
        <ul className={"card-details" + (isFavorite(stopMatch)?" favorite":"")}>
            <li className="stopcode">Stopcode {stopMatch.id.split("_")[1]}</li>
        </ul>)
    return jsx
}

export function StopCardContent({stopMatch,collapsed}: { StopMatch, boolean }):JSX.Element{
    log.info("generating StopCardContent",stopMatch, collapsed)
    return(
        <React.Fragment>
            <CardDetails stopMatch={stopMatch}/>
            <h4 className="mb-1">Buses en-route:</h4>
            {stopMatch.routeMatches.map(
                route=>route.directions.map(
                    dir => <RouteDirection key={uuidv4()} routeDirectionDatum={dir} stopId ={stopMatch.id.split("_")[1]} collapsed={collapsed}/>
                ))}
            <div className="text-note">
                <p>
                    Text stopcode <strong>{stopMatch.id.split("_")[1]}</strong> to 511123 to receive an up-to-date list of buses
                    en-route on your phone.
                </p>
            </div>
        </React.Fragment>
    )

}


export function StopCard (match: SearchMatch) : JSX.Element {
    if (match.type !== MatchType.StopMatch) {
        return <></>
    }
    let stopMatch = match as StopMatch
    const {search} = useNavigation();

    log.info("generating StopCard", match)
    log.info("generating StopCard", stopMatch)
    return (
        <div className={`card stop-card`}>
            <StopCardHeader match={stopMatch}/>
            <div className="card-content">
                <StopCardContent stopMatch={stopMatch} collapsed={false}/>
            </div>
            <ul className="menu icon-menu card-menu border-t-0">
                <li>
                    <StopFavoriteButton item={stopMatch}/>
                </li>
            </ul>
        </div>
    )
}


export const CollapsableStopCard = RunScriptAfterRender(InnerCollapsableStopCard, ScriptForAfterCollapsible);

function InnerCollapsableStopCard ({ match, oneOfMany}: {match:SearchMatch, oneOfMany:boolean}) : JSX.Element{
    if(match.type!==MatchType.StopMatch){return <></>}
    let stopMatch = match as StopMatch

    log.info("generating collapsable StopCard",stopMatch)
    return(
    <div className={`card stop-card ${oneOfMany?"collapsible":""}`}>
        <StopCardHeaderMany match={stopMatch}/>
        <div className="collapse-content">
            <div className="card-content px-2">
                <StopCardContent stopMatch={stopMatch} collapsed={oneOfMany}/>
                <ul className="menu icon-menu card-menu">
                    <li>
                        <ViewSearchItem datumId={stopMatch.id} text={"Stop"} collapsed={oneOfMany}/>
                    </li>
                </ul>
            </div>
            <StopFavoriteButton className="w-full" item={stopMatch} collapsed={oneOfMany}/>
        </div>
        <div className='card-footer'>
            <MiniStopDirectionListContainer routeMatches={stopMatch.routeMatches} stopId={stopMatch.id} collapsed={oneOfMany}/>
        </div>
    </div>
    )
}

export const StopCardWrapper = () : JSX.Element => {
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
