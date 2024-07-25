import {siriGetVehiclesForRoutesEffect} from "./SiriEffects";
import {stopsEffect} from "./useStopsForDir"
import {fillCard} from "./searchEffect";

const useUpdateCurrentCardData = (currentCard) => {
    // siriGetVehiclesForRoutesEffect(currentCard.searchTerm)
    // stopsEffect()
    return currentCard
};

export default useUpdateCurrentCardData;