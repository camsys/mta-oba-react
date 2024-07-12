import siriEffect from "./siriEffect";
import {stopsEffect} from "./useStopsForDir"
import {fillCard} from "./searchEffect";

const useUpdateCurrentCardData = (currentCard) => {
    siriEffect(currentCard.searchTerm)
    // stopsEffect()
    return currentCard
};

export default useUpdateCurrentCardData;