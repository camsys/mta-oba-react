import React, {useContext, useEffect, useState} from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary";
import {CardStateContext, CardStateProvider} from "./util/CardStateComponent";
import mapWrap from "./map/mapWrap";

import sideBarComponent from "./pageStructure/sideBar";
import {VehicleStateProvider} from "./util/VehicleStateComponent";
import {generateInitialCard} from "../js/updateState/searchEffect";
import {MapHighlightingStateProvider} from "./util/MapHighlightingStateComponent";
import {siriGetVehiclesForRoutesEffect} from "../js/updateState/SiriEffects";



const VehicleLoading=()=>{
    const { state} = useContext(CardStateContext)
    siriGetVehiclesForRoutesEffect(state.currentCard.routeIdList)
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
            <CardStateProvider>
                <VehicleStateProvider>
                    <MapHighlightingStateProvider>
                        <App/>
                    </MapHighlightingStateProvider>
                </VehicleStateProvider>
            </CardStateProvider>
        </ErrorBoundary>
    )
}

export default Root;