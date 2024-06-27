import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import getDataEffect from "./getDataEffect";
import mapStopComponent from "../../components/map/mapStopComponent";
import {stopData, vehicleData} from "./dataModels";
import mapVehicleComponent from "../../components/map/vehicleComponent";
import routeVehicleComponent from "../../components/views/routeVehicleComponent";
import {classList, classWrap, dataSpecifiers, pathRouting} from "./dataEffectsSupport";

const stopsEffect = (currentCard, direction) => {
    var keyword = "stop"
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "routeId=MTA NYCT_"+lineRef +"&directionId="+direction;
    var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOPS_ON_ROUTE_ENDPOINT + search;


    let stopSpecifiers = new dataSpecifiers(keyword,
        new classList(stopData,
            [new classWrap(mapStopComponent,"map")]),
        new pathRouting((parsed)=>{return parsed?.stops},
            (objList,i)=>{return objList[i]}))

    console.log(targetAddress)

    getDataEffect(currentCard,targetAddress,[stopSpecifiers])
};

export default stopsEffect;