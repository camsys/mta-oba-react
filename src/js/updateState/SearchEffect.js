import queryString from "query-string";
import React, {useContext, useEffect, useRef, useState} from "react";
import {CardStateContext, RoutesContext, StopsContext} from "../../components/util/CardStateComponent";
import {OBA} from "../oba";
import {Card, geocodeMatch, routeMatch, routeMatchDirectionDatum, stopMatch} from "./dataModels"
import {siriGetVehiclesForRoutesEffect} from "./SiriEffects";


function processRouteSearch(route,card,stops,routes) {
    let match = new routeMatch()
    console.log("processing route search results",route,card,stops,routes)
    if (route != null && route.hasOwnProperty("directions")) {
        match.color = route?.color
        match.routeId = route?.id
        card.routeIdList.add(match.routeId)
        match.routeTitle = route?.shortName + " " + route?.longName
        match.description = route?.description
        match.directions = []
        match.routeMatches = []
        match.routeMatches.push(match)
        console.log("assigned basic search values to card",route,match)
        for (let i = 0; i < route?.directions.length; i++) {
            let directionDatum = new routeMatchDirectionDatum(route?.directions[i],match.routeId,match.color)
            directionDatum.mapStopComponentData.forEach(stop=>stops.current[stop.id]=stop)
            match.directions.push(directionDatum)
        }
    }
    routes.current[match.routeId]=match
    return match
}

function processGeocodeSearch(geocode,card,stops,routes){
    let match = new geocodeMatch()
    console.log("processing geocode search results",geocode,card,match)
    if (geocode != null && geocode.hasOwnProperty("latitude")) {
        match.latitude = geocode.latitude
        match.longitude = geocode.longitude
        match.routeMatches = []
        geocode?.nearbyRoutes.forEach(searchResult=>{
            if(typeof searchResult?.stopDirection !== "undefined")
            {
                match.routeMatches.push(processStopSearch(searchResult,card,stops,routes))
            }
            else if(typeof searchResult?.longName !== "undefined") {
                match.routeMatches.push(processRouteSearch(searchResult,card,stops,routes))
            }
        })
    }
    // todo: add a list of stops to card.stopIdList, probably need to search to get them,
    // ... honestly this whole thing should be done async during the siri calls which means a minor
    // refactor. but we knew that was coming. given this is a rly fast api call though, probably can make it
    // done seperate for now. also will need to be done before the siri stop-monitoring calls
    console.log("geocode data processed: ",match)
    return match
}

function processStopSearch(stop,card,stops,routes){
    let match = new stopMatch()
    console.log("processing stopMatch search results",stop,card,match)
    if (stop != null && stop.hasOwnProperty("latitude")) {
        card.stopIdList.add(stop.id)
        match.latitude = stop.latitude
        match.longitude = stop.longitude
        match.routeMatches = []
        match.name = stop.name
        match.id = stop.id
        stop?.routesAvailable.forEach(x=>{
            match.routeMatches.push(processRouteSearch(x,card,stops,routes))
        })
    }
    console.log("stopMatch data processed: ",match)
    return match
}

async function getData(card,stops,routes){
    console.log("filling card data with search",card,stops,routes)
    if(card.searchTerm == null || card.searchTerm == ''){
        console.log("empty search means home",card)
        return card
    }
    let address = "http://localhost:8080" + "/" + OBA.Config.searchUrl + "?q=" + card.searchTerm
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
                    card.searchMatches.push(processStopSearch(x,card,stops,routes))
                })
            }
            if(searchResults.resultType=="GeocodeResult"){
                searchResults.matches.forEach(x=>{
                    card.searchMatches.push(processGeocodeSearch(x,card,stops,routes))
                })
            }
            if(searchResults.resultType=="RouteResult"){
                searchResults.matches.forEach(x=>{
                    card.searchMatches.push(processRouteSearch(x,card,stops,routes))
                })
            }
            console.log('completed search results: ',card,stops,routes)
        })
        .catch((error) => {
            console.error(error);
        });
    console.log("got card data: ", card, typeof card, card==null,stops,routes)
    return card
}

const performNewSearch = (searchRef,currentCard) =>{
    if(currentCard.type === Card.cardTypes.vehicleCard){
        // this only works because vehicle searches are handled elsewhere
        return true
    }
    else if(currentCard?.searchTerm == searchRef){
        return false
    }
    return true
}


export const updateCard = async (searchRef,stops,routes) =>{
    console.log("received new search input:",searchRef)
    searchRef = searchRef.replaceAll(" ","%2520")
    return await getData(new Card(searchRef),stops,routes)
}

export const getHomeCard = () =>{
    return new Card("")
}


export const useSearch = () =>{
    const { state, setState } = useContext(CardStateContext);
    const routes = useContext(RoutesContext)
    const stops = useContext(StopsContext)


    const search = async (searchTerm) =>{
        searchTerm = searchTerm.split("_").length > 1
            ? searchTerm.split("_").reduce((acc, part, nth) => nth !== 0 ? acc + part : acc, "")
                .toUpperCase()
            : searchTerm.toUpperCase();
        try {
            console.log("fetch search data called \n\n\n\n\n\n\n\n")
            console.log("generating new card")
            console.log("logging previous state:",state)
            console.log("logging previous card:",state?.currentCard)
            if (performNewSearch(searchTerm,state?.currentCard)) {
                let url = new URL(window.location.href);
                url.searchParams.set('LineRef', searchTerm);
                window.history.pushState({}, '', url);
                let currentCard
                if(searchTerm!=null|searchTerm!=""|searchTerm!="#"){
                    currentCard = await updateCard(searchTerm, stops,routes)
                } else {
                    currentCard = getHomeCard()
                }

                let cardStack = state.cardStack
                cardStack.push(currentCard)
                console.log("updating state with new card:", currentCard,stops,routes)
                setState((prevState) => ({
                    ...prevState,
                    currentCard: currentCard,
                    cardStack: cardStack,
                    renderCounter:prevState.renderCounter+1
                }))
            }
        }
        catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        } finally {
        }
    }

    const generateInitialCard = async (setLoading)=>{
        try {
            console.log("generating initial card")
            const searchRef = queryString.parse(location.search).LineRef;
            let currentCard = await getData(new Card(searchRef),stops,routes)
            console.log("setting initial state data with base card",currentCard)

            let cardStack = state.cardStack
            cardStack.push(currentCard)
            setState((prevState) => ({
                ...prevState,
                currentCard: currentCard,
                cardStack: cardStack,
                renderCounter:prevState.renderCounter+1
            }))
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        } finally {
            setLoading(false);
        }
    }

    //this function doesn't belong in "SearchEffect" but it does belong with card handling functions
// which is what this has become

    const vehicleSearch = async (vehicleData)=> {
        console.log("setting card to vehicle card",vehicleData)
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

    return { search , generateInitialCard, vehicleSearch};
}



