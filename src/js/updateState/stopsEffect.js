import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import getDataEffect from "./getDataEffect";
import mapStopComponent from "../../components/map/mapStopComponent";
import routeStopComponent from "../../components/views/routeStopComponent";
import {stopData} from "./dataModels";

const stopsEffect = (currentCard) => {
    var keyword = "stops"
    var stateProperties = ["stopObjs","mapStopComponents","routeStopComponents"]
    let stateUpdateItems = [[],[],[]]
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "routeId=MTA NYCT_"+lineRef +"&directionId=0";
    var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOPS_ON_ROUTE_ENDPOINT + search;

    getDataEffect(currentCard,keyword,stateProperties,stateUpdateItems,targetAddress,
        stopData,mapStopComponent,routeStopComponent,
        (parsed)=>{return parsed?.stops},
        (objList,i)=>{return objList[i]}
        )
};

export default stopsEffect;