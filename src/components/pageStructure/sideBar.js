import React from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "./../util/errorBoundary";
import queryString from "query-string";
import routeCard from "./../views/routeCard";
import homeCard from "./../views/homeCard";
import headerComponent from "./header";
import footerComponent from "./footer";
import searchComponent from "./search"

function getSideBar  () {

    function GetHeader () {
        return headerComponent()
    }

    function GetCardInfo  () {
        const lineRef = queryString.parse(location.search).LineRef;
        if(lineRef){
            OBA.Util.log("adding route card")
            return routeCard();
        }else{
            OBA.Util.log("adding home card")
            return homeCard()
        }
    }

    function GetSearch () {
        return searchComponent()
    }

    function GetFooter () {
        return footerComponent()
    }

    OBA.Util.log("adding sideBar")
    return (
        <ErrorBoundary>
            <header className="header" id="header">
                <GetHeader />
            </header>
            <GetSearch />
            <div className="sidebar-content">
                <div className="search-instructions">
                    <p>Enter an intersection, bus route or bus stop code.</p>
                </div>
                <div className="content" id="app">
                    <GetCardInfo />
                </div>
                <div className="footer" id="footer">
                    <GetFooter />
                </div>
            </div>
        </ErrorBoundary>
    )
}

export default getSideBar;