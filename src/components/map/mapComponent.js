import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {MapContainer, Marker, Polyline, Popup} from "react-leaflet";
import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import {GlobalStateContext} from "../util/globalState";
import vehicleComponent from "./vehicleComponent";

const mapComponent = (function() {

    // const [routePolylines, setRoutePolylines] = useState({});

    // const baseVehicleIcon = L.icon({
    //     iconUrl: bus,
    //     className: "svg-icon",
    //     iconSize: [24, 40],
    //     iconAnchor: [12, 40]
    // });

    function generatePolyline(id, polyline, color) {
        return <Polyline key={id} positions={polyline} color={"#" + color}/>
    }


    function useFetchRouteData(lineRef) {
        const [loading, setLoading] = React.useState([]);
        const [routes, setRoutes] = useState({});

        React.useEffect(() => {
            setLoading(true);
            fetch("https://" + OBA.Config.envAddress + OBA.Config.searchUrl + "?q=" + lineRef)
                .then((response) => response.json())
                .then((parsed) => {
                    setRoutes(parsed.searchResults["matches"][0]);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);
                });
        }, []);

        OBA.Util.log('completed call to route')
        return {loading, routes};
    }

    function populateRoutePolylines() {

    }


    return {
        getMap: function() {
            OBA.Util.log("generating map")
            // const [vehicles, setVehicles] = useState({});
            // const [situations, setSituations] = useState({});

            const queryParameters = new URLSearchParams(window.location.search)
            const lineRef = queryString.parse(location.search).LineRef;
            var search = "";
            const leafletRoutePolylines = [];
            const leafletRoutePolylineKeys = [];
            const { state} = useContext(GlobalStateContext);

            const vehicleMarkers = state.vehicleMarkers;
            // OBA.Util.log("vehicle state for mapComponent")
            // OBA.Util.log(vehicleMarkers)


            if (state.currentCard==OBA.Config.cards.routeCard) {
                search = "&"+OBA.Config.cards.routeCard.identifier+"=" + lineRef;
                const {loading, routes} = useFetchRouteData(lineRef);
                if (!loading) {
                    let color = routes.color
                    let routeId = routes.id
                    const allDecodedPolylines = []
                    if (routes != null & routes.hasOwnProperty("directions")) {
                        for (let i = 0; i < routes.directions.length; i++) {
                            let dir = routes.directions[i];
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
                }
                OBA.Util.log('processed route')

            }


            return (<React.Fragment> <MapContainer style={{height: '100vh', width: '100wh'}} center={OBA.Config.defaultMapCenter} zoom={15}
                                  scrollWheelZoom={true}>
                <ReactLeafletGoogleLayer apiKey='AIzaSyC65u47U8CJxTrmNcXDP2KwCYGxmQO3ZfU' type={'roadmap'}/>
                {leafletRoutePolylines}
                {vehicleMarkers}
            </MapContainer></React.Fragment>)
        }
    }
})();

export default mapComponent;