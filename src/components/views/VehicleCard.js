import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import ServiceAlertContainerComponent from "./serviceAlertContainerComponent";
import {vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";


const prettyTime = (time) =>{
    return "n minutes"
}

export const VehicleCardContentComponent = (props) =>{
    let { routeMatch, vehicleDatum} = props;
    console.log("generating vehicleCardContentComponent for ",vehicleDatum.vehicleId)
    return(
        <React.Fragment>
            <ul className="card-details">
                <li className="vehicle-info">
                    <span className="vehicle">{`Vehicle #${vehicleDatum.vehicleId}`}</span>
                    {vehicleDatum.strollerVehicle?<span className="stroller">Stroller storage available</span>:null}
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
            <ul className="next-stops route-stops" style={{ borderColor: '#'+routeMatch.color}}>
                {
                    vehicleDatum.vehicleArrivalData.map(d=>{
                        return(<li>
                            <a href="#">{d.stopName}</a>
                            <span className="stop-details">{prettyTime(d.time)}, {d.prettyDistance}</span>
                        </li>)
                    })
                }
            </ul>
        </React.Fragment>
    )
}

const VehicleCard = (routeMatch,vehicleId) => {
    const { vehicleState} = useContext(VehicleStateContext)
    let routeId = routeMatch.routeId.split("_")[1];
    let vehicleDatum = vehicleState[routeId+vehicleDataIdentifier].get(vehicleId)
    console.log("generating VehicleCard ",routeId,vehicleDatum)
    return (
        <div className={`card vehicle-card ${routeMatch.routeId}`}>
            <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}>
                <h3 className="card-title">
                    {/*determine bus-stroller via vehicleDatum*/}
                    <img src={vehicleDatum.strollerVehicle?"/img/icon/bus-stroller.svg":"/img/icon/bus.svg"}
                         alt={vehicleDatum.strollerVehicle?"bus and stroller icon":"bus icon"} className="icon" />
                    {routeMatch.routeTitle}
                </h3>
            </div>
            <div className="card-content">
                <VehicleCardContentComponent {...{ routeMatch, vehicleDatum }}/>
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

