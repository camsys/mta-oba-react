import React, {createContext, ReactNode, useRef, useState} from 'react';

import {getHomeCard} from "../../js/updateState/NavigationEffect";
import {
    Card,
    CardStateObject,
    RouteMatch,
    RoutesObject,
    StopInterface,
    StopsObject
} from "../../js/updateState/DataModels";
import log from 'loglevel';


const CardStateContext = createContext<{
    state: CardStateObject;
    setState: React.Dispatch<React.SetStateAction<CardStateObject>>;
} | undefined>(undefined);
const CardStateProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    let currentCard = getHomeCard()
    log.info("card generation request occured, setting base card",currentCard)
    const [state, setState] = useState<CardStateObject>({
        currentCard: currentCard,
        cardStack: [currentCard],
        renderCounter:1,
        historyIndex: 0
    });
    log.info("initial state set: ",state)

    return (
        <CardStateContext.Provider value={{state, setState}}>
            {children}
        </CardStateContext.Provider>
    );
};



const RoutesContext = createContext<React.MutableRefObject<RoutesObject>>({ current: {} });
const RoutesProvider = ({ children }) => {
    const routes = useRef<RoutesObject>({});
    return (
        <RoutesContext.Provider value={routes}>
            {children}
        </RoutesContext.Provider>
    );
};


const StopsContext = createContext<React.MutableRefObject<StopsObject>>({ current: {} });
const StopsProvider = ({ children }) => {
    const stops = useRef<StopsObject>({});
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