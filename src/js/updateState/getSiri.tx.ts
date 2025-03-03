import {CardType} from "./DataModels";
import log from "loglevel";
import {useContext} from "react";
import {CardStateContext} from "../../components/util/CardStateComponent";
import {
    VehiclesApproachingStopsContext,
    VehicleStateContext,
} from "../../components/util/VehicleStateComponent";
import {siriGetVehiclesForRoutesEffect, siriGetVehiclesForVehicleViewEffect} from "./SiriEffects";
import {siriGetVehiclesForStopViewEffect} from "./SiriStopEffects";


export const useSiri = () => {
    log.info("vehicle loading initiated")
    const { state} = useContext(CardStateContext)
    let {vehicleState, setState } = useContext(VehicleStateContext);
    let {vehiclesApproachingStopsState, setVehiclesApproachingStopsState } = useContext(VehiclesApproachingStopsContext);
    const updateSiriEffect = () => {
        if (state.currentCard.type === CardType.VehicleCard) {
            siriGetVehiclesForVehicleViewEffect(state.currentCard.routeIdList, state.currentCard.vehicleId,
                vehicleState, setState)
        } else {
            siriGetVehiclesForRoutesEffect(state.currentCard.routeIdList,
                vehicleState, setState)
            if (state.currentCard.type === CardType.StopCard) {
                siriGetVehiclesForStopViewEffect(state.currentCard.routeIdList, state.currentCard.stopIdList,
                    vehiclesApproachingStopsState, setVehiclesApproachingStopsState)
            }
            if (state.currentCard.type === CardType.GeocodeCard) {
                siriGetVehiclesForStopViewEffect(state.currentCard.routeIdList, state.currentCard.stopIdList,
                    vehiclesApproachingStopsState, setVehiclesApproachingStopsState)
            }
        }
    }
    return {updateSiriEffect}

}