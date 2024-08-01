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
import {generateInitialCard} from "../js/updateState/SearchEffect";
import {MapHighlightingStateProvider} from "./util/MapHighlightingStateComponent";
import {siriGetVehiclesForRoutesEffect, siriGetVehiclesForVehicleViewEffect} from "../js/updateState/SiriEffects";
import {Card} from "../js/updateState/dataModels";
import {siriGetVehiclesForStopViewEffect} from "../js/updateState/SiriStopEffects";



const VehicleLoading=()=>{
    const { state} = useContext(CardStateContext)
    let {vehicleState, setState } = useContext(VehicleStateContext);
    let {vehiclesApproachingStopsState, setVehiclesApproachingStopsState } = useContext(VehiclesApproachingStopsContext);
    useEffect(() => {
        const getSiri = () =>{
            if(state.currentCard.type === Card.cardTypes.vehicleCard){
                siriGetVehiclesForVehicleViewEffect(state.currentCard.routeIdList,state.currentCard.vehicleId,
                    vehicleState,setState)
            }
            else{
                siriGetVehiclesForRoutesEffect(state.currentCard.routeIdList,
                    vehicleState,setState)
                if(state.currentCard.type === Card.cardTypes.stopCard){
                    siriGetVehiclesForStopViewEffect(state.currentCard.routeIdList,state.currentCard.stopIdList,
                        vehiclesApproachingStopsState,setVehiclesApproachingStopsState)
                }
                if(state.currentCard.type === Card.cardTypes.geocodeCard){
                    siriGetVehiclesForStopViewEffect(state.currentCard.routeIdList,state.currentCard.stopIdList,
                        vehiclesApproachingStopsState,setVehiclesApproachingStopsState)
                }
            }
        }

        getSiri()
        //todo: set interval back to 15s
        const interval = setInterval(getSiri, 15*1000);
        return () => clearInterval(interval);
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

    useEffect(() => {
        async function fetchData() {
            try {

                let currentCard = await generateInitialCard()
                console.log("setting initial state data with base card",currentCard)

                let cardStack = state.cardStack
                cardStack.push(currentCard)
                setState((prevState) => ({
                    ...prevState,
                    currentCard: currentCard,
                    cardStack: cardStack,
                    renderCounter:prevState.renderCounter+1
                }))
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
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