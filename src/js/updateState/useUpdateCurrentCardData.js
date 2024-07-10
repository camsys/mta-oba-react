import siriEffect from "./siriEffect";
import {stopsEffect} from "./useStopsForDir"
import {fillCard} from "./searchEffect";

const useUpdateCurrentCardData = (currentCard) => {
    siriEffect(currentCard)
    // stopsEffect()
    return currentCard
};

export default useUpdateCurrentCardData;