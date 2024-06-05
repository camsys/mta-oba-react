import {useContext } from 'react';
import handleCardChange from "./handleCardChange";
import siriEffect from "./siriEffect";
import searchEffect from "./searchEffect"
import stopsEffect from "./stopsEffect"
import { GlobalStateContext } from '../../components/util/globalState';

const useInitializeData = () => {
    handleCardChange()
    siriEffect()
    searchEffect()
    stopsEffect()
};

export default useInitializeData;