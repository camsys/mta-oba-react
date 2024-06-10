import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import getDataEffect from "./getDataEffect";
import MapStopComponent from "../../components/map/MapStopComponent";
import RouteStopComponent from "../../components/views/RouteStopComponent";
import {stopData, vehicleData} from "./dataModels";
import {classList, classWrap, dataSpecifiers, pathRouting} from "./dataEffectsSupport";

const stopsEffect = (currentCard) => {
    var keyword = "stop"
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "routeId=MTA NYCT_"+lineRef +"&directionId=0";
    let targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOPS_ON_ROUTE_ENDPOINT + search;
    targetAddress = lineRef==null?null:targetAddress

    let stopSpecifiers = new dataSpecifiers(keyword,
        new classList(stopData,
            [new classWrap(MapStopComponent,"map"),
            new classWrap(RouteStopComponent,"route")]),
        new pathRouting((parsed)=>{return parsed?.stops},
            (objList,i)=>{return objList[i]}))

    console.log(targetAddress)

    getDataEffect(currentCard,targetAddress,[stopSpecifiers])
};

export default stopsEffect;