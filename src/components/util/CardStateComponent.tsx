import React, {createContext, ReactNode, useContext, useRef, useState} from 'react';

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
    let currentCard = getHomeCard(null)
    log.info("card generation request occured, setting base card",currentCard)
    const [state, setState] = useState<CardStateObject>({
        currentCard: currentCard,
        cardStack: [currentCard],
        renderCounter:1,
        historyIndex: 0
    });
    log.info("initial state card set: ",state)

    return (
        <CardStateContext.Provider value={{state, setState}}>
            {children}
        </CardStateContext.Provider>
    );
};


const useCardState = () => {
    const context = useContext(CardStateContext);
    if (context === undefined) {
        throw new Error('useCardState must be used within a CardStateProvider');
    }
    return context;
};


const RoutesContext = createContext<React.MutableRefObject<RoutesObject>>({ current: {} });
const RoutesProvider = ({ children }: { children: ReactNode }) => {
    const routes = useRef<RoutesObject>({});
    return (
        <RoutesContext.Provider value={routes}>
            {children}
        </RoutesContext.Provider>
    );
};

const useRoutes = () => {
    const context = useContext(RoutesContext);
    if (context === undefined) {
        throw new Error('useRoutes must be used within a RoutesProvider');
    }
    return context;
}


const StopsContext = createContext<React.MutableRefObject<StopsObject>>({ current: {} });
const StopsProvider = ({ children }: { children: ReactNode }) => {
    const stops = useRef<StopsObject>({});
    return (
        <StopsContext.Provider value={stops}>
            {children}
        </StopsContext.Provider>
    );
};

const useStops = () => {
    const context = useContext(StopsContext);
    if (context === undefined) {
        throw new Error('useStops must be used within a StopsProvider');
    }
    return context;
}

const SearchStateProviders = ({children}: { children: ReactNode }) =>{
    return(<CardStateProvider>
        <StopsProvider>
            <RoutesProvider>
                {children}
            </RoutesProvider>
        </StopsProvider>
    </CardStateProvider>)
}

export { SearchStateProviders, useCardState, useStops, useRoutes, StopsContext, RoutesContext };