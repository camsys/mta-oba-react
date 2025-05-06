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


function getSessionUuid(card:Card|null):string{
    log.info("getting session uuid",card)
    let sessionUuid;
    if(card == null || card == undefined || card?.sessionUuid == null || card?.sessionUuid == undefined){
        sessionUuid = uuidv4();
    } else {sessionUuid = card?.sessionUuid;}
    log.info("session uuid is ",sessionUuid)
    return sessionUuid

}

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
    if(card.searchTerm == null || card.searchTerm == ''){
        log.info("empty search means home",card)
        return card
    }
    // let address = "http://localhost:8080" + "/" + OBA.Config.searchUrl + "?q=" + card.searchTerm
    log.info('requesting search results from ',address)
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
                let stopMatch = card.searchMatches[0] as StopMatch
                card.datumId=stopMatch.id
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
    return await getData(new Card(searchRef,uuidv4(),sessionUuid),stops,routes,address)
}

export const getHomeCard = (card:Card|null) :Card=>{
    log.info("generating homecard")
    return new Card("",uuidv4(),getSessionUuid(card))
}

const getBaseAddress =()=>{
    return "https://" + process.env.ENV_ADDRESS + "/"
}

const getSearchAddress=(searchTerm:string)=>{
    log.info("searching for: " + getBaseAddress() + OBA.Config.searchUrl + "?q=" + searchTerm)
    return  getBaseAddress() + OBA.Config.searchUrl + "?q=" + searchTerm

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
        try {
            log.info("fetch search data called, generating new card",state,searchTerm)
            document.getElementById('search-input').blur();
            scrollToSidebarTop();
            if (performNewSearch(searchTerm,state?.currentCard)) {

                let currentCard;
                if(searchTerm!=null|searchTerm!=""|searchTerm!="#"){
                    currentCard = await updateCard(searchTerm, stops,routes,getSearchAddress(searchTerm),getSessionUuid(state?.currentCard));
                } else {
                    currentCard = getHomeCard(state?.currentCard);
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
        let currentCard = new Card("",uuidv4(),getSessionUuid(state?.currentCard));
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
            if(!searchRef){return}
            if(searchRef===allRoutesSearchTerm){
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
            log.info("generating card based on starting query");
            currentCard = await getData(new Card(searchRef,uuidv4(),getSessionUuid(currentCard)),stops,routes,getSearchAddress(searchRef));
            // let currentCard = new Card(searchRef,uuidv4());
            log.info("setting card based on starting query",currentCard);

            let cardStack = state.cardStack;
            cardStack.push(currentCard);
            setState((prevState) => ({
                ...prevState,
                currentCard: currentCard,
                cardStack: cardStack,
                renderCounter:prevState.renderCounter+1
            }));
        } catch (error) {
            log.error('There was a problem with the fetch operation:', error);
        }
    }

    //this function doesn't belong in "SearchEffect" but it does belong with card handling functions
// which is what this has become

    const vehicleSearch = async (routeId:string,vehicleId:string,lonlat:[number,number])=> {
        log.info("setting card to vehicle card",routeId,vehicleId,lonlat);
        //todo: should be current search term
        let pastCard = state.currentCard;
        let shortenedRouteId = routeId.split("_")[1];
        log.info("found routeId of target vehicle: ",shortenedRouteId);
        let currentCard = new Card(shortenedRouteId,uuidv4(),getSessionUuid(pastCard));
        log.info("generated new card to become vehicle card",currentCard,routeId,vehicleId,lonlat);
        let routeData = routes?.current;
        if(routeData){routeData=routeData[routeId]};
        log.info("found routedata of target vehicle: ",routeData);
        currentCard.setToVehicle(vehicleId,[routeData],new Set([routeId]),lonlat);
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
        log.info("vehicleSearch complete, new card: ",currentCard);
    }

    const allRoutesSearch = async () =>{
        let searchTerm = allRoutesSearchTerm;
        let address = getRoutesAddress();
        try {
            log.info("all routes requested, generating new card",state);
            if (state?.currentCard?.type !== CardType.AllRoutesCard) {
                let currentCard = await fetch(address)
                    .then((response) => response.json())
                    .then((parsed) => {
                        log.info("generating new card for all routes search")
                        let currentCard = new Card(searchTerm,uuidv4(),getSessionUuid(state?.currentCard));
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



