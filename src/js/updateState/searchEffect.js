import queryString from "query-string";
import React, {useContext, useState} from "react";
import {GlobalStateContext} from "../../components/util/globalState";
import {OBA} from "../oba";
import routeComponent from "../../components/map/routeComponent";

const searchEffect = (currentCard) => {


    function generateRouteComponent(id, points, color) {
        let polyline = new routeComponent(id,points,color)
        console.log(polyline)
        return polyline
    }

    function processRouteData(route) {
        const routeComponents = [];
        const leafletRoutePolylineKeys = [];
        var color;
        var routeTitle;
        let routeId;
        var description;
        var stopList = [];
        const routeDestinations = [];
        const allDecodedPolylines = [];
        const allStopList = [];


        if (route != null && route.hasOwnProperty("directions")) {
            color = route?.color
            routeId = route?.id
            routeTitle = route?.shortName + " " + route?.longName
            description = route?.description
            for (let i = 0; i < route?.directions.length; i++) {
                let stopList = [];
                let dir = route?.directions[i];
                routeDestinations.push(dir.destination)
                for (let j = 0; j < dir.polylines.length; j++) {
                    let encodedPolyline = dir.polylines[j]
                    let decodedPolyline = OBA.Util.decodePolyline(encodedPolyline)
                    let first = true
                    let polylineId = routeId + "_dir_" + i + "_lineNum_" + j
                    let routeComponent = generateRouteComponent(polylineId, decodedPolyline, color)
                    routeComponents.push(routeComponent)
                    leafletRoutePolylineKeys.push(polylineId)
                    allDecodedPolylines.push(decodedPolyline)
                }
                for (let j = 0; j < dir.stops.length; j++) {
                    OBA.Util.log('reytest j = ' + j + " stop = " + dir.stops[j].name)
                    let stop = dir.stops[j].name;
                    stopList.push(stop);
                }
                allStopList.push(stopList);
            }
        }
        OBA.Util.log('processed route')
        return [routeComponents,color,routeId,routeTitle,description,routeDestinations,allStopList]
    }

    function postRouteData(routeComponents,color,routeId,routeTitle,description,routeDestinations,allStopList) {
        OBA.Util.log("adding polylines:")
        OBA.Util.log(routeComponents)
        setState((prevState) => ({
            ...prevState,
            color:color,
            routeId:routeId,
            routeTitle:routeTitle,
            description:description,
            routeDestinations:routeDestinations,
            routeComponents:routeComponents,
            allStopList:allStopList
        }))
        OBA.Util.log("confirming polylines added:")
        OBA.Util.log(routeComponents)
    }

    const { state, setState } = useContext(GlobalStateContext);
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "&"+currentCard.queryIdentifier+"=" + lineRef;

    React.useEffect(() => {
        OBA.Util.log('getting search results')
        fetch("https://" + OBA.Config.envAddress + "/" + OBA.Config.searchUrl + "?q=" + lineRef)
            .then((response) => response.json())
            .then((parsed) => {
                const [routeComponents,color,routeId,routeTitle,description,routeDestinations,allStopList] = processRouteData(parsed.searchResults["matches"][0])
                postRouteData(routeComponents,color,routeId,routeTitle,description,routeDestinations,allStopList);
                OBA.Util.log('completed search results')
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);
}
export default searchEffect;