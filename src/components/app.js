import React from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary";
import mapWrap from "./map/mapWrap";
import sideBarComponent from "./pageStructure/sideBar";



function getApp  () {
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


export default getApp;