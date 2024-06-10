import React, {useContext} from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import queryString from "query-string";
import getRouteCard from "./../views/RouteCard";
import homeCard from "./../views/homeCard";
import headerComponent from "./header";
import footerComponent from "./footer";
import searchComponent from "./search"
import {GlobalStateContext} from "../util/globalState";
import {Card} from "../../js/updateState/dataModels"

function getSideBar  () {

    function GetHeader () {
        return headerComponent()
    }

    const { state } = useContext(GlobalStateContext);

    function GetCardInfo  () {
        console.log("setting card info based on currentCard type: ", state.currentCard)
        if(state.currentCard.type === Card.cardTypes.routeCard){
            OBA.Util.log("adding route card")
            return getRouteCard();
        }
        if(state.currentCard.type === Card.cardTypes.homeCard){
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