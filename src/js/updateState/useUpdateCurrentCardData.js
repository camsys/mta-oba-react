import siriVehiclesEffect from "./siriVehiclesEffect";
import {stopsEffect} from "./useStopsForDir"
import {fillCard} from "./searchEffect";

const useUpdateCurrentCardData = (currentCard) => {
    siriVehiclesEffect(currentCard.searchTerm)
    // stopsEffect()
    return currentCard
};

export default useUpdateCurrentCardData;