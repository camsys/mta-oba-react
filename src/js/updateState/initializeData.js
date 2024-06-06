import {useContext } from 'react';
import handleCardChange from "./handleCardChange";
import siriEffect from "./siriEffect";
import searchEffect from "./searchEffect"
import stopsEffect from "./stopsEffect"
import { GlobalStateContext } from '../../components/util/globalState';

const useInitializeData = () => {
    let currentCard = handleCardChange()
    siriEffect(currentCard)
    searchEffect(currentCard)
    stopsEffect(currentCard)
};

export default useInitializeData;