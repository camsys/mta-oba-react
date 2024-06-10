import queryString from "query-string";
import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../components/util/globalState";
import {OBA} from "../oba";
// import MapRouteComponent from "../../components/map/MapRouteComponent";
import {Card, routeMatch, routeMatchDirectionDatum} from "./dataModels"


    function processRouteSearch(route,card) {
        let match = new routeMatch()
        console.log("processing route search results",route,card)
        if (route != null && route.hasOwnProperty("directions")) {
            match.color = route?.color
            match.routeId = route?.id
            match.routeTitle = route?.shortName + " " + route?.longName
            match.description = route?.description
            match.directions = []
            console.log("assigned basic search values to card",route,match)
            for (let i = 0; i < route?.directions.length; i++) {
                let directionDatum = new routeMatchDirectionDatum(route?.directions[i],match.routeId,match.color)
                match.directions.push(directionDatum)
            }
        }
        card.searchMatches.push(match)
        console.log('processed route search',route,card)
        return card
    }



    function getData(card){
        console.log("filling card data with search",card)
        if(card.searchTerm == null || card.searchTerm == ''){
            console.log("empty search means home",card)
            return card
        }
        let address = "https://" + OBA.Config.envAddress + "/" + OBA.Config.searchUrl + "?q=" + card.searchTerm
        console.log('requesting search results from ',address)
        fetch(address)
            .then((response) => response.json())
            .then((parsed) => {
                console.log("got back search results")
                console.log("parsed: ",parsed)
                let searchResults = parsed?.searchResults
                console.log("search results found ",searchResults)
                console.log("resultType = ", searchResults.resultType)
                card.setSearchResultType(searchResults.resultType)
                console.log(card)

                // if(searchResults.resultType=="StopResult"){
                //     searchData = processStopSearch(searchResults)
                //
                // }
                // if(searchResults.resultType=="GeocodeResult"){
                //     searchData = processGeocodeSearch(searchResults)
                //
                // }
                if(card.type == Card.cardTypes.routeCard){
                    searchResults.matches.forEach(x=>{processRouteSearch(x,card)})
                }
                console.log('completed search results: ',card)
            })
            .catch((error) => {
                console.error(error);
            });
        return card
    }


    function postData(card){
        const { state, setState } = useContext(GlobalStateContext);
        let cardStack = state.cardStack
        cardStack.push(card)
        setState((prevState) => ({
            ...prevState,
            currentCard: card,
            cardStack: cardStack
        }))
    }

    const performNewSearch = (searchRef) =>{
        const { state, setState } = useContext(GlobalStateContext);
        if(state?.currentCard?.searchTerm == searchRef){
            return false
        }
        return true
    }


export const updateCard = () =>{
    const searchRef = queryString.parse(location.search).LineRef;
    useEffect(() => {
        if (performNewSearch(searchRef)) {
            fillCard(new Card(searchRef))
        }
    })
}

export const generateInitialCard = ()=>{
    console.log("generating card")
    const searchRef = queryString.parse(location.search).LineRef;
    return getData(new Card(searchRef))
}
