import React, {useContext} from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary";
import {CardStateContext, CardStateProvider} from "./util/CardStateComponent";
import mapWrap from "./map/mapWrap";

import useUpdateCurrentCardData from "../js/updateState/useUpdateCurrentCardData";
import sideBarComponent from "./pageStructure/sideBar";
import {VehicleStateProvider} from "./util/VehicleStateComponent";



function App  () {

    OBA.Util.log("adding app")

    function GetSideBar () {
        return sideBarComponent()
    }
    function GetMapWrapper () {
        return mapWrap()
    }
    
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
            <CardStateProvider>
                <VehicleStateProvider>
                    <App/>
                </VehicleStateProvider>
            </CardStateProvider>
        </ErrorBoundary>
    )
}

export default Root;