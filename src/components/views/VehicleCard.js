import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./serviceAlertContainerComponent";
import {vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";


const prettyTime = (time) =>{
    return "n minutes"
}

export const VehicleCardContentComponent = (props) =>{
    let { routeMatch, vehicleData } = props;
    console.log("generating vehicleCardContentComponent for ",vehicleData.vehicleId)
    return(
        <React.Fragment>
            <ul className="card-details">
                <li className="vehicle-info">
                    <span className="vehicle">Vehicle #4717</span>
                    {vehicleData.strollerVehicle?<span className="stroller">Stroller storage available</span>:null}
                </li>
                {vehicleData.passengerCount != null && (
                    vehicleData.passengerCapacity != null ? (
                        <li className="passengers">{`~${(vehicleData.passengerCount / vehicleData.passengerCapacity) * 100}% full`}</li>
                    ) : (
                        <li className="passengers">{`~${vehicleData.passengerCount} passengers`}</li>
                    )
                )}
            </ul>
            <h4>Next Stops:</h4>
            <ul className="next-stops route-stops" style={{ borderColor: '#'+routeMatch.color}}>
                <li>
                    <a href="#">{vehicleData.stopName}</a>
                    <span className="stop-details">{prettyTime(vehicleData.time)}, {vehicleData.prettyDistance}</span>
                </li>
                <li>
                    <a href="#">DeKalb Av/Bond St</a>
                    <span className="stop-details">3 minutes, 1 stop away</span>
                </li>
                <li>
                    <a href="#">Fulton St/Duffield St</a>
                    <span className="stop-details">5 minutes, 2 stops away</span>
                </li>
            </ul>
        </React.Fragment>
    )
}

const VehicleCard = (routeMatch,vehicleId) => {
    const { vehicleState} = useContext(VehicleStateContext)
    let routeId = routeMatch.routeId.split("_")[1];
    let vehicleData = vehicleState[routeId+vehicleDataIdentifier].get(vehicleId)
    console.log("generating VehicleCard ",routeId,vehicleData)
    return (
        <div className={`card vehicle-card ${routeMatch.routeId}`}>
            <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}>
                <h3 className="card-title">
                    {/*determine bus-stroller via vehicleData*/}
                    <img src={vehicleData.strollerVehicle?"/img/icon/bus-stroller.svg":"/img/icon/bus.svg"}
                         alt={vehicleData.strollerVehicle?"bus and stroller icon":"bus icon"} className="icon" />
                    {routeMatch.routeTitle}
                </h3>
            </div>
            <div className="card-content">
                <VehicleCardContentComponent {...{ routeMatch, vehicleData }}/>
                <ServiceAlertContainerComponent/>
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
                {state.currentCard.searchMatches.map(match=>{
                    return match.map(route =>{return VehicleCard(route,state.currentCard.vehicleId)})})}
            </div>
        </React.Fragment>);

    }

export default getVehicleCardsWrapper;

