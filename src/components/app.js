import React, {useContext} from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary";
import {GlobalStateContext, GlobalStateProvider} from "./util/globalState";
import mapWrap from "./map/mapWrap";

import useUpdateCurrentCardData from "../js/updateState/useUpdateCurrentCardData";
import sideBarComponent from "./pageStructure/sideBar";



function App  () {

    const { state } = useContext(GlobalStateContext);

    useUpdateCurrentCardData(state.currentCard);

    function GetSideBar () {
        return sideBarComponent()
    }
    function GetMapWrapper () {
        return mapWrap()
    }

    OBA.Util.log("adding app")

    return (
        <ErrorBoundary>
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
            <GlobalStateProvider>
                <App />
            </GlobalStateProvider>
        </ErrorBoundary>
    )
}

export default Root;