import queryString from "query-string";
import React, {useContext, useEffect, useState} from "react";
import {CardStateContext} from "../../components/util/CardStateComponent";
import {OBA} from "../oba";
import {Card, geocodeMatch, routeMatch, routeMatchDirectionDatum, stopMatch} from "./dataModels"
import {siriGetVehiclesForRoutesEffect} from "./SiriEffects";


    function processRouteSearch(route,card) {
        let match = new routeMatch()
        console.log("processing route search results",route)
        if (route != null && route.hasOwnProperty("directions")) {
            match.color = route?.color
            match.routeId = route?.id
            card.routeIdList.push(match.routeId)
            match.routeTitle = route?.shortName + " " + route?.longName
            match.description = route?.description
            match.directions = []
            match.routeMatches = []
            match.routeMatches.push(match)
            console.log("assigned basic search values to card",route,match)
            for (let i = 0; i < route?.directions.length; i++) {
                let directionDatum = new routeMatchDirectionDatum(route?.directions[i],match.routeId,match.color)
                match.directions.push(directionDatum)
            }
        }
        return match
    }

    function processGeocodeSearch(geocode,card){
        let match = new geocodeMatch()
        console.log("processing geocode search results",geocode,card,match)
        if (geocode != null && geocode.hasOwnProperty("latitude")) {
            match.latitude = geocode.latitude
            match.longitude = geocode.longitude
            match.routeMatches = []
            geocode?.nearbyRoutes.forEach(x=>{
                match.routeMatches.push(processRouteSearch(x,card))
            })
        }
        console.log("geocode data processed: ",match)
        return match
    }

    function processStopSearch(stop,card){
        let match = new stopMatch()
        console.log("processing stopMatch search results",stop,card,match)
        if (stop != null && stop.hasOwnProperty("latitude")) {
            match.latitude = stop.latitude
            match.longitude = stop.longitude
            match.routeMatches = []
            stop?.routesAvailable.forEach(x=>{
                match.routeMatches.push(processRouteSearch(x,card))
            })
        }
        console.log("stopMatch data processed: ",match)
        return match
    }

    async function getData(card){
        console.log("filling card data with search",card)
        if(card.searchTerm == null || card.searchTerm == ''){
            console.log("empty search means home",card)
            return card
        }
        let address = "https://" + OBA.Config.envAddress + "/" + OBA.Config.searchUrl + "?q=" + card.searchTerm
        console.log('requesting search results from ',address)
        await fetch(address)
            .then((response) => response.json())
            .then((parsed) => {
                console.log("got back search results")
                console.log("parsed: ",parsed)
                let searchResults = parsed?.searchResults
                console.log("search results found ",searchResults)
                console.log("resultType = ", searchResults.resultType)
                card.setSearchResultType(searchResults.resultType)
                console.log(card)

                if(searchResults.resultType=="StopResult"){
                    searchResults.matches.forEach(x=>{
                        card.searchMatches.push(processStopSearch(x,card))
                    })
                }
                if(searchResults.resultType=="GeocodeResult"){
                    searchResults.matches.forEach(x=>{
                        card.searchMatches.push(processGeocodeSearch(x,card))
                    })
                }
                if(card.type == Card.cardTypes.routeCard){
                    searchResults.matches.forEach(x=>{
                        card.searchMatches.push(processRouteSearch(x,card))
                    })
                }
                console.log('completed search results: ',card)
            })
            .catch((error) => {
                console.error(error);
            });
        console.log("card: ", card, typeof card, card==null)
        return card
    }


    function postData(card){
        const { state, setState } = useContext(CardStateContext);
        let cardStack = state.cardStack
        cardStack.push(card)
        setState((prevState) => ({
            ...prevState,
            currentCard: card,
            cardStack: cardStack,
            renderCounter:prevState.renderCounter+1
        }))
    }

    const performNewSearch = (searchRef,currentCard) =>{
        if(currentCard?.searchTerm == searchRef){
            return false
        }
        return true
    }


export const updateCard = async (searchRef,currentCard) =>{
    console.log("received new search input:",searchRef)
    // useEffect(() => {
            console.log("performing search")
            searchRef = searchRef.replaceAll(" ","%2520")
            return await getData(new Card(searchRef))
    // })
}

export const generateInitialCard = async ()=>{
    console.log("generating card")
    const searchRef = queryString.parse(location.search).LineRef;
    return await getData(new Card(searchRef))

}

export const getHomeCard = () =>{
    return new Card("")
}

export async function fetchSearchData(state, setState, searchTerm) {
    try {
        console.log("generating new card")
        console.log("logging previous state:",state)
        console.log("logging previous card:",state?.currentCard)
        if (performNewSearch(searchTerm,state?.currentCard)) {
            let url = new URL(window.location.href);
            url.searchParams.set('LineRef', searchTerm);
            window.history.pushState({}, '', url);
            let currentCard
            if(searchTerm!=null|searchTerm!=""|searchTerm!="#"){
                 currentCard = await updateCard(searchTerm, state?.currentCard)
            } else {
                currentCard = getHomeCard()
            }

            let cardStack = state.cardStack
            cardStack.push(currentCard)
            console.log("updating state with new card:", currentCard)
            setState((prevState) => ({
                ...prevState,
                currentCard: currentCard,
                cardStack: cardStack,
                renderCounter:prevState.renderCounter+1
            }))
            siriGetVehiclesForRoutesEffect(currentCard.routeIdList,currentCard.vehicleId)
        }
        }
        catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        } finally {
    }
}


//this function doesn't belong in "SearchEffect" but it does belong with card handling functions
// which is what this has become
export async function selectVehicleCard(vehicleData,state, setState) {
    console.log("setting card to " + vehicleData.vehicleId)
    //todo: should be current search term
    let pastCard = state.currentCard
    let routeId = vehicleData.routeId.split("_")[1];
    console.log("found routeId of target vehicle: ",routeId)
    let currentCard = new Card(routeId)
    let routeData
    pastCard.searchMatches.forEach((match)=>{
            routeData = match.routeMatches.filter(
                value => {return value.routeId==vehicleData.routeId})})
    console.log("found routedata of target vehicle: ",routeData)
    currentCard.setToVehicle(vehicleData.vehicleId,routeData,[vehicleData.routeId])
    let cardStack = state.cardStack
    cardStack.push(currentCard)
    console.log("updating state prev card -> new card: \n", pastCard,currentCard)
    // todo: condense all of these into a single method, copied and pasted too many times
    setState((prevState) => ({
        ...prevState,
        currentCard: currentCard,
        cardStack: cardStack,
        renderCounter:prevState.renderCounter+1
    }))
}