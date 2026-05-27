import queryString from "query-string";
import React, {useContext, useEffect, useRef, useState} from "react";
import {useCardState, useRoutes, useStops} from "../../components/util/CardStateComponent";
import {OBA} from "../oba";
import {
    Card,
    GeocodeMatch,
    RouteMatch,
    StopMatch,
    createRouteMatchDirectionInterface,
    CardType,
    StopInterface, RoutesObjectContainer, StopsObjectContainer, SearchMatch, MatchType, VehicleRtInterface,
    AgencyAndId
} from "./DataModels";
import log from 'loglevel';
import {v4 as uuidv4} from 'uuid';
import {getSearchTermAdditions} from "./keyWordsAndSupportUtils"
import { getSessionUuid } from "./handleTracking";
import { SearchGeoData, SearchRouteData, SearchStopData } from "./DataContracts";


// function getSessionUuid(card:Card|null):string{
//     log.info("getting session uuid",card)
//     let sessionUuid;
//     if(card == null || card == undefined || card?.sessionUuid == null || card?.sessionUuid == undefined){
//         sessionUuid = uuidv4();
//     } else {sessionUuid = card?.sessionUuid;}
//     log.info("session uuid is ",sessionUuid)
//     return sessionUuid

// }



// *-----------------SHARED CONSTANTS-----------------*
const vehicleDelimiter = ":"
export const noMapNeededCardTypes = [CardType.HomeCard, CardType.FavoritesCard, CardType.AllRoutesCard]
export const allRoutesSearchTerm = "View All Routes";
export const favoritesSearchTerm = "View Favorites";
export const nearbySearchTerms = new Set(["NEARBY","NEARBYROUTES","NEARBYSTOPS","NEARME", "NEAR ME"])







/// *-----------------DATA SEEKING METHODS-----------------*




function processRouteSearch(route: SearchRouteData, card: Card, stops: StopsObjectContainer, routes: RoutesObjectContainer): RouteMatch {
    let match = new RouteMatch(route)
    log.info("processing route search results",route,card,stops,routes, match)
    if (route != null && route.hasOwnProperty("directions")) {
        match.color = route?.color
        match.datumId =match.routeId = AgencyAndId.get(route?.id.replace("+","-SBS"))

        log.info("assigned route id",route,match)
        card.routeIdList.add(match.datumId)
        match.datumName = match.routeTitle = route?.shortName + " " + route?.longName
        match.description = route?.description
        if(match.description == null || match.description == undefined){
            match.description = "\u00A0"
        }
        match.directions = []
        match.routeMatches = []
        match.routeMatches.push(match)
        log.info("assigned basic search values to card",route,match)
        for (let i = 0; i < route?.directions.length; i++) {
            let directionDatum = createRouteMatchDirectionInterface(route?.directions[i],match.datumId,match.color)
            directionDatum.mapStopComponentData.forEach(stop=>{
                const stopId: AgencyAndId | string = stop.id;
                const stopIndexable = typeof stopId === 'string' ? stopId : stopId.toString();
                stops.current[stopIndexable]=stop
            })
            match.directions.push(directionDatum)
        }
    }
    const probablyAgencyAndId: AgencyAndId = match.routeId;
    const routeIndexable : string = typeof probablyAgencyAndId === 'string' ? probablyAgencyAndId : probablyAgencyAndId.toString();
    routes.current[routeIndexable]=match
    return match
}

