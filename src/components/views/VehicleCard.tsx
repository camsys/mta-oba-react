import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./ServiceAlertContainerComponent";
import {updatedTimeIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import {OBA} from "../../js/oba";
import {useHighlight} from "../util/MapHighlightingStateComponent.tsx";
import {MatchType, RouteMatch, SearchMatch, VehicleRtInterface} from "../../js/updateState/DataModels";
import meeples from "../../../public/img/meeples/meeples-blank.png";
import {useEffect, useState} from "react";
import ErrorBoundary from "../util/errorBoundary";
import {ViewSearchItem} from "./MiscComponents";
import log from 'loglevel'
import {MeeplesComponentLi} from "./VehicleComponent";

export const VehicleCardContentComponent = ({routeMatch,vehicleDatum}
                                                :{routeMatch:RouteMatch,vehicleDatum:VehicleRtInterface})
                                                : JSX.Element=>{
    const { search } = useNavigation();
    // log.info("generating vehicleCardContentComponent for ",vehicleDatum.vehicleId)
    let {highlightId} = useHighlight()

    return(
        <React.Fragment>
            <ul className="card-details">
                <li className="vehicle-info">
                    <span className="vehicle">{`Vehicle #${vehicleDatum.vehicleId.split("_")[1]}`}</span>
                    {vehicleDatum?.strollerVehicle?<span className="stroller">Stroller storage available</span>:null}
                </li>
                <MeeplesComponentLi vehicleDatum={vehicleDatum}/>
            </ul>
            <ul className="menu icon-menu card-menu">
                <li>
                    {(routeMatch && vehicleDatum)?
                        (<ViewSearchItem datumId={routeMatch.routeId} text={"Full Route"}/>)
                        :
                        (<ul className="card-details">
                            <li>{`The vehicle {vehicleId} can't be found`}</li>
                        </ul>)
                    }
                </li>
            </ul>
            <h4>Next Stops:</h4>
            <ul className="next-stops route-stops" style={{ color: '#'+routeMatch.color}}>
                {
                    vehicleDatum?.vehicleArrivalData!=null?
                    vehicleDatum.vehicleArrivalData.map(vehicleArrival=>{
                        return(
                            <li
                            onMouseEnter={() => highlightId(vehicleArrival.stopId)}
                            onMouseLeave={() => highlightId(null)}
                            key={vehicleArrival.stopId}>
                                <a href="#" onClick={(e) => {e.preventDefault();search(vehicleArrival.stopId)}}>{vehicleArrival.stopName}</a>
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

function VehicleCard ({routeMatch,vehicleId}: { routeMatch: RouteMatch, vehicleId: string}) : JSX.Element{
    log.info("generating VehicleCard: ", routeMatch);

    let {highlightId} = useHighlight()
    const { search } = useNavigation();
    const { vehicleState} = useContext(VehicleStateContext)
    const {state} = useContext(CardStateContext)


    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true)
    },[state,vehicleState])

    let routeId;
    let vehicleDatum = null;



    // bug where vehicle datum was null, happened shortly before release, temp fix, assuming it's because asyncs
    // if vehicle datum is null, check every half second and then load

    const checkLoading = () =>{
        if(routeMatch===null || routeMatch===undefined){
            log.info("routeMatch is null or undefined, VehicleCard is still loading",loading)
            return;
        }
        if (routeMatch.type !== MatchType.RouteMatch) {
            log.info("card is still loading so VehicleCard is still loading",loading)
            return}
        routeId = routeMatch.routeId.split("_")[1];
        let vehicleData = vehicleState[routeId+vehicleDataIdentifier]
        if(!(vehicleData===null || typeof vehicleData==='undefined')){
            vehicleDatum = vehicleData.get(vehicleId)
        }
        log.info("is VehicleCard data still loading?",loading,vehicleDatum)
        if(loading && vehicleDatum!==null && typeof vehicleDatum!=='undefined'){
            setLoading(false)
        }
    }
    checkLoading()
    useEffect(() => {
        if(loading){
            log.info("vehicle not loaded yet, attempting VehicleCard reload")
            const interval = setInterval(()=>{
                checkLoading();
                (!loading)?clearInterval(interval):null}, 100);
            return () => clearInterval(interval);
        }
    }, [loading]);
    if(loading) {
        log.info("waiting on generating VehicleCard")
        return(<ErrorBoundary><div>Unable to load vehicle. Repeating attempt.</div></ErrorBoundary>)}


    log.info("generating VehicleCard ",routeId,vehicleDatum,vehicleState[routeId+updatedTimeIdentifier])
    let serviceAlertIdentifier = routeMatch.routeId
    return (
        <div className={`card vehicle-card ${routeMatch.routeId}`}>
            <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}
                 onMouseEnter={() => highlightId(routeMatch.routeId)}
                 onMouseLeave={() => highlightId(null)}>
                <h3 className="card-title"
                    tabIndex={0}
                    onClick={() => search(routeMatch.routeId.split("_")[1])}>
                    {/*{log.info("adding vehicelcard icon")}*/}
                    <img src={vehicleDatum && vehicleDatum?.strollerVehicle?"/img/icon/bus-stroller.svg":"/img/icon/bus.svg"}
                         alt={vehicleDatum && vehicleDatum?.strollerVehicle?"bus and stroller icon":"bus icon"} className="icon" />
                    {OBA.Config.noWidows(routeMatch.routeTitle)}
                </h3>
            </div>
            <div className="card-content">
                {/*{log.info("adding vehicelcard content")}*/}
                {vehicleDatum?<VehicleCardContentComponent routeMatch={routeMatch} vehicleDatum={vehicleDatum}/>:null}
                <ServiceAlertContainerComponent {...{routeId,serviceAlertIdentifier}}/>
            </div>
        </div>
    );
}


//This one breaks the pattern because vehicles are not searched elsewhere. sorry
const getVehicleCardsWrapper = () : JSX.Element => {
        const { state} = useContext(CardStateContext);
        log.info("adding vehicleCard info for match:", state.currentCard.searchMatches);

        return (<React.Fragment>
            <h2 className="cards-header">Vehicle:</h2>
            <div className="cards">
                {state.currentCard.searchMatches.map(route=>{
                    log.info("vehicleCard route is",route);
                    return <VehicleCard routeMatch={route} vehicleId={state.currentCard.vehicleId} key={state.currentCard.vehicleId}/>
                })}
            </div>
        </React.Fragment>);

    }
export default getVehicleCardsWrapper