import React, {useContext} from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import {RouteCardWrapper} from "./../views/RouteCard";
import Header from "./Header";
import Footer from "./Footer";
import SearchBar from "./SearchBar"
import {CardStateContext} from "../util/CardStateComponent";
import {Card} from "../../js/updateState/dataModels"
import RefreshComponent from "../views/refreshComponent";
import VehicleCard from "../views/VehicleCard";
import {StopCardWrapper} from "../views/StopCardWrapper";
import {GeoCardWrapper} from "../views/GeoCardWrapper";
import HomeCard from "../views/HomeCard";

function getSideBar  () {

    const { state } = useContext(CardStateContext);

    function renderCardInfo  () {
        console.log("setting card info based on currentCard type: ", state.currentCard)
        if(state.currentCard.type === Card.cardTypes.routeCard){
            OBA.Util.log("adding route card")
            return <RouteCardWrapper/>
        }
        if(state.currentCard.type === Card.cardTypes.homeCard){
            OBA.Util.log("adding home card")
            return <HomeCard/>
        }
        if(state.currentCard.type === Card.cardTypes.vehicleCard){
            OBA.Util.log("adding vehicle card")
            return <VehicleCard/>
        }
        if(state.currentCard.type === Card.cardTypes.stopCard){
            OBA.Util.log("adding stop card")
            return <StopCardWrapper/>
        }
        if(state.currentCard.type === Card.cardTypes.geocodeCard){
            OBA.Util.log("adding geo card")
            return <GeoCardWrapper/>
        }
    }

    OBA.Util.log("adding sideBar")
    return (
        <ErrorBoundary>
            <Header />
            <SearchBar />
            <div className="sidebar-content">
                <div className="content" id="app">
                    {renderCardInfo()}
                    {state.currentCard.type === Card.cardTypes.homeCard ? null : <RefreshComponent/>}
                </div>
                <Footer />
            </div>
        </ErrorBoundary>
    )
}

export default getSideBar;