function processGeocodeSearch(geocode: SearchGeoData, card: Card, stops: StopsObjectContainer, routes: RoutesObjectContainer): GeocodeMatch {
    let match = new GeocodeMatch(geocode)
    log.info("processing geocode search results",geocode,card,match)
    if (geocode != null && geocode.hasOwnProperty("latitude")) {
        geocode?.nearbyRoutes.forEach((searchResult: SearchRouteData | SearchStopData) => {
            if('stopDirection' in searchResult)
            {
                match.routeMatches.push(processStopSearch(searchResult as SearchStopData, card, stops, routes))
            }
            else if('longName' in searchResult) {
                match.routeMatches.push(processRouteSearch(searchResult as SearchRouteData, card, stops, routes))
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

function processStopSearch(stop: SearchStopData, card: Card, stops: StopsObjectContainer, routes: RoutesObjectContainer): StopMatch {
    let match = new StopMatch(stop)
    log.info("processing stopMatch search results",stop,card,match)
    if (stop != null && stop.hasOwnProperty("latitude")) {
        card.stopIdList.add(stop.id)
        match.routeMatches = []
        stop?.routesAvailable.forEach((x: SearchRouteData) => {
            match.routeMatches.push(processRouteSearch(x,card,stops,routes))
        })
    }
    log.info("stopMatch data processed: ",match)
    return match
}


function processSearchResponse(response: Response, card:Card,stops: StopsObjectContainer,routes:RoutesObjectContainer, assignEtag = null): Card {
    try {
        let parsed = response?.json ? response.json() : response;
        log.info("got back search results")
        log.info("parsed: ",parsed)
        let searchResults = parsed?.searchResults
        log.info("search results found ",searchResults)
        log.info("resultType = ", searchResults.resultType)
        card.asSearchResultType(searchResults.resultType)
        log.info(card)

        if(Card.STOPCARDIDENTIFIERS.has(searchResults.resultType)){
            searchResults.matches.forEach((x: any)=>{
                card.searchMatches.push(processStopSearch(x,card,stops,routes).asOverrideEtag(assignEtag))
            })
            if(card.searchMatches.length===0){
                searchResults.suggestions.forEach((x: any)=>{
                    card.searchMatches.push(processStopSearch(x,card,stops,routes).asOverrideEtag(assignEtag))
                })
            }
            let stopMatch = card.searchMatches[0] as StopMatch
            card.datumId=stopMatch.id
        }
        if(Card.GEOCARDIDENTIFIERS.has(searchResults.resultType)){
            searchResults.matches.forEach((x: any)=>{
                card.searchMatches.push(processGeocodeSearch(x,card,stops,routes).asOverrideEtag(assignEtag))
            })
            if(card.searchMatches.length===0){
                searchResults.suggestions.forEach((x: any)=>{
                    card.searchMatches.push(processGeocodeSearch(x,card,stops,routes).asOverrideEtag(assignEtag))
                })
            }
        }
        if(Card.ROUTECARDIDENTIFIERS.has(searchResults.resultType)){
            searchResults.matches.forEach((x: any)=>{
                log.info("processing route search result",x,card,stops,routes)
                card.searchMatches.push(processRouteSearch(x,card,stops,routes).asOverrideEtag(assignEtag))
            })
            if(card.searchMatches.length===0){
                searchResults.suggestions.forEach((x: any)=>{
                log.info("processing route suggestion result",x,card,stops,routes)
                card.searchMatches.push(processRouteSearch(x,card,stops,routes).asOverrideEtag(assignEtag))
            })}
            let routeMatch = card.searchMatches[0] as RouteMatch
            card.datumId=routeMatch.routeId
        }
        log.info('completed search results: ',card,stops,routes)
    } catch (error) {
        log.error("SearchMatchVerification -- error processing search response:", error);
        error = error instanceof Error ? error : new Error(String(error));
        log.error(error);
        card.asError(error);
    }
    return card;
}


async function getData(card:Card,stops: StopsObjectContainer,routes:RoutesObjectContainer,address:string):Promise<Card>{
    log.info("filling card data with search",card,stops,routes)
    if(card.searchTerm == null || card.searchTerm == ''){
        log.info("empty search means home",card)
        return card
    }
    log.info('requesting search results from ',address,card)
    await fetch(address)
        .then(async (response) => {processSearchResponse(await response.json(), card, stops, routes, response.headers.get('ETag'))})
        .catch((error) => {
            log.error(error);
            card.asError(error);
        });
    log.info("got card data: ", card, typeof card, card==null,stops,routes)
    return card
}



const performNewSearch = (searchRef:string,currentCard:Card):boolean=>{
    if(currentCard.type === CardType.VehicleCard){
        // this only works because vehicle searches are handled elsewhere
        return true
    }
    else if(currentCard?.searchTerm === searchRef){
        return false
    }
    return true
}








// *-----------------PAGE UTILITIES-----------------*


function blurAndScroll(){
    document.getElementById('search-input')?.blur();
    scrollToSidebarTop();
}

function scrollToSidebarTop(){
    let sidebar = document.getElementById("sidebar");
    let sidebarContent = sidebar?.querySelector(".sidebar-content");
    if (sidebarContent) {
        sidebarContent.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}



const updateWindowHistory = (term:string,uuid:string) :void =>{
    let url = new URL(window.location.href);
    url.searchParams.set("search", term);
    url.searchParams.set("uuid", uuid);
    log.info("updating window history",url)
    window.history.pushState({}, '', url);
}


// *-----------------ADDRESS UTILITIES-----------------*


const getBaseAddress =()=>{
    return "https://" + process.env.ENV_ADDRESS + "/"
}

const getSearchAddress=(searchTerm:string, card: Card)=>{
    if (process.env.OVERIDE_SEARCH_ENDPOINT) {
        return process.env.OVERIDE_SEARCH_ENDPOINT;
    }
    const ampersandToAnd = (input:string) => input.replace(/&/g, 'and');
    let out = getBaseAddress() + OBA.Config.searchUrl + "?q=" + ampersandToAnd(searchTerm) + getSearchTermAdditions(card)
    log.info("generating search address for: " + out)
    return  out

}

const getRoutesAddress=()=>{
    return getBaseAddress() + "/api/routes"
}





// *-----------------CARD UTILITIES-----------------*

export const updateCard = async (searchRef:string,stops: StopsObjectContainer,routes:RoutesObjectContainer,address:string,sessionUuid:string):Promise<Card> =>{
    log.info("received new search input:",searchRef)
    // searchRef = searchRef.replaceAll(" ","%2520")
    let card = new Card(searchRef,uuidv4(),sessionUuid);
    card.asType(CardType.LoadingCard);
    return await getData(card,stops,routes,address)
}

export const getHomeCard = (card:Card|null) :Card=>{
    log.info("generating homecard")
    let newCard = new Card("",uuidv4(),getSessionUuid(card))
    newCard.asType(CardType.HomeCard);
    return newCard
}







const normalizeSearchTerm = (searchTerm:string|AgencyAndId):string=>{
    if(searchTerm instanceof Object){
        searchTerm = searchTerm.toString()
    }
    searchTerm = searchTerm.split("_").length > 1
        ? searchTerm.split("_").reduce((acc, part, nth) => nth !== 0 ? acc + part : acc, "")
            .toUpperCase()
        : searchTerm.toUpperCase();
    return searchTerm
}

const extractRouteFromVehicleSearchTerm = (searchTerm:string):AgencyAndId =>{
    let searchParts = searchTerm.split(vehicleDelimiter);
    let routeId = AgencyAndId.get(searchParts[0]);
    return routeId;
}

const extractVehicleFromVehicleSearchTerm = (searchTerm:string):string =>{
    let searchParts = searchTerm.split(vehicleDelimiter);
    return searchParts[1];
}


const generateVehicleCard = (routeId: AgencyAndId, vehicleId: string, card: Card, routes: RoutesObjectContainer):Card =>{
        //todo: should be current search term
    let pastCard = card;
    let shortenedRouteId = routeId.id;
    log.info("found routeId of target vehicle: ",shortenedRouteId);
    let currentCard = new Card(shortenedRouteId + vehicleDelimiter + vehicleId,uuidv4(),getSessionUuid(pastCard));
    log.info("generated new card to become vehicle card",currentCard,routeId,vehicleId);
    let routeData;
    if(routes?.current){routeData=routes?.current[routeId.toString()]}
    if(routeData){
        log.info("found routedata of target vehicle: ",routeId, routeData,routes);
        currentCard.asVehicle(vehicleId,[routeData],new Set([routeId]));
    } else {
        log.error("there's no route data for this vehicle search, routes object is empty or undefined",routeId,routes);
        currentCard.asError(routeId+vehicleDelimiter+vehicleId)
    }
    log.info("updating state prev card -> new vehicle card: \n", pastCard,currentCard);
    return currentCard;
}

const transformIntoErrorCard = (error: unknown, card: Card):Card =>{
    const safeError = error instanceof Error ? error : new Error(String(error));
    log.error('There was a problem with the fetch operation:', safeError);
    card.asError(safeError);
    return card;
}


const transformIntoAllRoutesCard = async (card: Card):Promise<Card> =>{
    let address = getRoutesAddress();
    await fetch(address)
        .then((response) => response.json())
        .then((parsed) => {
            log.info("generating new card for all routes search")
            log.info("all routes results: ",parsed);
            let searchMatch = new SearchMatch(SearchMatch.matchTypes.AllRoutesMatch);
            searchMatch.routeMatches = parsed?.routes.map((route: SearchRouteData) => new RouteMatch(route));
            let routeIdList: Set<AgencyAndId> = new Set();
            // parsed?.routes.forEach(route=>routeIdList.add(route.id));
            card.asAllRoutes([searchMatch],routeIdList);
            return card
        })
        .catch((error) => {
            log.error(error);
            return transformIntoErrorCard(error, card);
        });
    return card;
}

const transfromIntoRegularSearchCard = async (card: Card,stops: StopsObjectContainer,routes:RoutesObjectContainer):Promise<Card> =>{
    let address = getSearchAddress(card.searchTerm,card);
    try{
        card = await getData(card,stops,routes,address)
    }
    catch (error) {
        transformIntoErrorCard(error, card);
    }
    return card;
}


// it would be more efficient to inject the fixes and bump the render counter but that represents a higher risk of errors. 
// may be worth coming back to post playwright tests
const shouldRefreshCardLevelData = async (searchMatch : SearchMatch, card: Card):Promise<boolean> =>{
    log.info("SearchMatchVerification -- shouldRefreshCardLevelData called with match type:", searchMatch.type);
    // if the type is routeMatch, just do that level
    if(searchMatch.type === MatchType.RouteMatch || searchMatch.type === MatchType.StopMatch){
        log.info("SearchMatchVerification -- detected RouteMatch or StopMatch");
        // insert the remote check here
        let routeOrStopMatch = searchMatch as RouteMatch | StopMatch;
        log.info("SearchMatchVerification -- checking if newer data exists for:", routeOrStopMatch.datumId);
        if(await newerDataExists(routeOrStopMatch, card)){
            log.info("SearchMatchVerification -- newer data DOES exist, returning true");
            return true;
        }
        log.info("SearchMatchVerification -- no newer data found for this match");
    }
    if(searchMatch.type === MatchType.GeocodeMatch){
        log.info("SearchMatchVerification -- detected GeocodeMatch, recursively checking route matches");
        let geocodeMatch = searchMatch as GeocodeMatch;
        log.info("SearchMatchVerification -- geocodeMatch has", geocodeMatch.routeMatches.length, "route matches to check");
        for (const routeOrStopMatch of geocodeMatch.routeMatches) {
            log.info("SearchMatchVerification -- recursively checking route match:", routeOrStopMatch.datumId);
            if(await shouldRefreshCardLevelData(routeOrStopMatch as SearchMatch, card)){
                log.info("SearchMatchVerification -- recursive check found newer data, newer data DOES exist, returning true");
                return true;
            }
        }
        log.info("SearchMatchVerification -- all geocode route matches checked, no newer data found");
    }

    log.info("SearchMatchVerification -- shouldRefreshCardLevelData returning false");
    return false;
}

const getEtagFromCard = (card: Card): string | null =>{
    if(card.searchMatches.length > 0){
        if(card.searchMatches.length > 1){
            log.warn("etag requested from card with multiple top level search matches, using etag from first match.")
        }
        return card.searchMatches[0]?.etag || null;
    }
    return null;
}




export const useNavigation = () =>{
    log.debug("initializing navigation effect")
    const { state, setState } = useCardState();
    const routes = useRoutes()
    const stops = useStops()
    log.debug("navigation effect state and contexts", state, routes, stops)

    const generateCardForSearchTerm = async (searchTerm:string, etag: string | null = null):Promise<Card> =>{
        log.info("generating card for search term: ",searchTerm)
        let card = new Card(searchTerm,uuidv4(),getSessionUuid(state.currentCard));

        let address = getSearchAddress(searchTerm,card)
        log.info("SearchMatchVerification -- ETag value:", etag);
        try {
            let response;
            log.info("SearchMatchVerification -- checking for newer data with ETag at address:", address)
            if(process.env.CACHING_ENABLED === "true" && etag){
                response = await fetch(address, {
                    headers: {
                        'If-None-Match': etag
                    }
                });
                response = await response.json();
                log.info("SearchMatchVerification -- fetch response status:", response.status);
                if(response.status === 304){
                    log.info("SearchMatchVerification -- received 304 Not Modified, data is unchanged");
                    // todo: this should be more surgical and adds code debt of weird result handling
                    card = state.currentCard;
                }
                else {
                    processSearchResponse(response, card, stops, routes);
                }
            } else {
                response = await getData(card,stops,routes,getSearchAddress(searchTerm,card))
            }      
        } catch (error) {
            log.error("SearchMatchVerification -- error during newerDataExists fetch:", error);
            error = error instanceof Error ? error : new Error(String(error));
            log.error(error);
            card.asError(error);
        }
        return card;
    }
    
    const conditionallyRefreshSearchData = async (): Promise<void> =>{ 

        let searchTerm = state.currentCard.searchTerm;
        searchTerm = normalizeSearchTerm(searchTerm);
        log.info("SearchMatchVerification -- newerDataExists called for match:", searchTerm, state.currentCard);

        if(searchTerm===allRoutesSearchTerm){
            return
        }
        if(searchTerm===favoritesSearchTerm){
            return
        }
        if(nearbySearchTerms.has(searchTerm)){
            return;
        }
        if(searchTerm==null||searchTerm==""||searchTerm=="#"|| !(searchTerm) || !(searchTerm.trim())){
            return;
        }  
        if(searchTerm.includes(vehicleDelimiter)){
            searchTerm = extractRouteFromVehicleSearchTerm(searchTerm).id;
        }
        let currentCard = state.currentCard;
        if(currentCard.type === CardType.RouteCard || currentCard.type === CardType.StopCard 
            || currentCard.type === CardType.VehicleCard || 
            (currentCard.type === CardType.GeocodeCard && process.env.CACHING_ENABLED !== "true")){
            let etag = getEtagFromCard(currentCard);
            let newCard = await generateCardForSearchTerm(searchTerm, etag);
            let searchMatchesUnchanged = newCard.searchMatches.every((match, index)=>{
                if(!match.equals(currentCard.searchMatches[index])){
                    log.info("SearchMatchVerification -- search match at index", index, "has changed");
                    return false;
                }
                return true;
            });
            if(searchMatchesUnchanged){
                log.info("SearchMatchVerification -- search matches are deeply equal, no update needed");
                return;
            }
            currentCard.searchMatches=newCard.searchMatches;
            currentCard.routeIdList = newCard.routeIdList;
            currentCard.stopIdList = newCard.stopIdList;
            reRender();
        }
        if(currentCard.type === CardType.GeocodeCard){
            // if we have support for caching and etags, we can do a more targeted update
            currentCard.searchMatches.forEach((match, index)=>{
                if(match.type === MatchType.GeocodeMatch){
                    let changeToGeocard = false;
                    match.routeMatches.forEach((routeOrStopMatch, nestedIndex)=>{
                        let etag = routeOrStopMatch.etag;
                        generateCardForSearchTerm(routeOrStopMatch.datumId.id, etag).then(newCard=>{
                            let newMatch = newCard.searchMatches[index] as RouteMatch | StopMatch;
                            if(!newMatch.equals(routeOrStopMatch)){
                                log.info("SearchMatchVerification -- geocode sub-match at index", nestedIndex, "has changed, updating card");
                                (currentCard.searchMatches[index] as RouteMatch | StopMatch).routeMatches[nestedIndex] = newMatch;
                                changeToGeocard = true;
                            } else {
                                log.info("SearchMatchVerification -- geocode sub-match at index", nestedIndex, "is unchanged");
                            }
                        })
                    })
                    if(changeToGeocard){
                        log.info("SearchMatchVerification -- at least one geocode sub-match has changed, updating card");
                        reRender();
                    } else {
                        log.info("SearchMatchVerification -- all geocode sub-matches are unchanged");
                    }
                }
            })
        }
    }


    const reRender = ()=>{
        setState((prevState) => ({...prevState,renderCounter:prevState.renderCounter+1}));
    }

    const setCurrentCard = (newCard: Card, cardStack: [Card] = state.cardStack) => {
        setState((prevState) => ({
            ...prevState,
            currentCard: newCard,
            cardStack: cardStack,
        }));
    }

    const setCurrentAndRerender = (newCard: Card, cardStack: [Card] = state.cardStack) => {
        setCurrentCard(newCard, cardStack);
        reRender();
    }

    const addToStackAndSetCurrentAndRerender = (newCard: Card) =>{
        let cardStack = state.cardStack
        cardStack.push(newCard);
        setCurrentAndRerender(newCard, cardStack)
    }


    const search = async (searchTerm :string|AgencyAndId) =>{
        log.info("searching for: ",searchTerm, state);
        searchTerm = normalizeSearchTerm(searchTerm);
        

        if(searchTerm===allRoutesSearchTerm){
            await allRoutesSearch();
            return
        }
        if(searchTerm===favoritesSearchTerm){
            await favoritesSearch();
            return
        }
        if(nearbySearchTerms.has(searchTerm)){
            log.info("searching for nearby stops and routes");
            await nearbySearch(searchTerm);
            return;
        }  
        if(searchTerm.includes(vehicleDelimiter)){
            log.info("searching for vehicle",searchTerm)
            let routeId = extractRouteFromVehicleSearchTerm(searchTerm);
            let vehicleId = extractVehicleFromVehicleSearchTerm(searchTerm);

            vehicleSearch(routeId,vehicleId);
            return;
        }
        if(searchTerm==null||searchTerm==""||searchTerm=="#"|| !(searchTerm) || !(searchTerm.trim())){
            homeSearch();
            return;
        }
        if (performNewSearch(searchTerm,state?.currentCard)) {
            log.info("fetch search data called, generating new card",state,searchTerm)
            regularSearch(searchTerm);
        }

    }



    const homeSearch = () =>{
        // validation
        log.info("search term was empty, requested home card");
        if(state?.currentCard?.type === CardType.HomeCard) {
            return;
        }

        // card render and window history update
        let currentCard = getHomeCard(state?.currentCard);
        addToStackAndSetCurrentAndRerender(currentCard);
        updateWindowHistory(currentCard.searchTerm,currentCard.uuid);

        // fetch data and update card

        // post update
        blurAndScroll();
    }


    const vehicleSearch = async (routeId:AgencyAndId,vehicleId:string)=> {
        // validation
        log.info("setting card to vehicle card",routeId,vehicleId, typeof routeId, typeof vehicleId);
        
        // card render and window history update
        let currentCard = generateVehicleCard(routeId,vehicleId,state?.currentCard,routes);
        addToStackAndSetCurrentAndRerender(currentCard);
        updateWindowHistory(currentCard.searchTerm,currentCard.uuid);

        // fetch data and update card

        // post update
        log.info("vehicleSearch complete, new card: ",currentCard);
        blurAndScroll();
    }

    const favoritesSearch = async () =>{
        // validation
        log.info("favorites requested, generating new card",state);
        if (state?.currentCard?.type === CardType.FavoritesCard) {
            return 
        }

        // card render and window history update
        let currentCard = new Card(favoritesSearchTerm,uuidv4(),getSessionUuid(state?.currentCard)).asFavorites([],new Set());
        addToStackAndSetCurrentAndRerender(currentCard);
        updateWindowHistory(currentCard.searchTerm,currentCard.uuid);

        // fetch data and update card
        
        // post update
        blurAndScroll();
    }

    const allRoutesSearch = async () =>{
        // validation
        log.info("all routes requested, generating new card",state);
        if (state?.currentCard?.type === CardType.AllRoutesCard) {
            return;
        }

        // initial card render and window history update
        let currentCard = new Card(allRoutesSearchTerm,uuidv4(),getSessionUuid(state?.currentCard));
        addToStackAndSetCurrentAndRerender(currentCard);
        updateWindowHistory(currentCard.searchTerm,currentCard.uuid);

        // fetch data and update card
        await transformIntoAllRoutesCard(currentCard);
        reRender();

        // post update
        blurAndScroll();
        
    
    }



    const regularSearch = async (searchTerm:string) =>{
        // validation
        log.info("search term is new, generating new card",searchTerm,state?.currentCard);
        if (!performNewSearch(searchTerm,state?.currentCard)){return}
        
        // initial card render and window history update
        let currentCard = new Card(searchTerm,uuidv4(),getSessionUuid(state?.currentCard)).asType(CardType.LoadingCard);
        addToStackAndSetCurrentAndRerender(currentCard);
        updateWindowHistory(currentCard.searchTerm,currentCard.uuid);

        // fetch data and update card
        await transfromIntoRegularSearchCard(currentCard,stops,routes)
        reRender();

        // post update
        blurAndScroll();


    }


    const nearbySearch = async (searchTerm: string) =>{
        await navigator.geolocation.getCurrentPosition(
        (position) => {
            log.info("got location",position.coords.latitude,position.coords.longitude);
            let searchTerm = position.coords.latitude.toFixed(6) + "," + position.coords.longitude.toFixed(6);
            log.info("searching nearby: got location",searchTerm);
            search(searchTerm);
        },
        (error) => {
            log.info("error getting location",error)
            searchTerm = "could not find user location";
        });
    }














    const generateInitialCard = async (setLoading: (loading: boolean) => void)=>{
        let currentCard = getHomeCard(new Card("",uuidv4(),getSessionUuid(state?.currentCard)));
        log.info("generating initial card",currentCard);
        addToStackAndSetCurrentAndRerender(currentCard);
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

            if(searchRef===favoritesSearchTerm){
                log.info("searching for favorites");
                favoritesSearch();
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
                // return;
            }
            log.info("generating new search address:",searchRef);
            let searchAddress =  getSearchAddress(searchRef,currentCard);
            if(searchRef.includes(vehicleDelimiter)){
                searchAddress = getSearchAddress(searchRef.split(vehicleDelimiter)[0],currentCard);
            }
            log.info("generated card based on query and search url", searchRef, searchAddress);
            currentCard = new Card(searchRef,uuidv4(),getSessionUuid(currentCard));
            setCurrentAndRerender(currentCard);
            currentCard = await getData(currentCard,stops,routes,searchAddress);
            // let currentCard = new Card(searchRef,uuidv4());


            if(searchRef.includes(vehicleDelimiter)){
                log.info("searching for vehicle",searchRef)
                let searchParts = searchRef.split(vehicleDelimiter);
                let routeId = searchParts[0];
                let vehicleId = searchParts[1];
                currentCard.asVehicle(vehicleId,currentCard.searchMatches,currentCard.routeIdList);
            }
            if(currentCard.routeIdList.size===0){
                currentCard.asError(null);
            }
            log.info("setting card based on starting query",currentCard);
            reRender();
        } catch (error) {
            log.error('There was a problem with the fetch operation:', error);
        }
    }














// *-----------------FORWORDS BACKWARDS NAVIGATION-----------------*

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

    return { search, generateInitialCard, 
        vehicleSearch, allRoutesSearch, favoritesSearch, 
        updateStateForPopStateEvent, goBack, goForward, conditionallyRefreshSearchData };
}





