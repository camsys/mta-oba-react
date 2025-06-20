import queryString from "query-string";
import React, {useContext, useEffect, useRef, useState} from "react";
import {CardStateContext, RoutesContext, StopsContext} from "Components/util/CardStateComponent";
import {OBA} from "../oba";
import {
    Card,
    GeocodeMatch,
    RouteMatch,
    StopMatch,
    createRouteMatchDirectionInterface,
    CardType,
    StopInterface, RoutesObject, StopsObject, SearchMatch, MatchType, VehicleRtInterface
} from "./DataModels";
import log from 'loglevel';
import {v4 as uuidv4} from 'uuid';
import {getSearchTermAdditions} from "./keyWordsAndSupportUtils.ts"
import { getSessionUuid } from "./handleTracking.ts";

const vehicleDelimiter = ":"
// function getSessionUuid(card:Card|null):string{
//     log.info("getting session uuid",card)
//     let sessionUuid;
//     if(card == null || card == undefined || card?.sessionUuid == null || card?.sessionUuid == undefined){
//         sessionUuid = uuidv4();
//     } else {sessionUuid = card?.sessionUuid;}
//     log.info("session uuid is ",sessionUuid)
//     return sessionUuid

// }

function processRouteSearch(route,card:Card,stops: StopsObject,routes:RoutesObject):RouteMatch {
    let match = new RouteMatch(route)
    log.info("processing route search results",route,card,stops,routes)
    if (route != null && route.hasOwnProperty("directions")) {
        match.color = route?.color
        match.routeId = route?.id.replace("+","-SBS")
        log.info("assigned route id",route,match)
        card.routeIdList.add(match.routeId)
        match.routeTitle = route?.shortName + " " + route?.longName
        match.description = route?.description
        match.directions = []
        match.routeMatches = []
        match.routeMatches.push(match)
        log.info("assigned basic search values to card",route,match)
        for (let i = 0; i < route?.directions.length; i++) {
            let directionDatum = createRouteMatchDirectionInterface(route?.directions[i],match.routeId,match.color)
            directionDatum.mapStopComponentData.forEach(stop=>stops.current[stop.id]=stop)
            match.directions.push(directionDatum)
        }
    }
    routes.current[match.routeId]=match
    return match
}

