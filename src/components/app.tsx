import React, {useContext, useEffect, useState} from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary";
import {CardStateContext, CardStateProvider, SearchStateProviders} from "./util/CardStateComponent.tsx";
import SideBar from "./pageStructure/SideBar";
import {
    VehiclesApproachingStopsContext,
    VehiclesApproachingStopsProvider,
    VehicleStateContext,
    VehicleStateProvider
} from "./util/VehicleStateComponent";
import {useNavigation} from "../js/updateState/NavigationEffect.ts";
import {MapHighlightingStateProvider} from "./util/MapHighlightingStateComponent.tsx";
import {CardType} from "../js/updateState/DataModels";
import {MapWrapper} from "./map/MapWrapper.tsx";
import {FavoritesCookieStateProvider} from "Components/util/MiscStateComponent";
import log from 'loglevel';
import {useSiri} from "../js/updateState/getSiri.tx";
import { clickHandler, keypressHandler, postClickLog } from '../js/updateState/handleTracking.ts';



const VehicleLoading=()=>{
    log.info("initiating new loading of Siri")
    const { state} = useContext(CardStateContext)
    const { updateSiriEffect } = useSiri();
    let siri_freq = process.env.SIRI_REQUEST_FREQ as number;
    useEffect(() => {
        updateSiriEffect()
        const interval = setInterval(updateSiriEffect, siri_freq*1000);
        log.info("interval set for vehicle loading",interval)
        return () => clearInterval(interval);
    }, [state]);
}

function InitialCardGeneration ({setLoading}){
    const { generateInitialCard } = useNavigation();
    const { state} = useContext(CardStateContext)

    useEffect(() => {
        if(state.renderCounter =1){
            generateInitialCard(setLoading)
        }
    }, []);
}

function TitleAndH1():JSX.Element{
    const { state } = useContext(CardStateContext);
    let TitleAndH1 = "MTA Bustime BETA - ";
    let cardType = state.currentCard.type;
    if(cardType === CardType.HomeCard){
        TitleAndH1 += "Home";
    }
    else{
        TitleAndH1 += state.currentCard.searchTerm;
    }
    

    log.trace("Title and H1 are set to:     ",TitleAndH1,state.currentCard)
    log.info("Title and H1 are set to:     ",TitleAndH1)

    document.title = TitleAndH1;

    return (
        <h1 className="visually-hidden">{TitleAndH1}</h1>
    )
}

function App  () : JSX.Element{
    log.info("adding app")
    const [loading, setLoading] = useState(true);
    const { updateStateForPopStateEvent } = useNavigation();

    useEffect(() => {
        const handlePopState = (popStateEvent) => {
            log.info("popstate event triggered",window.history.state,popStateEvent,popStateEvent.state)
            updateStateForPopStateEvent(popStateEvent);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
        // window.addEventListener('popstate', handlePopState);
        // return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {     
        document.addEventListener("click", clickHandler, true);
        // document.addEventListener("keypress", keypressHandler, true);
        return () => {
            document.removeEventListener("click", clickHandler, true);
            // document.removeEventListener("keypress", keypressHandler, true);
        };
    }, []);

    useEffect(() => {
        postClickLog();
        const interval = setInterval(postClickLog, 30*1000);
        log.info("interval set posting",interval)
        return () => {
            clearInterval(interval);
            postClickLog();};
    }, []);

    return (
        <ErrorBoundary>
            <InitialCardGeneration setLoading={setLoading}/>
            {loading
                ?
                (<ErrorBoundary><div>Loading...</div></ErrorBoundary>)
                :(<React.Fragment>
                <TitleAndH1/>
                <SideBar/>
                <MapWrapper/>
            </React.Fragment>)}
            <VehicleLoading/>
        </ErrorBoundary>
    )
}

export function AppRoot () : JSX.Element{
    return (
        <ErrorBoundary>
            <SearchStateProviders>
                <VehicleStateProvider>
                    <VehiclesApproachingStopsProvider>
                        <FavoritesCookieStateProvider>
                            <MapHighlightingStateProvider>
                                <App/>
                            </MapHighlightingStateProvider>
                        </FavoritesCookieStateProvider>
                    </VehiclesApproachingStopsProvider>
                </VehicleStateProvider>
            </SearchStateProviders>
            {log.info("app root loaded")}
        </ErrorBoundary>
    )
}