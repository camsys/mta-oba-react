import React, { createContext, useState } from 'react';
import {OBA} from "../../js/oba";
const GlobalStateContext = createContext();

const GlobalStateProvider = ({ children }) => {
    const [state, setState] = useState({
        apiData1: null,
        apiData2: null,
        someGlobalState: {},
        currentCard: OBA.Config.cards.homeCard,
        cardStack: []
    });

    return (
        <GlobalStateContext.Provider value={{ state, setState }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export { GlobalStateProvider, GlobalStateContext };