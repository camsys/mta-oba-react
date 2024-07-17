import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./serviceAlertContainerComponent";
import {VehicleStateContext} from "../util/VehicleStateComponent";

export const VehicleCardContentComponent = (routeMatch, vehicleId) =>{
    console.log("generating vehicleCardContentComponent for ",vehicleId)
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
    return (
        <div className={`card vehicle-card {routeMatch.routeId}`}>
            <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}>
                <h3 className="card-title">
                    {/*determine bus-stroller via vehicleData*/}
                    <img src="/img/icon/bus-stroller.svg" alt="bus and stroller icon" className="icon" />
                    {routeMatch.routeTitle}
                </h3>
            </div>
            <div className="card-content">
                <VehicleCardContentComponent/>
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
                    return new getVehicleCardsWrapper(match,state.currentCard.vehicleId)})}
            </div>
        </React.Fragment>);

    }

export default getVehicleCardsWrapper;

