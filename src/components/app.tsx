import React, {useContext, useEffect, useState} from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary.js";
import {useCardState, SearchStateProviders} from "./util/CardStateComponent";
import SideBar from "./pageStructure/SideBar";
import {
    VehiclesApproachingStopsContext,
    VehiclesApproachingStopsProvider,
    VehicleStateContext,
    VehicleStateProvider
} from "./util/VehicleStateComponent";
import {useNavigation} from "../js/updateState/NavigationEffect";
import {MapHighlightingStateProvider} from "./util/MapHighlightingStateComponent";
import {CardType} from "../js/updateState/DataModels";
import {MapWrapper} from "./map/MapWrapper";
import {FavoritesCookieStateProvider} from "./util/MiscStateComponent";
import {MapDisplayStateProvider} from "./util/MapDisplayStateComponent";
import log from 'loglevel';
import {useSiri} from "../js/updateState/getSiri";
import { clickHandler, keypressHandler, postClickLog } from '../js/updateState/handleTracking';
import {useMapDisplayState} from "./util/MapDisplayStateComponent";
import { MobileStateProvider, useMobileState} from './util/MobileStateComponent';



const VehicleLoading=(): JSX.Element => {
    log.info("initiating new loading of Siri")
    const { state} = useCardState();
    const { updateSiriEffect } = useSiri();
    const siriFreqEnv = process.env.SIRI_REQUEST_FREQ;
    const siri_freq = siriFreqEnv && !isNaN(Number(siriFreqEnv)) ? Number(siriFreqEnv) : 30;
    useEffect(() => {
        updateSiriEffect()
        const interval = setInterval(updateSiriEffect, siri_freq*1000);
        log.info("interval set for vehicle loading",interval)
        return () => clearInterval(interval);
    }, [state]);
    return <></>
}

function InitialCardGeneration ({setLoading}:{setLoading:React.Dispatch<React.SetStateAction<boolean>>}):JSX.Element{
    const { generateInitialCard } = useNavigation();
    const { state} = useCardState();

    useEffect(() => {
        if(state.renderCounter === 1){
            generateInitialCard(setLoading)
        }
    }, []);
    return <></>;
}

function TitleAndH1():JSX.Element{
    const { state } = useCardState();
    let TitleAndH1 = "MTA Bus Time - ";
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
    const { setMapIsOpen } = useMapDisplayState();
    const { setIsMobile } = useMobileState();

    useEffect(() => {
        log.info("App root actually rendered/updated");
    }); // No dependency array = fires every render

    const checkScreenSize = () => {
        const screenWidth = window.innerWidth;
        const threshold = 450;
        if (screenWidth > threshold) {
            setIsMobile(false);
            setMapIsOpen(true);
        } else {
            setIsMobile(true);
            setMapIsOpen(false);
        }
    };

    useEffect(() => {
        const handlePopState = (popStateEvent: PopStateEvent) => {
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

    // useEffect(() => {     
    //     document.addEventListener("click", clickHandler, true);
    //     // document.addEventListener("keypress", keypressHandler, true);
    //     return () => {
    //         document.removeEventListener("click", clickHandler, true);
    //         // document.removeEventListener("keypress", keypressHandler, true);
    //     };
    // }, []);

    useEffect(() => {
        // Check screen size on initial load
        checkScreenSize();
        
        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);
        
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    // useEffect(() => {
    //     postClickLog();
    //     const interval = setInterval(postClickLog, 30*1000);
    //     log.info("interval set posting",interval)
    //     return () => {
    //         clearInterval(interval);
    //         postClickLog();};
    // }, []);

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
                <FavoritesCookieStateProvider>
                    <MobileStateProvider>
                        <MapDisplayStateProvider>
                            <MapHighlightingStateProvider>
                                <VehicleStateProvider>
                                    <VehiclesApproachingStopsProvider>
                                        <App/>
                                        </VehiclesApproachingStopsProvider>
                                    </VehicleStateProvider>
                                </MapHighlightingStateProvider>
                            </MapDisplayStateProvider>
                        </MobileStateProvider>
                    </FavoritesCookieStateProvider>
            </SearchStateProviders>
            {log.info("app root loaded")}
        </ErrorBoundary>
    )
}