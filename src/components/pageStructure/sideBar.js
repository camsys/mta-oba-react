import React, {useContext} from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import queryString from "query-string";
import {RouteCardWrapper} from "./../views/RouteCard";
import homeCard from "./../views/homeCard";
import headerComponent from "./header";
import footerComponent from "./footer";
import searchComponent from "./SearchBar"
import {CardStateContext} from "../util/CardStateComponent";
import {Card} from "../../js/updateState/dataModels"
import RefreshComponent from "../views/refreshComponent";
import VehicleCard from "../views/VehicleCard";
import siriVehiclesEffect from "../../js/updateState/SiriEffects";
import {StopCardWrapper} from "../views/StopCardWrapper";
import {GeoCardWrapper} from "../views/GeoCardWrapper";

function getSideBar  () {

    function GetHeader () {
        return headerComponent()
    }

    const { state } = useContext(CardStateContext);

    function GetCardInfo  () {
        console.log("setting card info based on currentCard type: ", state.currentCard)
        if(state.currentCard.type === Card.cardTypes.routeCard){
            OBA.Util.log("adding route card")
            return RouteCardWrapper();
        }
        if(state.currentCard.type === Card.cardTypes.homeCard){
            OBA.Util.log("adding home card")
            return homeCard()
        }
        if(state.currentCard.type === Card.cardTypes.vehicleCard){
            OBA.Util.log("adding vehicle card")
            return VehicleCard()
        }
        if(state.currentCard.type === Card.cardTypes.stopCard){
            OBA.Util.log("adding stop card")
            return StopCardWrapper()
        }
        if(state.currentCard.type === Card.cardTypes.geocodeCard){
            OBA.Util.log("adding geo card")
            return GeoCardWrapper()
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
                <div className="content" id="app">
                    <GetCardInfo />
                    {state.currentCard.type === Card.cardTypes.homeCard ? null : <RefreshComponent/>}
                </div>
                <div className="footer" id="footer">
                    <GetFooter />
                </div>
            </div>
        </ErrorBoundary>
    )
}

export default getSideBar;