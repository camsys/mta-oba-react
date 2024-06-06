import React, { createContext, useState } from 'react';
import {OBA} from "../../js/oba";
const GlobalStateContext = createContext();

const GlobalStateProvider = ({ children }) => {
    const [state, setState] = useState({
        someGlobalState: {},
        currentCard: OBA.Config.cards.homeCard,
        cardStack: [],
        routeComponents:[],
        mapVehicleComponents:[],
        mapStopComponents:[]
    });

    return (
        <GlobalStateContext.Provider value={{ state, setState }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export { GlobalStateProvider, GlobalStateContext };