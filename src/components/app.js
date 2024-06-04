import React from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary";
import {GlobalStateProvider} from "./util/globalState";
import mapWrap from "./map/mapWrap";

import useInitializeData from "../js/updateState/initializeData";
import sideBarComponent from "./pageStructure/sideBar";



function App  () {
    useInitializeData();

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
            <div id="map-wrap">
                <GetMapWrapper />
            </div>
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