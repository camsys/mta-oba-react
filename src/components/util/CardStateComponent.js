import React, { createContext, useState } from 'react';

import {generateInitialCard} from "../../js/updateState/searchEffect";
import {fetchAllStopsData} from "../../js/updateState/useStopsForDir";
const CardStateContext = createContext();
const RouteStateContext = createContext();
const StopStateContext = createContext();

const CardStateProvider = ({children}) => {
    let currentCard = generateInitialCard()
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

const RouteStateProvider = ({children}) => {
    const [routeState, setRouteState] = useState({
        routes: new Set()
    });
    console.log("initial routeState set: ",routeState)

    return (
        <RouteStateContext.Provider value={{routeState, setRouteState}}>
            {children}
        </RouteStateContext.Provider>
    );
};

const StopStateProvider = ({children}) => {
    let currentCard = generateInitialCard()
    console.log("setting initial state data with base card",currentCard)
    const [stopState, setStopState] = useState({
        stops: new Set()
    });
    console.log("initial stopState set: ",stopState)

    return (
        <StopStateContext.Provider value={{stopState, setStopState}}>
            {children}
        </StopStateContext.Provider>
    );
};

const SearchStateProviders = ({children}) =>{
    return(<CardStateProvider>
        <StopStateProvider>
            <RouteStateProvider>
                {children}
            </RouteStateProvider>
        </StopStateProvider>
    </CardStateProvider>)
}

export { SearchStateProviders, CardStateContext,RouteStateProvider,StopStateProvider};