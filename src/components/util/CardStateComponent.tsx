import React, {createContext, useRef, useState} from 'react';

import {getHomeCard} from "../../js/updateState/SearchEffect";
const CardStateContext = createContext({});
const RoutesContext = createContext({});
const StopsContext = createContext({});

const CardStateProvider = ({children}) => {
    let currentCard = getHomeCard()
    console.log("setting initial state data with base card",currentCard)
    const [state, setState] = useState({
        someGlobalState: {},
        currentCard: currentCard,
        cardStack: [currentCard],
        renderCounter:1
    });
    console.log("initial state set: ",state)

    return (
        <CardStateContext.Provider value={{state, setState}}>
            {children}
        </CardStateContext.Provider>
    );
};

const RoutesProvider = ({ children }) => {
    const routes = useRef({});

    return (
        <RoutesContext.Provider value={routes}>
            {children}
        </RoutesContext.Provider>
    );
};

const StopsProvider = ({ children }) => {
    const stops = useRef({});

    return (
        <StopsContext.Provider value={stops}>
            {children}
        </StopsContext.Provider>
    );
};

const SearchStateProviders = ({children}) =>{
    return(<CardStateProvider>
        <StopsProvider>
            <RoutesProvider>
                {children}
            </RoutesProvider>
        </StopsProvider>
    </CardStateProvider>)
}

export { SearchStateProviders, CardStateContext,StopsContext,RoutesContext};