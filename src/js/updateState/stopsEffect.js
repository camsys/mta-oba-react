import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import {GlobalStateContext} from "../../components/util/globalState";
import queryString from "query-string";
import routeStopComponent from "../../components/views/routeStopComponent";
import mapStopComponent from "../../components/map/mapStopComponent";
import {stopData} from "./dataModels"

const stopsEffect = (currentCard) => {
    function extractStopData (parsed){
        let stopObjs = [];
        let mapStopComponents = []
        let routeStopComponents = []
        let stopsList = parsed?.stops
        OBA.Util.log("stops found:")
        OBA.Util.log(stopsList)
        if (stopsList != null && stopsList.length != 0) {
            let first = true;
            for (let i = 0; i < stopsList.length; i++) {
                OBA.Util.log("processing stop #" + i+ ": " +stopsList[i].name);
                let stopDatum= new stopData(stopsList[i])
                stopObjs.push(stopDatum)
                mapStopComponents.push(new mapStopComponent(stopDatum))
                routeStopComponents.push(new routeStopComponent(stopDatum))
            };

            OBA.Util.log('processed stops')
        } else {
            OBA.Util.log('no stops recieved. not processing stops')
        }
        return [stopObjs,mapStopComponents,routeStopComponents]
    }

    function updateState(stopObjs,mapStopComponents,sidebarStopComponents){
        if(updateRoutes) {
            setState((prevState) => ({
                ...prevState,
                stopObjs: stopObjs,
                mapStopComponents:mapStopComponents,
                routeStopComponents:routeStopComponents
            }));
        }
        OBA.Util.log("new stops state")
        OBA.Util.log(state.stopObjs)
        OBA.Util.log(state.mapStopComponents)
        OBA.Util.log(state.routeStopComponents)
    }



    const { state, setState } = useContext(GlobalStateContext);
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "routeId=MTA NYCT_"+lineRef +"&directionId=0";
    var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOPS_ON_ROUTE_ENDPOINT + search;
    var updateRoutes = false;

    useEffect(() => {
        OBA.Util.log("reading stops from " + targetAddress)
        fetch(targetAddress)
            .then((response) => response.json())
            .then((parsed) => {
                updateState(extractStopData(parsed))
            })
            .catch((error) => {
                console.error(error);
            });

    }, [setState]);
};

export default stopsEffect;