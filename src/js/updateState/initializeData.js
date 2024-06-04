import {useContext } from 'react';
import determineCard from "./determineCard";
import siriStateUpdate from "./siriStateUpdate";
import { GlobalStateContext } from '../../components/util/globalState';

const useInitializeData = () => {
    determineCard()
    siriStateUpdate()
};

export default useInitializeData;