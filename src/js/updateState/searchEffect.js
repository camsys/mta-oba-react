import queryString from "query-string";
import React, {useContext, useState} from "react";
import {GlobalStateContext} from "../../components/util/globalState";
import {OBA} from "../oba";
import routeComponent from "../../components/map/routeComponent";

const searchEffect = () => {


    function generatePolyline(id, points, color) {
        let polyline = new routeComponent(id,points,color)
        console.log(polyline)
        return polyline
    }

    function processRouteData(route) {
        const leafletRoutePolylines = [];
        const leafletRoutePolylineKeys = [];
        let color;
        let routeId;
        const allDecodedPolylines = []
        if (route != null && route.hasOwnProperty("directions")) {
            color = route?.color
            routeId = route?.id
            for (let i = 0; i < route?.directions.length; i++) {
                let dir = route?.directions[i];
                for (let j = 0; j < dir.polylines.length; j++) {
                    let encodedPolyline = dir.polylines[j]
                    let decodedPolyline = OBA.Util.decodePolyline(encodedPolyline)
                    let first = true
                    let polylineId = routeId + "_dir_" + i + "_lineNum_" + j
                    let leafletPolyline = generatePolyline(polylineId, decodedPolyline, color)
                    leafletRoutePolylines.push(leafletPolyline)
                    leafletRoutePolylineKeys.push(polylineId)
                    allDecodedPolylines.push(decodedPolyline)
                }
            }
        }
        OBA.Util.log('processed route')
        return [leafletRoutePolylines,color,routeId]
    }

    function postRouteData(routePolylines,color,routeId) {
        OBA.Util.log("adding polylines:")
        OBA.Util.log(routePolylines)
        setState((prevState) => ({
            ...prevState,
            color:color,
            routeId : routeId,
            routePolylines:routePolylines
        }))
        OBA.Util.log("confirming polylines added:")
        OBA.Util.log(routePolylines)
    }

    const queryParameters = new URLSearchParams(window.location.search)
    const lineRef = queryString.parse(location.search).LineRef;
    const {state, setState} = useContext(GlobalStateContext);

    React.useEffect(() => {
        OBA.Util.log('getting search results')
        let search = "&" + OBA.Config.cards.routeCard.queryIdentifier + "=" + lineRef;
        fetch("https://" + OBA.Config.envAddress + "/" + OBA.Config.searchUrl + "?q=" + lineRef)
            .then((response) => response.json())
            .then((parsed) => {
                postRouteData(processRouteData((parsed.searchResults["matches"][0])))
                OBA.Util.log('completed search results')
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);
}
export default searchEffect;