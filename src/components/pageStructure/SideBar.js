import React, {useContext} from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import {RouteCardWrapper} from "../views/RouteCard";
import Header from "./Header";
import Footer from "./Footer";
import SearchBar from "./SearchBar"
import {CardStateContext} from "../util/CardStateComponent.tsx";
import {Card, CardType} from "../../js/updateState/DataModels"
import RefreshComponent from "../views/RefreshComponent";
import VehicleCard from "../views/VehicleCard.tsx";
import {StopCardWrapper} from "../views/StopCardWrapper.tsx";
import {GeoCardWrapper} from "../views/GeoCardWrapper.tsx";
import HomeCard from "../views/HomeCard.tsx";
import {AllRoutesWrapper} from "Components/views/AllRoutesWrapper";
import {ErrorCard} from "../views/ErrorCard.tsx";
import log from 'loglevel';
import { LoadingCard } from '../views/LoadingCard.tsx';

function SideBar  () {

    const { state } = useContext(CardStateContext);

    function renderCardInfo  () {
        log.info("setting card info based on currentCard type: ", state.currentCard)
        if(state.currentCard.type === CardType.HomeCard){
            log.info("adding home card")
            return <HomeCard/>
        }
        if(state.currentCard.type === CardType.ErrorCard){
            log.info("adding error card")
            return <ErrorCard/>
        }
        if((!(state.currentCard.routeIdList) || state.currentCard.routeIdList.length <1) || state.currentCard.type === CardType.LoadingCard){
            log.info("adding loading card")
            return <LoadingCard/>
        }
        if(state.currentCard.type === CardType.RouteCard){
            log.info("adding route card")
            return <RouteCardWrapper/>
        }
        if(state.currentCard.type === CardType.VehicleCard){
            log.info("adding vehicle card")
            return <VehicleCard/>
        }
        if(state.currentCard.type === CardType.StopCard){
            log.info("adding stop card")
            return <StopCardWrapper/>
        }
        if(state.currentCard.type === CardType.GeocodeCard){
            log.info("adding geo card")
            return <GeoCardWrapper/>
        }
        if(state.currentCard.type === CardType.AllRoutesCard){
            log.info("adding allroutes card")
            return <AllRoutesWrapper/>
        }

    }

    log.info("adding sideBar")
    return (
        <div id="sidebar" className={state.currentCard.type === CardType.HomeCard ? "home" : ""}>
        <ErrorBoundary>
            <Header />
            <SearchBar />
            <div className="sidebar-content">
                <div className="content" id="app">
                    {renderCardInfo()}
                    {state.currentCard.type === CardType.HomeCard ? null : <ul className="menu icon-menu middle-menu refresh-menu" role="menu"><li><RefreshComponent/></li></ul>}
                </div>
                <Footer />
            </div>
        </ErrorBoundary>
        </div>
    )
}

export default SideBar;