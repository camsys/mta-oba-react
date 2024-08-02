import React, {useContext, useEffect, useState} from "react";

import {StopData, Card} from "./dataModels";
import {OBA} from "../oba";
import {CardStateContext} from "../../components/util/CardStateComponent";



function extractData (parsed,routeDirection){
    let jsonList = parsed?.stops
    console.log("getting all stops: stops found:", jsonList)
    if (jsonList != null && jsonList.length != 0) {
        for (let i = 0; i < jsonList.length; i++) {
            OBA.Util.trace("getting all stops: processing stop#" + i);
            let stop = jsonList[i]
            routeDirection.mapStopComponentData.push(new StopData(stop))
            routeDirection.routeDirectionComponentData.routeStopComponentsData.push(new StopData(stop))
        };

        OBA.Util.log('getting all stops: processed stops')
    } else {
        OBA.Util.log('getting all stops: no stops recieved. not processing stops')
    }
    OBA.Util.log("getting all stops: stops post process")
    return routeDirection
}


function getTargetAddress(routeId,dir){
    let search = "routeId="+routeId +"&directionId="+dir;
    let targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOPS_ON_ROUTE_ENDPOINT + search;
    return targetAddress
}

function fetchStopsDataForDir(address,routeDirection){
    console.log("getting all stops: fetching stops data from ",address)
    return fetch(address)
        .then((response) => response.json())
        .then((parsed) => {
            extractData(parsed,routeDirection)
        })
        .catch((error) => {
            console.error(error);
        });
}


export async function fetchAllStopsData(card){
    console.log("getting all stops: ",card)
    let promises = []
    if(card.type===CardType.RouteCard){
        console.log("getting all stops: card is routes")
        card.searchMatches.forEach((match)=>{
            console.log("getting all stops: match: ",match)
            match.directions.forEach(
                (direction)=>{
                    promises.push(fetchStopsDataForDir(
                    getTargetAddress(match.routeId,direction.directionId),direction))
                })
        })
    }
    await Promise.allSettled(promises)
    console.log("post get all stops card: ",card)
    return card
}

export function stopsEffect(){
    const { state, setState } = useContext(CardStateContext);
    useEffect(()=>{
        let updatedCurrentCard = fetchAllStopsData(state.currentCard)
         let updateStateFunc = (prevState) => {
            let newState = {...prevState}
            newState.currentCard = updatedCurrentCard
            newState.renderCounter = prevState.renderCounter +1
            return newState
        }
        setState(updateStateFunc)
    })
}

// const stopsEffect = (currentCard) => {
//     var keyword = "stop"
//     const lineRef = queryString.parse(location.search).LineRef;
//     let search = "routeId=MTA NYCT_"+lineRef +"&directionId=0";
//     let targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOPS_ON_ROUTE_ENDPOINT + search;
//     targetAddress = lineRef==null?null:targetAddress
//
//     let stopSpecifiers = new dataSpecifiers(keyword,
//         new classList(stopData,
//             [new classWrap(mapStopComponent,"map"),
//                 new classWrap(routeStopComponent,"route")]),
//         new pathRouting((parsed)=>{return parsed?.stops},
//             (objList,i)=>{return objList[i]}))
//
//     console.log(targetAddress)
//
//     getDataEffect(currentCard,targetAddress,[stopSpecifiers])
// };