import {useContext } from 'react';
import handleCardChange from "./handleCardChange";
import siriEffect from "./siriEffect";
import searchEffect from "./searchEffect"
import stopsEffect from "./stopsEffect"
import { GlobalStateContext } from '../../components/util/globalState';
import {OBA} from "../oba";

export const useInitializeData = () => {
    let currentCard = handleCardChange();
    siriEffect(currentCard)
    searchEffect(currentCard)
    stopsEffect(currentCard, 0)
    stopsEffect(currentCard, 1)
};

export const updateData = (searchTerm) => {
    let currentCard = handleCardChange(searchTerm);
    siriEffect(currentCard,searchTerm)
    searchEffect(currentCard,searchTerm)
    stopsEffect(currentCard, 0,searchTerm)
    stopsEffect(currentCard, 1,searchTerm)
}