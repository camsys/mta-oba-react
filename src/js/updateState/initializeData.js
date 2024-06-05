import {useContext } from 'react';
import handleCardChange from "./handleCardChange";
import siriEffect from "./siriEffect";
import searchEffect from "./searchEffect"
import { GlobalStateContext } from '../../components/util/globalState';

const useInitializeData = () => {
    handleCardChange()
    siriEffect()
    searchEffect()
};

export default useInitializeData;