import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./serviceAlertContainerComponent";
import {vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";

export const VehicleCardContentComponent = (props) =>{
    let { routeMatch, vehicle } = props;
    console.log("generating vehicleCardContentComponent for ",vehicle.vehicleId)
    return(
        <React.Fragment>
            <ul className="card-details">
                <li className="vehicle-info">
                    <span className="vehicle">Vehicle #4717</span>
                    <span className="stroller">Stroller storage available</span>
                </li>
                <li className="passengers">~2 passengers</li>
            </ul>
            <h4>Next Stops:</h4>
            <ul className="next-stops route-stops" style={{ borderColor: '#'+routeMatch.color}}>
                <li>
                    <a href="#">DeKalb Av/Flatbush Av Ex</a>
                    <span className="stop-details">1 minute, &lt; 1 stop away</span>
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
    console.log(vehicleState)
    console.log("creating VehicleCard: ",vehicleId,routeMatch)
    let routeId = routeMatch.routeId.split("_")[1];
    let vehicle = vehicleState[routeId+vehicleDataIdentifier].get(vehicleId)
    console.log("generating VehicleCard ",routeId,vehicle)
    return (
        <div className={`card vehicle-card ${routeMatch.routeId}`}>
            <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}>
                <h3 className="card-title">
                    {/*determine bus-stroller via vehicleData*/}
                    <img src={vehicle.strollerVehicle=="stroller"?"/img/icon/bus-stroller.svg":"/img/icon/bus.svg"}
                         alt={vehicle.strollerVehicle=="stroller"?"bus and stroller icon":"bus icon"} className="icon" />
                    {routeMatch.routeTitle}
                </h3>
            </div>
            <div className="card-content">
                <VehicleCardContentComponent {...{ routeMatch, vehicle }}/>
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

