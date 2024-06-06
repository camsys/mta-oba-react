import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import vehicleComponent from "../../components/map/vehicleComponent";
import {GlobalStateContext} from "../../components/util/globalState";
import queryString from "query-string";

const stopsEffect = () => {

    function parseStops (parsedStops){
        let newRoutes = [];
        OBA.Util.trace(parsedStops)
        let stops = parsedStops?.stops
        OBA.Util.trace("stops found:")
        OBA.Util.trace(stops)
        if (stops != null && stops.length != 0) {
            let first = true;
            for (let i = 0; i < stops.length; i++) {
                OBA.Util.log("processing stop #" + i+ ": " +stops[i].name);
            };

            OBA.Util.log('processed stops')
        } else {
            OBA.Util.log('no stops recieved. not processing stops')
        }
        return [stops,stops,newRoutes]
    }

    function updateState(newRoutes){
        OBA.Util.trace('completed call to routes')
        OBA.Util.trace("pre-update route state")
        OBA.Util.trace(state.routes)
        OBA.Util.log("updating route state to")
        OBA.Util.log(newRoutes)
        OBA.Util.trace("updating routes state?: " + updateRoutes)
        OBA.Util.trace(updateRoutes)
        if(updateRoutes) {
            setState((prevState) => ({
                ...prevState,
                routes: newRoutes
            }));
        }
        OBA.Util.log("new vehicle state")
        OBA.Util.log(state.routes)
    }



    const { state, setState } = useContext(GlobalStateContext);
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "routeId=MTA NYCT_B38&directionId=0"; //OBA.Config.cards.routeCard.identifier+"=" + lineRef;
    var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOPS_ON_ROUTE_ENDPOINT + search;
    var updateRoutes = false;

    useEffect(() => {
        OBA.Util.log("reading stops from " + targetAddress)
        fetch(targetAddress)
            .then((response) => response.json())
            .then((parsed) => {
                let [vehicles,situations, routes] = parseStops(parsed)
                updateState(routes)
            })
            .catch((error) => {
                console.error(error);
            });

    }, [setState]);
};

export default stopsEffect;