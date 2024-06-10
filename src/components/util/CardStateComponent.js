import React, { createContext, useState } from 'react';

import {generateInitialCard} from "../../js/updateState/searchEffect";
import {fetchAllStopsData} from "../../js/updateState/useStopsForDir";
const CardStateContext = createContext();

const CardStateProvider = ({children}) => {
    let currentCard = generateInitialCard()
    console.log("setting initial state data with base card",currentCard)
    const [state, setState] = useState({
        someGlobalState: {},
        currentCard: currentCard,
        cardStack: [currentCard],
        routeComponents: [],
        mapVehicleComponents: [],
        mapStopComponents: [],
        renderCounter:1
    });
    console.log("initial state set: ",state)

    return (
        <CardStateContext.Provider value={{state, setState}}>
            {children}
        </CardStateContext.Provider>
    );
};

export { CardStateProvider, CardStateContext };