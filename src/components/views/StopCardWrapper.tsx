import React, {useContext} from 'react';
import busStopIcon from "../../img/icon/bus-stop.svg"
import {CardStateContext} from "../util/CardStateComponent";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import {
    stopSortedFutureVehicleDataIdentifier, updatedTimeIdentifier,
    VehiclesApproachingStopsContext,
    VehicleStateContext
} from "../util/VehicleStateComponent";
import ServiceAlertContainerComponent, {ServiceAlertSvg, useServiceAlert} from "./ServiceAlertContainerComponent";
import VehicleComponent from "./VehicleComponent.tsx";
import {OBA} from "../../js/oba";
import {useHighlight} from "../util/MapHighlightingStateComponent.tsx";
import {
    MatchType,
    RouteDirectionInterface,
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




const MiniStopDirectionList =({routeDirectionDatum,stopId}:{routeDirectionDatum:RouteMatchDirectionInterface,stopId:string}) : JSX.Element=>{
    let {getServiceAlert} = useServiceAlert();
    const {vehiclesApproachingStopsState} = useContext(VehiclesApproachingStopsContext)
    log.info("generating StopCard MiniStopDirection",routeDirectionDatum,vehiclesApproachingStopsState)
    let routeAndDir = routeDirectionDatum.routeId + "_"+routeDirectionDatum.directionId
    let routeId = routeDirectionDatum.routeId.split("_")[1];
    let hasServiceAlert = getServiceAlert(routeId,routeAndDir)!==null;
    let stopsToVehicles = vehiclesApproachingStopsState[routeAndDir+stopSortedFutureVehicleDataIdentifier]
    let stopCardVehicleData = typeof stopsToVehicles !== 'undefined' &&
        stopsToVehicles.has("MTA_"+stopId)
        ?stopsToVehicles.get("MTA_"+stopId):null
    if(stopCardVehicleData === null){
        log.info("StopCard no vehicle data, not showing MiniStopDirection")
        return null
    }
    
    return(
        <li style={{ borderColor: '#'+routeDirectionDatum.color}}>
            {hasServiceAlert?<ServiceAlertSvg/>:null}
            <strong>{routeId}</strong> <span>{routeDirectionDatum.destination}</span>
        </li>)
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
    let routeAndDir = routeDirectionDatum.routeId + "_"+routeDirectionDatum.directionId
    let stopCardVehicleData = vehiclesApproachingStopsState[routeAndDir+stopSortedFutureVehicleDataIdentifier]

    stopCardVehicleData = typeof stopCardVehicleData !== 'undefined' &&
        stopCardVehicleData.has("MTA_"+stopId)
            ?stopCardVehicleData.get("MTA_"+stopId):null
    let routeId = routeDirectionDatum.routeId.split("_")[1];
    let serviceAlertIdentifier = routeAndDir
    let lastUpdateTime = stopCardVehicleData!==null
        ? OBA.Util.ISO8601StringToDate(vehiclesApproachingStopsState[routeAndDir+updatedTimeIdentifier]).getTime()
        : null
    let {getServiceAlert} = useServiceAlert();
    let hasServiceAlert = getServiceAlert(routeId,serviceAlertIdentifier)!==null;
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
        console.log("vehicleDataByDestination",vehicleDataByDestination)
    }

    let vehicleComponents = null;

    try{
        vehicleComponents = Array.from(vehicleDataByDestination.entries()).map(([destination,vehicleData],index)=>{
            return (<div className={`inner-card route-direction en-route collapsible ${collapsed?"":"open"}`} key={routeAndDir+destination}>
                <button
                    className={`card-header collapse-trigger ${collapsed?"":"open"}`}
                    aria-haspopup="true"
                    aria-expanded="true"
                    aria-label={`Toggle ${routeDirectionDatum.routeId.split("_")[1]} to ${destination}`}
                    onMouseEnter={() => highlightId(routeDirectionDatum.routeId)}
                    onMouseLeave={() => highlightId(null)}
                    tabIndex={collapsed?-1:0}
                >
                <span className="card-title" style={{ borderColor: '#'+routeDirectionDatum.color}}>
                    {hasServiceAlert?<ServiceAlertSvg/>:null}
                    <span className="label">
                        <strong>{routeDirectionDatum.routeId.split("_")[1]}</strong> {destination}
                    </span>
                </span>
                </button>
                <div className="card-content collapse-content">
                    <ul className="approaching-buses">
                        {vehicleData.map((vehicleDatum,index)=>{
                            if(index<3){return <VehicleComponent {...{vehicleDatum,lastUpdateTime}} tabbable={!collapsed} key={index}/>}})}
                    </ul>
                    <ServiceAlertContainerComponent {...{routeId,serviceAlertIdentifier,collapsed}}/>
                    <ul className="menu icon-menu inner-card-menu">
                        <li>
                            <ViewSearchItem datumId={routeDirectionDatum.routeId} text={"Full Route"} collapsed={collapsed}/>
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

export function StopCardFavoriteButton({stopMatch,collapsed}:StopMatch,boolean):JSX.Element{
    let {isFavorite,addFavorite,removeFavorite} = useFavorite();
    return(<React.Fragment>
        <button className="favorite-toggle" tabIndex={collapsed?-1:0} aria-label='Toggle favorites status for this stop'
                onClick={()=>{isFavorite(stopMatch)?removeFavorite(stopMatch):addFavorite(stopMatch)}}>
                        <span className="svg-icon-wrap add-icon" role="presentation" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><g fill="#0E61A9" clipPath="url(#a)"><path d="M8.75001 14.9417C8.7503 14.9031 8.73944 14.8653 8.71875 14.8328C8.69805 14.8002 8.66839 14.7744 8.63334 14.7583C8.60144 14.7365 8.56368 14.7248 8.52501 14.7248C8.48634 14.7248 8.44857 14.7365 8.41667 14.7583L5.60001 16.8333C5.56585 16.8611 5.52318 16.8762 5.47917 16.8762C5.43517 16.8762 5.3925 16.8611 5.35834 16.8333C5.32056 16.8093 5.29237 16.7728 5.27867 16.7302C5.26497 16.6876 5.26662 16.6415 5.28334 16.6L6.75001 12.2083C6.80389 12.0486 6.80805 11.8762 6.76193 11.714C6.7158 11.5519 6.62157 11.4075 6.49167 11.3L2.85001 8.28333C2.81758 8.25687 2.79387 8.22125 2.78198 8.18111C2.77009 8.14098 2.77056 8.09819 2.78334 8.05833C2.79848 8.01729 2.82569 7.98179 2.86138 7.9565C2.89708 7.93122 2.9396 7.91733 2.98334 7.91667H7.20834C7.3806 7.91598 7.54842 7.86192 7.6887 7.76194C7.82898 7.66195 7.93483 7.52095 7.99167 7.35833L9.50834 3.05833C9.52096 3.01506 9.54728 2.97705 9.58334 2.95C9.6194 2.92295 9.66326 2.90833 9.70834 2.90833C9.75342 2.90833 9.79728 2.92295 9.83334 2.95C9.8694 2.97705 9.89572 3.01506 9.90834 3.05833L11.425 7.35833C11.4819 7.52095 11.5877 7.66195 11.728 7.76194C11.8683 7.86192 12.0361 7.91598 12.2083 7.91667H16.4333C16.4759 7.91784 16.5172 7.93205 16.5514 7.95738C16.5857 7.98272 16.6114 8.01795 16.625 8.05833C16.6413 8.09705 16.6444 8.14003 16.6338 8.18068C16.6233 8.22134 16.5997 8.2574 16.5667 8.28333L16.2583 8.54167C16.2275 8.56583 16.2041 8.5982 16.1909 8.63504C16.1776 8.67189 16.175 8.71174 16.1833 8.75C16.1949 8.78638 16.2154 8.81923 16.2431 8.84547C16.2708 8.87171 16.3047 8.89047 16.3417 8.9C16.8056 9.00263 17.2559 9.15925 17.6833 9.36667C17.7169 9.3882 17.756 9.39965 17.7958 9.39965C17.8357 9.39965 17.8748 9.3882 17.9083 9.36667L18.975 8.48333C19.1706 8.31612 19.3099 8.09259 19.3737 7.84328C19.4376 7.59398 19.4229 7.33104 19.3318 7.09037C19.2406 6.8497 19.0774 6.64304 18.8644 6.4986C18.6514 6.35416 18.399 6.27898 18.1417 6.28333H12.8L10.875 0.833333C10.7906 0.590851 10.633 0.380507 10.4241 0.231267C10.2152 0.0820262 9.9651 0.00122879 9.70834 0C9.45102 0.00310259 9.20075 0.0845067 8.99085 0.233376C8.78094 0.382245 8.62136 0.591517 8.53334 0.833333L6.61667 6.25H1.25001C0.992114 6.25072 0.740757 6.3312 0.530397 6.48039C0.320037 6.62958 0.160971 6.84019 0.0750071 7.08333C-0.0113524 7.32592 -0.0217249 7.58907 0.0452722 7.8377C0.112269 8.08634 0.253453 8.30865 0.450007 8.475L5.00001 12.225L3.08334 17.9333C3.00009 18.1841 2.99842 18.4547 3.07858 18.7065C3.15874 18.9582 3.3166 19.1781 3.5295 19.3345C3.74241 19.491 3.9994 19.5759 4.2636 19.5772C4.52779 19.5785 4.7856 19.496 5.00001 19.3417L8.80834 16.5417C8.84066 16.5185 8.86568 16.4866 8.88045 16.4497C8.89522 16.4128 8.89911 16.3724 8.89167 16.3333C8.79796 15.8951 8.75048 15.4482 8.75001 15V14.9417Z"/><path d="M15 10C14.0111 10 13.0444 10.2932 12.2222 10.8427C11.3999 11.3921 10.759 12.173 10.3806 13.0866C10.0022 14.0002 9.90315 15.0055 10.0961 15.9755C10.289 16.9454 10.7652 17.8363 11.4645 18.5355C12.1637 19.2348 13.0546 19.711 14.0246 19.9039C14.9945 20.0969 15.9998 19.9978 16.9134 19.6194C17.827 19.241 18.6079 18.6001 19.1573 17.7779C19.7068 16.9556 20 15.9889 20 15C20 13.6739 19.4732 12.4021 18.5355 11.4645C17.5979 10.5268 16.3261 10 15 10ZM16.6667 15.625H15.8333C15.7781 15.625 15.7251 15.6469 15.686 15.686C15.647 15.7251 15.625 15.7781 15.625 15.8333V16.6667C15.625 16.8324 15.5592 16.9914 15.4419 17.1086C15.3247 17.2258 15.1658 17.2917 15 17.2917C14.8342 17.2917 14.6753 17.2258 14.5581 17.1086C14.4408 16.9914 14.375 16.8324 14.375 16.6667V15.8333C14.375 15.7781 14.3531 15.7251 14.314 15.686C14.2749 15.6469 14.2219 15.625 14.1667 15.625H13.3333C13.1676 15.625 13.0086 15.5592 12.8914 15.4419C12.7742 15.3247 12.7083 15.1658 12.7083 15C12.7083 14.8342 12.7742 14.6753 12.8914 14.5581C13.0086 14.4408 13.1676 14.375 13.3333 14.375H14.1667C14.2219 14.375 14.2749 14.3531 14.314 14.314C14.3531 14.2749 14.375 14.2219 14.375 14.1667V13.3333C14.375 13.1676 14.4408 13.0086 14.5581 12.8914C14.6753 12.7742 14.8342 12.7083 15 12.7083C15.1658 12.7083 15.3247 12.7742 15.4419 12.8914C15.5592 13.0086 15.625 13.1676 15.625 13.3333V14.1667C15.625 14.2219 15.647 14.2749 15.686 14.314C15.7251 14.3531 15.7781 14.375 15.8333 14.375H16.6667C16.8324 14.375 16.9914 14.4408 17.1086 14.5581C17.2258 14.6753 17.2917 14.8342 17.2917 15C17.2917 15.1658 17.2258 15.3247 17.1086 15.4419C16.9914 15.5592 16.8324 15.625 16.6667 15.625Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0H20V20H0z"/></clipPath></defs></svg>
                        </span>
            <span className="svg-icon-wrap remove-icon" style={{ display: 'none'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><g fill="#0E61A9" clipPath="url(#a)"><path d="M8.75001 14.9417C8.7503 14.9031 8.73944 14.8653 8.71875 14.8328C8.69805 14.8002 8.66839 14.7744 8.63334 14.7583C8.60144 14.7365 8.56368 14.7248 8.52501 14.7248C8.48634 14.7248 8.44857 14.7365 8.41667 14.7583L5.60001 16.8333C5.56585 16.8611 5.52318 16.8762 5.47917 16.8762C5.43517 16.8762 5.3925 16.8611 5.35834 16.8333C5.32056 16.8093 5.29237 16.7728 5.27867 16.7302C5.26497 16.6876 5.26662 16.6415 5.28334 16.6L6.75001 12.2083C6.80389 12.0486 6.80805 11.8762 6.76193 11.714C6.7158 11.5519 6.62157 11.4075 6.49167 11.3L2.85001 8.28333C2.81758 8.25687 2.79387 8.22125 2.78198 8.18111C2.77009 8.14098 2.77056 8.09819 2.78334 8.05833C2.79848 8.01729 2.82569 7.98179 2.86138 7.9565C2.89708 7.93122 2.9396 7.91733 2.98334 7.91667H7.20834C7.3806 7.91598 7.54842 7.86192 7.6887 7.76194C7.82898 7.66195 7.93483 7.52095 7.99167 7.35833L9.50834 3.05833C9.52096 3.01506 9.54728 2.97705 9.58334 2.95C9.6194 2.92295 9.66326 2.90833 9.70834 2.90833C9.75342 2.90833 9.79728 2.92295 9.83334 2.95C9.8694 2.97705 9.89572 3.01506 9.90834 3.05833L11.425 7.35833C11.4819 7.52095 11.5877 7.66195 11.728 7.76194C11.8683 7.86192 12.0361 7.91598 12.2083 7.91667H16.4333C16.4759 7.91784 16.5172 7.93205 16.5514 7.95738C16.5857 7.98272 16.6114 8.01795 16.625 8.05833C16.6413 8.09705 16.6444 8.14003 16.6338 8.18068C16.6233 8.22134 16.5997 8.2574 16.5667 8.28333L16.2583 8.54167C16.2275 8.56583 16.2041 8.5982 16.1909 8.63504C16.1776 8.67189 16.175 8.71174 16.1833 8.75C16.1949 8.78638 16.2154 8.81923 16.2431 8.84547C16.2708 8.87171 16.3047 8.89047 16.3417 8.9C16.8056 9.00263 17.2559 9.15925 17.6833 9.36667C17.7169 9.3882 17.756 9.39965 17.7958 9.39965C17.8357 9.39965 17.8748 9.3882 17.9083 9.36667L18.975 8.48333C19.1706 8.31612 19.3099 8.09259 19.3737 7.84328C19.4376 7.59398 19.4229 7.33104 19.3318 7.09037C19.2406 6.8497 19.0774 6.64304 18.8644 6.4986C18.6514 6.35416 18.399 6.27898 18.1417 6.28333H12.8L10.875 0.833333C10.7906 0.590851 10.633 0.380507 10.4241 0.231267C10.2152 0.0820262 9.9651 0.00122879 9.70834 0C9.45102 0.00310259 9.20075 0.0845067 8.99085 0.233376C8.78094 0.382245 8.62136 0.591517 8.53334 0.833333L6.61667 6.25H1.25001C0.992114 6.25072 0.740757 6.3312 0.530397 6.48039C0.320037 6.62958 0.160971 6.84019 0.0750071 7.08333C-0.0113524 7.32592 -0.0217249 7.58907 0.0452722 7.8377C0.112269 8.08634 0.253453 8.30865 0.450007 8.475L5.00001 12.225L3.08334 17.9333C3.00009 18.1841 2.99842 18.4547 3.07858 18.7065C3.15874 18.9582 3.3166 19.1781 3.5295 19.3345C3.74241 19.491 3.9994 19.5759 4.2636 19.5772C4.52779 19.5785 4.7856 19.496 5.00001 19.3417L8.80834 16.5417C8.84066 16.5185 8.86568 16.4866 8.88045 16.4497C8.89522 16.4128 8.89911 16.3724 8.89167 16.3333C8.79796 15.8951 8.75048 15.4482 8.75001 15V14.9417Z"/><path d="M15 10C14.0111 10 13.0444 10.2932 12.2222 10.8427C11.3999 11.3921 10.759 12.173 10.3806 13.0866C10.0022 14.0002 9.90315 15.0055 10.0961 15.9755C10.289 16.9454 10.7652 17.8363 11.4645 18.5355C12.1637 19.2348 13.0546 19.711 14.0246 19.9039C14.9945 20.0969 15.9998 19.9978 16.9134 19.6194C17.827 19.241 18.6079 18.6001 19.1573 17.7779C19.7068 16.9556 20 15.9889 20 15C20 13.6739 19.4732 12.4021 18.5355 11.4645C17.5979 10.5268 16.3261 10 15 10ZM16.6667 15.625H13.3333C13.1676 15.625 13.0086 15.5592 12.8914 15.4419C12.7742 15.3247 12.7083 15.1658 12.7083 15C12.7083 14.8342 12.7742 14.6753 12.8914 14.5581C13.0086 14.4408 13.1676 14.375 13.3333 14.375H16.6667C16.8324 14.375 16.9914 14.4408 17.1086 14.5581C17.2258 14.6753 17.2917 14.8342 17.2917 15C17.2917 15.1658 17.2258 15.3247 17.1086 15.4419C16.9914 15.5592 16.8324 15.625 16.6667 15.625Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0H20V20H0z"/></clipPath></defs></svg>
                        </span>
            <span className="add">Add Stop to Favorites</span>
            <span className="remove" style={{ display: 'none'}}>Remove Stop from Favorites</span>
        </button>
    </React.Fragment>)
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

export function StopCardContent({stopMatch,collapsed}: { StopMatch, boolean }):JSX.Element{
    log.info("generating StopCardContent",stopMatch, collapsed)
    return(
        <React.Fragment>
            <ul className="card-details">
                <li className="stopcode">Stopcode {stopMatch.id.split("_")[1]}</li>
            </ul>
            <h4>Buses en-route:</h4>
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
    const {isFavorite} = useFavorite()
    const { highlightId } = useHighlight();

    log.info("generating StopCard", match)
    log.info("generating StopCard", stopMatch)
    return (
        <div className={`card stop-card ${isFavorite(stopMatch)?"favorite":""}`}>
            <div className="card-header"
                 onMouseEnter={() => highlightId(stopMatch.id)}
                 onMouseLeave={() => highlightId(null)}>
                <h3 className="card-title">
                    <img src={busStopIcon} alt="bus stop icon" className="icon"/>
                    {stopMatch.name}
                </h3>
            </div>
            <div className="card-content">
                <StopCardContent stopMatch={stopMatch} collapsed={false}/>
                <ul className="menu icon-menu card-menu">
                    <li>
                        <StopCardFavoriteButton stopMatch={stopMatch} stopId={stopMatch.id}/>
                    </li>
                </ul>
            </div>
        </div>
    )
}


export const CollapsableStopCard = RunScriptAfterRender(InnerCollapsableStopCard, ScriptForAfterCollapsible);

function InnerCollapsableStopCard ({ match, oneOfMany}: {match:SearchMatch, oneOfMany:boolean}) : JSX.Element{
    if(match.type!==MatchType.StopMatch){return <></>}
    let stopMatch = match as StopMatch
    const { search } = useNavigation();
    const {isFavorite} = useFavorite()
    const { highlightId } = useHighlight();

    log.info("generating collapsable StopCard",stopMatch)
    return(
    <div className={`card stop-card ${oneOfMany?"collapsible":""} ${isFavorite(stopMatch)?"favorite":""}`}>
        {oneOfMany
            ?
                <button className="card-header collapse-trigger"
                          onMouseEnter={() => highlightId(stopMatch.id)}
                          onMouseLeave={() => highlightId(null)}
                          aria-haspopup="true" aria-expanded="true"
                          aria-label={`Toggle ${stopMatch.id.split("_")[1]} ${stopMatch.name} open/close`}
                >
                    <span className="card-title label">
                        <img src={busStopIcon} alt="bus stop icon" className="icon"/>
                        {stopMatch.name}
                    </span>
                </button>
            :
            <div className="card-header"
                 onMouseEnter={() => highlightId(stopMatch.id)}
                 onMouseLeave={() => highlightId(null)}>
                <h3 className="card-title">
                    <img src={busStopIcon} alt="bus stop icon" className="icon"/>
                    {stopMatch.name}
                </h3>
            </div>
        }
        <div className="card-content collapse-content">
            <StopCardContent stopMatch={stopMatch} collapsed={oneOfMany}/>
            <ul className="menu icon-menu card-menu">
                <li>
                    <StopCardFavoriteButton stopMatch={stopMatch} collapsed={oneOfMany}/>
                </li>
                <li>
                    <ViewSearchItem datumId={stopMatch.id} text={"Stop"} collapsed={oneOfMany}/>
                </li>
            </ul>
        </div>
        <div className='card-footer'>
            <MiniStopDirectionListContainer routeMatches={stopMatch.routeMatches} stopId={stopMatch.id}/>
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
