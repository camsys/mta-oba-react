import siriEffect from "./siriEffect";
import stopsEffect from "./stopsEffect"
import {fillCard} from "./searchEffect";

const useUpdateCurrentCardData = (currentCard) => {
    siriEffect(currentCard)
    stopsEffect(currentCard)
    return currentCard
};

export default useUpdateCurrentCardData;