function processGeocodeSearch(geocode,card:Card,stops: StopsObject,routes:RoutesObject):GeocodeMatch{
    let match = new GeocodeMatch(geocode)
    log.info("processing geocode search results",geocode,card,match)
    if (geocode != null && geocode.hasOwnProperty("latitude")) {
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
    log.info("geocode data processed: ",match)
    return match
}

function processStopSearch(stop,card:Card,stops: StopsObject,routes:RoutesObject):StopMatch{
    let match = new StopMatch(stop)
    log.info("processing stopMatch search results",stop,card,match)
    if (stop != null && stop.hasOwnProperty("latitude")) {
        card.stopIdList.add(stop.id)
        match.routeMatches = []
        stop?.routesAvailable.forEach(x=>{
            match.routeMatches.push(processRouteSearch(x,card,stops,routes))
        })
    }
    log.info("stopMatch data processed: ",match)
    return match
}

function scrollToSidebarTop(){
    // log.info("boop scrolling to top")
    // scroll #sidebar .sidebar-content to top, animate
    let sidebar = document.getElementById("sidebar");
    let sidebarContent = sidebar.querySelector(".sidebar-content");
    sidebarContent.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function getData(card:Card,stops: StopsObject,routes:RoutesObject,address:string):Promise<Card>{
    log.info("filling card data with search",card,stops,routes)
    let vehicleOverride = false;
    if(card.searchTerm == null || card.searchTerm == ''){
        log.info("empty search means home",card)
        return card
    }
    // let address = "http://localhost:8080" + "/" + OBA.Config.searchUrl + "?q=" + card.searchTerm
    log.info('requesting search results from ',address,card)
    await fetch(address)
        .then((response) => response.json())
        .then((parsed) => {
            log.info("got back search results")
            log.info("parsed: ",parsed)
            let searchResults = parsed?.searchResults
            log.info("search results found ",searchResults)
            log.info("resultType = ", searchResults.resultType)
            card.setSearchResultType(searchResults.resultType)
            log.info(card)

            if(searchResults.resultType=="StopResult"){
                searchResults.matches.forEach(x=>{
                    card.searchMatches.push(processStopSearch(x,card,stops,routes))
                })
                if(card.searchMatches.length===0){
                    searchResults.suggestions.forEach(x=>{
                        card.searchMatches.push(processStopSearch(x,card,stops,routes))
                    })
                }
                let stopMatch = card.searchMatches[0] as StopMatch
                card.datumId=stopMatch.id
            }
            if(searchResults.resultType=="GeocodeResult"){
                searchResults.matches.forEach(x=>{
                    card.searchMatches.push(processGeocodeSearch(x,card,stops,routes))
                })
                if(card.searchMatches.length===0){
                    searchResults.suggestions.forEach(x=>{
                        card.searchMatches.push(processStopSearch(x,card,stops,routes))
                    })
                }
            }
            if(searchResults.resultType=="RouteResult"){
                searchResults.matches.forEach(x=>{
                    log.info("processing route search result",x,card,stops,routes)
                    card.searchMatches.push(processRouteSearch(x,card,stops,routes))
                })
                if(card.searchMatches.length===0){
                    searchResults.suggestions.forEach(x=>{
                    log.info("processing route suggestion result",x,card,stops,routes)
                    card.searchMatches.push(processRouteSearch(x,card,stops,routes))
                })}
                let routeMatch = card.searchMatches[0] as RouteMatch
                card.datumId=routeMatch.routeId
            }
            log.info('completed search results: ',card,stops,routes)
        })
        .catch((error) => {
            log.error(error);
        });
    log.info("got card data: ", card, typeof card, card==null,stops,routes)
    return card
}

const performNewSearch = (searchRef:String,currentCard:Card):boolean=>{
    if(currentCard.type === CardType.VehicleCard){
        // this only works because vehicle searches are handled elsewhere
        return true
    }
    else if(currentCard?.searchTerm === searchRef){
        return false
    }
    return true
}

const updateWindowHistory = (term:string,uuid:string) :void =>{
    let url = new URL(window.location.href);
    url.searchParams.set("search", term);
    url.searchParams.set("uuid", uuid);
    log.info("updating window history",url)
    window.history.pushState({}, '', url);
}


export const updateCard = async (searchRef:String,stops: StopsObject,routes:RoutesObject,address:string,sessionUuid:string):Promise<Card> =>{
    log.info("received new search input:",searchRef)
    // searchRef = searchRef.replaceAll(" ","%2520")
    let card = new Card(searchRef,uuidv4(),sessionUuid);
    card.setType(CardType.LoadingCard);
    return await getData(card,stops,routes,address)
}

export const getHomeCard = (card:Card|null) :Card=>{
    log.info("generating homecard")
    let newCard = new Card("",uuidv4(),getSessionUuid(card))
    newCard.setType(CardType.HomeCard);
    return newCard
}

const getBaseAddress =()=>{
    return "https://" + process.env.ENV_ADDRESS + "/"
}

const getSearchAddress=(searchTerm:string, card: Card)=>{
    log.info("temp flag + vars ",searchTerm, card)
    let out = getBaseAddress() + OBA.Config.searchUrl + "?q=" + searchTerm + getSearchTermAdditions(card)
    log.info("generating search address for: " + out)
    return  out

}

const getRoutesAddress=()=>{
    return getBaseAddress() + "/api/routes"
}




export const useNavigation = () =>{
    const { state, setState } = useContext(CardStateContext);
    const routes = useContext(RoutesContext) as RoutesObject
    const stops = useContext(StopsContext) as StopsObject
    const allRoutesSearchTerm = "allRoutes";
    const nearbySearchTerms = new Set(["NEARBY","NEARBYROUTES","NEARBYSTOPS","NEARME", "NEAR ME"])


    const search = async (searchTerm) =>{
        searchTerm = searchTerm.split("_").length > 1
            ? searchTerm.split("_").reduce((acc, part, nth) => nth !== 0 ? acc + part : acc, "")
                .toUpperCase()
            : searchTerm.toUpperCase();
        if(searchTerm===allRoutesSearchTerm){
            document.getElementById('search-input').blur();
            scrollToSidebarTop();
            await allRoutesSearch()
            return
        }
        if(nearbySearchTerms.has(searchTerm)){
            log.info("searching for nearby stops and routes");
            document.getElementById('search-input').blur();
            scrollToSidebarTop();
            await navigator.geolocation.getCurrentPosition(
                (position) => {
                    log.info("got location",position.coords.latitude,position.coords.longitude);
                    let searchTerm = position.coords.latitude.toFixed(6) + "," + position.coords.longitude.toFixed(6);
                    log.info("searching nearby: got location",searchTerm);
                    search(searchTerm);},
                (error) => {
                    log.info("error getting location",error)
                    searchTerm = "could not find user location";
                    return;
                });
        }  
        if(searchTerm.includes(vehicleDelimiter)){
            log.info("searching for vehicle",searchTerm)
            let searchParts = searchTerm.split(vehicleDelimiter);
            let routeId = searchParts[0];
            let vehicleId = searchParts[1];
            vehicleSearch(routeId,vehicleId);
            return;
        }
        try {
            log.info("fetch search data called, generating new card",state,searchTerm)
            document.getElementById('search-input').blur();
            scrollToSidebarTop();
            if (performNewSearch(searchTerm,state?.currentCard)) {
                log.info("search term is new, generating new card",searchTerm,state?.currentCard);
                let currentCard;
                if(searchTerm==null||searchTerm==""||searchTerm=="#"|| !(searchTerm) || !(searchTerm.trim())){
                    currentCard = getHomeCard(state?.currentCard);
                    log.info("search term was empty, generating home card",currentCard);
                }
                else{
                    log.info("search term is not empty, generating new card",searchTerm);
                    currentCard = await updateCard(searchTerm, stops,routes,getSearchAddress(searchTerm,state?.currentCard),getSessionUuid(state?.currentCard));
                } 
                updateWindowHistory(searchTerm,currentCard.uuid);
                document.getElementById('search-input').blur();
                scrollToSidebarTop();
                let cardStack = state.cardStack;
                cardStack.push(currentCard);
                log.info("updating state with new card:", currentCard,stops,routes);
                setState((prevState) => ({
                    ...prevState,
                    currentCard: currentCard,
                    cardStack: cardStack,
                    renderCounter:prevState.renderCounter+1
                }));
            }
        }
        catch (error) {
            log.error('There was a problem with the fetch operation:', error);
        } finally {
            document.getElementById('search-input').blur();
            scrollToSidebarTop();
        }
        document.getElementById('search-input').blur();
        scrollToSidebarTop();
    }

    const generateInitialCard = async (setLoading)=>{
        let currentCard = getHomeCard(new Card("",uuidv4(),getSessionUuid(state?.currentCard)));
        log.info("generating initial card",currentCard);
        let cardStack = state.cardStack;
        cardStack.push(currentCard);
        setState((prevState) => ({
            ...prevState,
            currentCard: currentCard,
            cardStack: cardStack,
            renderCounter:prevState.renderCounter+1
        }));
        setLoading(false);

        try {
            log.info("parsing location.search for initial card data");
            let searchRef = queryString.parse(location.search).search as string;
            if(!searchRef){
                log.info("no search term found in location.search, stopping here", queryString);
                return
            }
            if(searchRef===allRoutesSearchTerm){
                log.info("searching for all routes");
                allRoutesSearch();
                return;
            }

            if(nearbySearchTerms.has(searchRef)){
                log.info("searching for nearby stops and routes");
                await navigator.geolocation.getCurrentPosition(
                    (position) => {
                        log.info("got location",position.coords.latitude,position.coords.longitude);
                        let searchRef = position.coords.latitude.toFixed(6) + "," + position.coords.longitude.toFixed(6);
                        log.info("searching nearby: got location",searchRef);
                        search(searchRef);},
                    (error) => {
                        log.info("error getting location",error)
                        searchRef = "could not find user location";
                        return;
                    });
                searchRef = "";
            }
            let searchAddress =  getSearchAddress(searchRef,currentCard);
            if(searchRef.includes(vehicleDelimiter)){
                searchAddress = getSearchAddress(searchRef.split(vehicleDelimiter)[0],currentCard);
            }
            log.info("generated card based on query and search url", searchRef, searchAddress);
            currentCard = new Card(searchRef,uuidv4(),getSessionUuid(currentCard));
            setState((prevState) => ({
                ...prevState,
                currentCard: currentCard,
                cardStack: cardStack,
                renderCounter:prevState.renderCounter+1
            }));
            currentCard = await getData(currentCard,stops,routes,searchAddress);
            // let currentCard = new Card(searchRef,uuidv4());


            if(searchRef.includes(vehicleDelimiter)){
                log.info("searching for vehicle",searchRef)
                let searchParts = searchRef.split(vehicleDelimiter);
                let routeId = searchParts[0];
                let vehicleId = searchParts[1];
                currentCard.setToVehicle(vehicleId,currentCard.searchMatches,currentCard.routeIdList);
            }
            if(currentCard.routeIdList.size===0){
                currentCard.setToError(null);
            }
            log.info("setting card based on starting query",currentCard);
            cardStack.push(currentCard);
            setState((prevState) => ({...prevState,renderCounter:prevState.renderCounter+1}));
        } catch (error) {
            log.error('There was a problem with the fetch operation:', error);
        }
    }

    //this function doesn't belong in "SearchEffect" but it does belong with card handling functions
// which is what this has become

    const vehicleSearch = async (routeId:string,vehicleId:string)=> {
        log.info("setting card to vehicle card",routeId,vehicleId);
        //todo: should be current search term
        let pastCard = state.currentCard;
        let shortenedRouteId = routeId.split("_")[1];
        log.info("found routeId of target vehicle: ",shortenedRouteId);
        let currentCard = new Card(shortenedRouteId + vehicleDelimiter + vehicleId,uuidv4(),getSessionUuid(pastCard));
        log.info("generated new card to become vehicle card",currentCard,routeId,vehicleId);
        let routeData = routes?.current;
        if(routeData){routeData=routeData[routeId]}
        if(routeData){
            log.info("found routedata of target vehicle: ",routeId, routeData,routes);
            currentCard.setToVehicle(vehicleId,[routeData],new Set([routeId]));
        } else {
            log.error("there's no route data for this vehicle search, routes object is empty or undefined",routeId,routes);
            currentCard.setToError(routeId+vehicleDelimiter+vehicleId)
        }
        let cardStack = state.cardStack;
        cardStack.push(currentCard);
        log.info("updating state prev card -> new vehicle card: \n", pastCard,currentCard);
        // todo: condense all of these into a single method, copied and pasted too many times
        setState((prevState) => ({
            ...prevState,
            currentCard: currentCard,
            cardStack: cardStack,
            renderCounter:prevState.renderCounter+1
        }));
        scrollToSidebarTop();
        updateWindowHistory(currentCard.searchTerm,currentCard.uuid);
        log.info("vehicleSearch complete, new card: ",currentCard);
    }

    const allRoutesSearch = async () =>{
        let searchTerm = allRoutesSearchTerm;
        let address = getRoutesAddress();
        try {
            log.info("all routes requested, generating new card",state);
            if (state?.currentCard?.type !== CardType.AllRoutesCard) {
                let currentCard = new Card(searchTerm,uuidv4(),getSessionUuid(state?.currentCard));
                setState((prevState) => ({
                    ...prevState,
                    currentCard: currentCard,
                    cardStack: cardStack,
                    renderCounter:prevState.renderCounter+1
                }));
                await fetch(address)
                    .then((response) => response.json())
                    .then((parsed) => {
                        log.info("generating new card for all routes search")
                        log.info("all routes results: ",parsed);
                        let searchMatch = new SearchMatch(SearchMatch.matchTypes.AllRoutesMatch);
                        searchMatch.routeMatches = parsed?.routes.map(route=>new RouteMatch(route));
                        let routeIdList = new Set();
                        // parsed?.routes.forEach(route=>routeIdList.add(route.id));
                        currentCard.setToAllRoutes([searchMatch],routeIdList);
                        log.info('completed processing all routes results: ',currentCard,stops,routes);
                        return currentCard
                    })
                    .catch((error) => {
                        log.error(error);
                    });
                updateWindowHistory(searchTerm,currentCard.uuid);
                let cardStack = state.cardStack;
                cardStack.push(currentCard);
                log.info("updating state with new card:", currentCard,stops,routes);
            setState((prevState) => ({...prevState,renderCounter:prevState.renderCounter+1}));
            }
        }
        catch (error) {
            log.error('There was a problem with the fetch operation:', error);
        } finally {
        }
    }

    // useEffect(() => {
    //     const handlePopState = () => {
    //         const url = new URL(window.location.href);
    //         const lineRef = url.searchParams.get('LineRef');
    //         if (lineRef) {
    //             updateFromUrl(lineRef);
    //         }
    //     };
    //
    //     window.addEventListener('popstate', handlePopState);
    //     return () => window.removeEventListener('popstate', handlePopState);
    // }, []);

    const updateStateForPopStateEvent = (popStateEvent: PopStateEvent) => {
        log.info("navigation effect handling popstate event",window.history.state,popStateEvent,popStateEvent.state)
        let uuid = new URL(window.location.href).searchParams.get('uuid');
        let currentCard = state?.currentCard;
        let cardStack = state.cardStack;
        for(let i=0; i<cardStack.length; i++){
            if(cardStack[i].uuid===uuid){
                currentCard = cardStack[i];
            }
        }
        setState((prevState) => ({
            ...prevState,
            currentCard: currentCard,
            renderCounter:prevState.renderCounter+1
        }));
    }

    const goBack = () => {
        let cardStack = state.cardStack;
        let currentCard = state?.currentCard;
        log.info("going back to previous card",cardStack, currentCard);
        if(cardStack.length<2){
            log.info("no previous card in stack");
            return}
        for(let i=cardStack.length-1; i>1; i--){
            if(cardStack[i]===currentCard){
                log.info("found previous card in stack",cardStack[i-1]);
                currentCard = cardStack[i-1];
                break;
            }
        }
        window.history.back();
        setState((prevState) => ({
            ...prevState,
            currentCard: currentCard,
            renderCounter:prevState.renderCounter+1
        }));
    }

    const goForward = () => {
        let cardStack = state.cardStack;
        let currentCard = state?.currentCard;
        log.info("going forward to next card",cardStack, currentCard);
        if(cardStack.length<2){
            log.info("no next card in stack");
            return}
        if(cardStack[cardStack.length-1]===currentCard){
            log.info("already at last card in stack");
            return}
        for(let i=cardStack.length-2; i>0; i--){
            if(cardStack[i]===currentCard){
                log.info("found next card in stack",cardStack[i+1]);
                currentCard = cardStack[i+1];
                break
            }
        }
        window.history.forward();
        setState((prevState) => ({
            ...prevState,
            currentCard: currentCard,
            renderCounter:prevState.renderCounter+1
        }));
    }

    return { search, generateInitialCard, vehicleSearch, allRoutesSearch, updateStateForPopStateEvent, goBack,goForward };
}



