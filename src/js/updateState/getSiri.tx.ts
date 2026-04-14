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
import {useMapDisplayState} from "../../components/util/MapDisplayStateComponent";


export const useSiri = () => {
    log.info("siri vehicle loading initiated")
    const { state} = useContext(CardStateContext)
    let {vehicleState, setState } = useContext(VehicleStateContext);
    let {vehiclesApproachingStopsState, setVehiclesApproachingStopsState } = useContext(VehiclesApproachingStopsContext);
    const { mapIsOpen } = useMapDisplayState()
    
    const updateSiriEffect = () => {
        if (state.currentCard.type === CardType.VehicleCard) {
            siriGetVehiclesForVehicleViewEffect(state.currentCard, vehicleState, setState)
        } else {
            // Only call siriGetVehiclesForRoutesEffect if map is open
            if (mapIsOpen || state.currentCard.type !== CardType.StopCard) {
                siriGetVehiclesForRoutesEffect(state.currentCard, vehicleState, setState)
            }
            if (state.currentCard.type === CardType.StopCard) {
                siriGetVehiclesForStopViewEffect(state.currentCard, vehiclesApproachingStopsState, setVehiclesApproachingStopsState)
            }
            if (state.currentCard.type === CardType.GeocodeCard) {
                siriGetVehiclesForStopViewEffect(state.currentCard, vehiclesApproachingStopsState, setVehiclesApproachingStopsState)
            }
        }
        log.info("siri call for vehicle loading completed")
    }

    const updateSiriRouteEffect = () => {
        siriGetVehiclesForRoutesEffect(state.currentCard, vehicleState, setState)
    }

    return {updateSiriEffect, updateSiriRouteEffect}

}