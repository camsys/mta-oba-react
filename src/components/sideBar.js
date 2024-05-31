import React from 'react';
import {OBA} from "../js/oba";
import ErrorBoundary from "./util/errorBoundary";
import queryString from "query-string";
import routeCard from "./views/routeCard";
import homeCard from "./views/homeCard";
import searchWhite from "../img/icon/search_white.svg";
import headerComponent from "./pageStructure/header";
import footerComponent from "./pageStructure/footer";

function getSideBar  () {

    function GetHeader () {
        return headerComponent()
    }

    function GetBusInfo  () {
        const lineRef = queryString.parse(location.search).LineRef;
        if(lineRef){
            OBA.Util.log("adding route card")
            return routeCard();
        }else{
            return homeCard()
        }
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
            <form id="search" method="get" role="search"
                  aria-label="Search an intersection, bus route or bus stop code">
                <div className="search-field-wrap">
                    <label htmlFor="search-field" className="visually-hidden">Search</label>
                    <div id="search-field">
                        <input type="text" name="LineRef" id="search-input" placeholder="Search" autoComplete="off" />
                    </div>
                    <button type="button" aria-label="Submit Search" id="submit-search"
                            onClick="location.href='?LineRef=' + document.getElementById('search-input').value">
                        <img src={searchWhite} alt="Search" />
                    </button>
                </div>
            </form>
            <div className="sidebar-content">
                <div className="search-instructions">
                    <p>Enter an intersection, bus route or bus stop code.</p>
                </div>
                <div className="content" id="app">
                    <GetBusInfo />
                </div>
                <div className="footer" id="footer">
                    <GetFooter />
                </div>
            </div>
        </ErrorBoundary>
    )
}

export default getSideBar;