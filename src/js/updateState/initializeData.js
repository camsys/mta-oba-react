import {useContext } from 'react';
import determineCard from "./determineCard";
import siriEffect from "./siriEffect";
import searchEffect from "./searchEffect"
import { GlobalStateContext } from '../../components/util/globalState';

const useInitializeData = () => {
    determineCard()
    siriEffect()
    searchEffect()
};

export default useInitializeData;