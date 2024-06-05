import {useContext } from 'react';
import determineCard from "./determineCard";
import siriEffect from "./siriEffect";
import searchEffect from "./searchEffect"
import stopsEffect from "./stopsEffect"
import { GlobalStateContext } from '../../components/util/globalState';

const useInitializeData = () => {
    determineCard()
    siriEffect()
    searchEffect()
    stopsEffect()
};

export default useInitializeData;