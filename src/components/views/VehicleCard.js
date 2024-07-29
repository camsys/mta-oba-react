import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./serviceAlertContainerComponent";
import {updatedTimeIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import {fetchSearchData} from "../../js/updateState/searchEffect";
import {OBA} from "../../js/oba";
import {MapHighlightingStateContext} from "../util/MapHighlightingStateComponent";


const prettyArrivalTime = (arrivalTime,updateTime) =>{
    console.log("getting pretty time for ",arrivalTime)
    return (arrivalTime==="null" || typeof updateTime==="undefined")? "" :
        `${OBA.Util.getArrivalEstimateForISOString(arrivalTime,updateTime)},`
    if(out==="null,"){console.error("found null bug for VehicleCard, check arrival times is there a weird result?")}
    return typeof out==="undefined" || out===null || out==="null,"?"":out
}


export const VehicleCardContentComponent = (props) =>{
    const { state, setState } = useContext(CardStateContext);
    const search = (searchterm) =>{
        fetchSearchData(state, setState, searchterm.split("_")[1])
    }
    let { routeMatch, vehicleId, vehicleDatum,lastUpdateTime} = props;
    console.log("generating vehicleCardContentComponent for ",vehicleDatum.vehicleId)
    return(
        <React.Fragment>
            <ul className="card-details">
                <li className="vehicle-info">
                    <span className="vehicle">{`Vehicle #${vehicleId.split("_")[1]}`}</span>
                    {vehicleDatum?.strollerVehicle?<span className="stroller">Stroller storage available</span>:null}
                </li>
                {vehicleDatum.passengerCount != null && (
                    vehicleDatum.passengerCapacity != null ? (
                        <li className="passengers">{`~${(vehicleDatum.passengerCount / vehicleDatum.passengerCapacity) * 100}% full`}</li>
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
                        return(<li>
                            <a href="#" onClick={() => search(vehicleArrival.stopId)}>{vehicleArrival.stopName}</a>
                            <span className="stop-details">{prettyArrivalTime(vehicleArrival.ISOTime,lastUpdateTime)} {vehicleArrival.prettyDistance}</span>
                        </li>)
                    }) :null
                }
            </ul>
        </React.Fragment>
    )
}

const VehicleCard = (routeMatch,vehicleId) => {

    const {mapHighlightingState, setHighlightingState} = useContext(MapHighlightingStateContext);
    const setHoveredItemId = (id) =>{
        console.log("highlighting: ",id)
        if(mapHighlightingState.highlightedComponentId!=id){
            setHighlightingState((prevState)=>{return {
                ...prevState,
                highlightedComponentId:id}})
        }
    }


    const { vehicleState} = useContext(VehicleStateContext)
    const {state, setState} = useContext(CardStateContext)
    let routeId = routeMatch.routeId.split("_")[1];
    let vehicleDatum = vehicleState[routeId+vehicleDataIdentifier].get(vehicleId)
    let lastUpdateTime = OBA.Util.ISO8601StringToDate(vehicleState[routeId+updatedTimeIdentifier]).getTime()
    console.log("generating VehicleCard ",routeId,vehicleDatum)
    let serviceAlertIdentifier = routeMatch.routeId
    return (
        <div className={`card vehicle-card ${routeMatch.routeId}`}>
            <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}
                 onMouseEnter={() => setHoveredItemId(routeMatch.routeId)}
                 onMouseLeave={() => setHoveredItemId(null)}>
                <h3 className="card-title" onClick={() => fetchSearchData(state, setState, routeMatch.routeId.split("_")[1])}>
                    {/*determine bus-stroller via vehicleDatum*/}
                    <img src={vehicleDatum.strollerVehicle?"/img/icon/bus-stroller.svg":"/img/icon/bus.svg"}
                         alt={vehicleDatum.strollerVehicle?"bus and stroller icon":"bus icon"} className="icon" />
                    {OBA.Config.noWidows(routeMatch.routeTitle)}
                </h3>
            </div>
            <div className="card-content">
                <VehicleCardContentComponent {...{ routeMatch, vehicleId,vehicleDatum,lastUpdateTime}}/>
                <ServiceAlertContainerComponent {...{routeId,serviceAlertIdentifier}}/>
            </div>
        </div>
    );
}


//This one breaks the pattern because vehicles are not searched elsewhere. sorry
function getVehicleCardsWrapper  () {
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

export default getVehicleCardsWrapper;

