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
import {useSearch} from "../js/updateState/SearchEffect.tsx";
import {MapHighlightingStateProvider} from "./util/MapHighlightingStateComponent.tsx";
import {siriGetVehiclesForRoutesEffect, siriGetVehiclesForVehicleViewEffect} from "../js/updateState/SiriEffects";
import {siriGetVehiclesForStopViewEffect} from "../js/updateState/SiriStopEffects";
import {CardType} from "../js/updateState/DataModels";
import MapWrapper from "./map/MapWrapper.tsx";
import {FavoritesCookieStateProvider} from "Components/util/MiscStateComponent";



const VehicleLoading=()=>{
    console.log("vehicle loading initiated")
    const { state} = useContext(CardStateContext)
    let {vehicleState, setState } = useContext(VehicleStateContext);
    let {vehiclesApproachingStopsState, setVehiclesApproachingStopsState } = useContext(VehiclesApproachingStopsContext);
    useEffect(() => {
        const getSiri = () =>{
            if(state.currentCard.type === CardType.VehicleCard){
                siriGetVehiclesForVehicleViewEffect(state.currentCard.routeIdList,state.currentCard.vehicleId,
                    vehicleState,setState)
            }
            else{
                siriGetVehiclesForRoutesEffect(state.currentCard.routeIdList,
                    vehicleState,setState)
                if(state.currentCard.type === CardType.StopCard){
                    siriGetVehiclesForStopViewEffect(state.currentCard.routeIdList,state.currentCard.stopIdList,
                        vehiclesApproachingStopsState,setVehiclesApproachingStopsState)
                }
                if(state.currentCard.type === CardType.GeocodeCard){
                    siriGetVehiclesForStopViewEffect(state.currentCard.routeIdList,state.currentCard.stopIdList,
                        vehiclesApproachingStopsState,setVehiclesApproachingStopsState)
                }
            }
        }

        getSiri()
        //todo: set interval back to 15s
        const interval = setInterval(getSiri, 5*1000);
        return () => clearInterval(interval);
    }, [state]);
}

function InitialCardGeneration ({setLoading}){
    const { generateInitialCard } = useSearch();

    useEffect(() => {
        generateInitialCard(setLoading)
    }, []);
}

function App  () {
    OBA.Util.log("adding app")
    const [loading, setLoading] = useState(true);

    return (
        <ErrorBoundary>
            <VehicleLoading/>
            <InitialCardGeneration setLoading={setLoading}/>
            {loading
                ?
                (<ErrorBoundary><div>Loading...</div></ErrorBoundary>)
                :(<React.Fragment>
                <div id="sidebar">
                    <SideBar/>
                </div>
                <MapWrapper/>
            </React.Fragment>)}
        </ErrorBoundary>
    )
}

const Root = () => {
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

export default Root;