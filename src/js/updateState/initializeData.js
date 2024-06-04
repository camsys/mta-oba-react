import { useEffect, useContext } from 'react';
import determineCard from "./determineCard";
import { GlobalStateContext } from '../../components/util/globalState';

const useInitializeData = () => {
    const { setState } = useContext(GlobalStateContext);

    determineCard()
};

export default useInitializeData;