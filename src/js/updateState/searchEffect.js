import queryString from "query-string";
import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../components/util/globalState";
import {OBA} from "../oba";
import MapRouteComponent from "../../components/map/mapRouteComponent";
import {Card, routeMatch, routeMatchDirectionDatum} from "./dataModels"




    function generateRouteMapComponent(id, points, color) {
        let polyline = new MapRouteComponent(id,points,color)
        console.log(polyline)
        return polyline
    }

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
                let dir = route?.directions[i];
                directionDatum.directionId = dir.directionId
                directionDatum.destination = dir.destination
                directionDatum.routeMapComponents = []
                directionDatum.routeDirectionComponentData = [directionDatum.directionId,
                    directionDatum.destination]
                for (let j = 0; j < dir.polylines.length; j++) {
                    console.log("decoding route polylines ",route,match)
                    let encodedPolyline = dir.polylines[j]
                    let decodedPolyline = OBA.Util.decodePolyline(encodedPolyline)
                    let polylineId = match.routeId + "_dir_" + i + "_lineNum_" + j
                    let routeMapComponents = generateRouteMapComponent(polylineId, decodedPolyline, match.color)
                    directionDatum.routeMapComponents.push(routeMapComponents)
                }
            }
        }
        card.searchMatches.push(match)
        OBA.Util.log('processed route search',route,card)
        return card
    }

    // function postRouteSearchData(routeComponents,color,routeId,routeTitle,description,routeDestinations) {
    //     OBA.Util.log("adding polylines:")
    //     OBA.Util.log(routeComponents)
    //     setState((prevState) => ({
    //         ...prevState,
    //         color:color,
    //         routeId:routeId,
    //         routeTitle:routeTitle,
    //         description:description,
    //         routeDestinations:routeDestinations,
    //         routeComponents:routeComponents
    //     }))
    //     OBA.Util.log("confirming polylines added:")
    //     OBA.Util.log(routeComponents)
    // }





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

                // if(searchResults.resultType=="StopResult"){
                //     searchData = processStopSearch(searchResults)
                //
                // }
                // if(searchResults.resultType=="GeocodeResult"){
                //     searchData = processGeocodeSearch(searchResults)
                //
                // }
                if(searchResults.resultType=="RouteResult"){
                    searchResults.matches.forEach(x=>{processRouteSearch(x,card)})
                }
                OBA.Util.log('completed search results')
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

// export const fillCard = (card) =>{
//     console.log("filling card ",card)
//     postData(getData(card))
// }

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
