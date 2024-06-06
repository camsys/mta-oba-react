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
            updateStops = true;
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
        OBA.Util.log("stops post process")
        OBA.Util.log(stopObjs)
        OBA.Util.log(mapStopComponents)
        OBA.Util.log(routeStopComponents)
        return [stopObjs,mapStopComponents,routeStopComponents]
    }

    function updateState(newStopObjs,newMapStopComponents,newRouteStopComponents){

        OBA.Util.log("should update stops state?")
        OBA.Util.log(updateStops)
        if(updateStops) {
            OBA.Util.log("adding to stops state:")
            OBA.Util.log(newStopObjs)
            OBA.Util.log(newMapStopComponents)
            OBA.Util.log(newRouteStopComponents)
            setState((prevState) => ({
                ...prevState,
                stopObjs: newStopObjs,
                mapStopComponents:newMapStopComponents,
                routeStopComponents:newRouteStopComponents
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
    var updateStops = false;

    useEffect(() => {
        OBA.Util.log("reading stops from " + targetAddress)
        fetch(targetAddress)
            .then((response) => response.json())
            .then((parsed) => {
                const [stopObjs,mapStopComponents,routeStopComponents] = extractStopData(parsed)
                updateState(stopObjs,mapStopComponents,routeStopComponents)
            })
            .catch((error) => {
                console.error(error);
            });

    }, [setState]);
};

export default stopsEffect;