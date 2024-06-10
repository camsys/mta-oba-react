import queryString from "query-string";
import React, {useContext, useState} from "react";
import {GlobalStateContext} from "../../components/util/globalState";
import {OBA} from "../oba";
import routeComponent from "../../components/map/routeComponent";
import {Card} from "./dataModels"

const searchEffect = (currentCard) => {


    function generateRouteComponent(id, points, color) {
        let polyline = new routeComponent(id,points,color)
        console.log(polyline)
        return polyline
    }

    function processRouteSearch(route,card) {
        console.log("processing route search results",route,card)
        const routeComponents = [];
        card.routeComponents = routeComponents;
        if (route != null && route.hasOwnProperty("directions")) {
            card.color = route?.color
            card.routeId = route?.id
            card.routeTitle = route?.shortName + " " + route?.longName
            card.description = route?.description
            card.routeDestinations=[]
            console.log("assigned basic search values to card",route,card)
            for (let i = 0; i < route?.directions.length; i++) {
                let dir = route?.directions[i];
                card.routeDestinations.push(dir.destination)
                for (let j = 0; j < dir.polylines.length; j++) {
                    let encodedPolyline = dir.polylines[j]
                    let decodedPolyline = OBA.Util.decodePolyline(encodedPolyline)
                    let polylineId = card.routeId + "_dir_" + i + "_lineNum_" + j
                    let routeComponent = generateRouteComponent(polylineId, decodedPolyline, card.color)
                    routeComponents.push(routeComponent)
                }
            }
        }
        OBA.Util.log('processed route search',route,card)
        return card
    }

    function postRouteSearchData(routeComponents,color,routeId,routeTitle,description,routeDestinations) {
        OBA.Util.log("adding polylines:")
        OBA.Util.log(routeComponents)
        setState((prevState) => ({
            ...prevState,
            color:color,
            routeId:routeId,
            routeTitle:routeTitle,
            description:description,
            routeDestinations:routeDestinations,
            routeComponents:routeComponents
        }))
        OBA.Util.log("confirming polylines added:")
        OBA.Util.log(routeComponents)
    }





    function getData(searchRef){
        let card = new Card(searchRef)
        console.log("generating new card",card)
        if(searchRef == null || searchRef == ''){
            console.log("empty search means home",card)
            return card
        }
        let address = "https://" + OBA.Config.envAddress + "/" + OBA.Config.searchUrl + "?q=" + searchRef
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
        let cardStack = state.cardStack
        cardStack.push(currentCard)
        setState((prevState) => ({
            ...prevState,
            currentCard: card,
            cardStack: cardStack
        }))
    }

    const performNewSearch = (searchRef) =>{
        if(state?.currentCard?.searchTerm == searchRef){
            return false
        }
        return true
    }

    const { state, setState } = useContext(GlobalStateContext);
    const searchRef = queryString.parse(location.search).LineRef;

    React.useEffect(() => {
        if(performNewSearch(searchRef))
        {
            postData(getData(searchRef))
        }

    }, []);
}
export default searchEffect;