import React, {useContext, useEffect, useState} from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary";
import {CardStateContext, CardStateProvider, SearchStateProviders} from "./util/CardStateComponent";
import mapWrap from "./map/mapWrap";

import sideBarComponent from "./pageStructure/sideBar";
import {
    VehiclesApproachingStopsContext,
    VehiclesApproachingStopsProvider,
    VehicleStateContext,
    VehicleStateProvider
} from "./util/VehicleStateComponent";
import {useSearch} from "../js/updateState/SearchEffect";
import {MapHighlightingStateProvider} from "./util/MapHighlightingStateComponent";
import {siriGetVehiclesForRoutesEffect, siriGetVehiclesForVehicleViewEffect} from "../js/updateState/SiriEffects";
import {Card} from "../js/updateState/dataModels";
import {siriGetVehiclesForStopViewEffect} from "../js/updateState/SiriStopEffects";
import {CardType} from "../js/updateState/DataModels2";



const VehicleLoading=()=>{
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
        // const interval = setInterval(getSiri, 15*1000);
        // return () => clearInterval(interval);
    }, [state]);
}

function App  () {

    function GetSideBar () {
        return sideBarComponent()
    }
    function GetMapWrapper () {
        return mapWrap()
    }

    OBA.Util.log("adding app")

    const [loading, setLoading] = useState(true);
    const { state, setState } = useContext(CardStateContext);
    const { generateInitialCard } = useSearch();

    useEffect(() => {
        generateInitialCard(setLoading)
    }, []);


    if (loading) {
        return <ErrorBoundary><div>Loading...</div></ErrorBoundary>;
    }

    return (
        <ErrorBoundary>
            <VehicleLoading/>
            <div id="sidebar">
                <GetSideBar />
            </div>
            <GetMapWrapper />
        </ErrorBoundary>
    )
}

const Root = () => {
    return (
        <ErrorBoundary>
            <SearchStateProviders>
                <VehicleStateProvider>
                    <VehiclesApproachingStopsProvider>
                        <MapHighlightingStateProvider>
                            <App/>
                        </MapHighlightingStateProvider>
                    </VehiclesApproachingStopsProvider>
                </VehicleStateProvider>
            </SearchStateProviders>
        </ErrorBoundary>
    )
}

export default Root;