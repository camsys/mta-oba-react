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
import {siriGetVehiclesForRoutesEffect, siriGetVehiclesForVehicleViewEffect} from "../js/updateState/SiriEffects";
import {siriGetVehiclesForStopViewEffect} from "../js/updateState/SiriStopEffects";
import {CardType} from "../js/updateState/DataModels";
import {MapWrapper} from "./map/MapWrapper.tsx";
import {FavoritesCookieStateProvider} from "Components/util/MiscStateComponent";
import log from 'loglevel';
import {useSiri} from "../js/updateState/getSiri.tx";



const VehicleLoading=()=>{
    log.info("vehicle loading initiated")
    const { state} = useContext(CardStateContext)
    const { updateSiriEffect } = useSiri();
    useEffect(() => {

        updateSiriEffect()
        //todo: set interval back to 15s
        const interval = setInterval(updateSiriEffect, 15*1000);
        return () => clearInterval(interval);
    }, [state]);
}

function InitialCardGeneration ({setLoading}){
    const { generateInitialCard } = useNavigation();

    useEffect(() => {
        generateInitialCard(setLoading)
    }, []);
}

function App  () : JSX.Element{
    log.info("adding app")
    const [loading, setLoading] = useState(true);

    return (
        <ErrorBoundary>

            <InitialCardGeneration setLoading={setLoading}/>
            {loading
                ?
                (<ErrorBoundary><div>Loading...</div></ErrorBoundary>)
                :(<React.Fragment>
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
        </ErrorBoundary>
    )
}