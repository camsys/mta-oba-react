import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import {GlobalStateContext} from "../../components/util/globalState";
import queryString from "query-string";
import routeStopComponent from "../../components/views/routeStopComponent";
import mapStopComponent from "../../components/map/mapStopComponent";

const stopsEffect = (currentCard) => {

    class stopData {
        constructor(stopJson) {
            this.name = stopJson.name
        }
    }

    function extractStopData (parsedStops){
        let stopObjs = [];
        let mapStopComponents = []
        let routeStopComponents = []
        OBA.Util.trace(parsedStops)
        let stopsList = parsedStops?.stops
        OBA.Util.trace("stops found:")
        OBA.Util.trace(stopsList)
        if (stopsList != null && stops.length != 0) {
            let first = true;
            for (let i = 0; i < stopsList.length; i++) {
                OBA.Util.log("processing stop #" + i+ ": " +stops[i].name);
                let stopData=new stopData(stops[i])
                stopObjs.push(stopData)
                mapStopComponents.push(new mapStopComponent(stopData))
                routeStopComponents.push(new routeStopComponent(stopData))
            };

            OBA.Util.log('processed stops')
        } else {
            OBA.Util.log('no stops recieved. not processing stops')
        }
        return [stopObjs,mapStopComponents,sidebarStopComponents]
    }

    function updateState(stopObjs,mapStopComponents,sidebarStopComponents){
        if(updateRoutes) {
            setState((prevState) => ({
                ...prevState,
                stopObjs: stopObjs,
                mapStopComponents:mapStopComponents,
                sidebarStopComponents:sidebarStopComponents
            }));
        }
        OBA.Util.log("new stops state")
        OBA.Util.log(state.stopObjs)
        OBA.Util.log(state.mapStopComponents)
        OBA.Util.log(state.sidebarStopComponents)
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