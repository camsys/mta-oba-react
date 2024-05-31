import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {MapContainer, Marker, Polyline, Popup} from "react-leaflet";
import React, {useEffect, useState} from "react";
import queryString from "query-string";
import {OBA} from "../js/oba";
import L from "leaflet";
import bus from "../img/icon/bus.svg";


const icon = L.icon({ iconUrl: bus ,
    className: "svg-icon",
    iconSize: [24, 40],
    iconAnchor: [12, 40]});


function generatePolyline(id,polyline,color){
    return <Polyline key={id} positions={polyline} color={"#"+color} />
}


function useFetchRouteData(lineRef) {
    const [loading, setLoading] = React.useState([]);
    const [routes, setRoutes] = useState({});

    React.useEffect(() => {
        setLoading(true);
        fetch("https://"+ OBA.Config.envAddress + OBA.Config.searchUrl +"?q="+lineRef)
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

    return { loading, routes };
}


function getMap  () {
    OBA.Util.log("generating map")
    const [vehicles, setVehicles] = useState({});
    const [situations, setSituations] = useState({});
    const [routePolylines, setRoutePolylines] = useState({});
    const queryParameters = new URLSearchParams(window.location.search)
    const lineRef = queryString.parse(location.search).LineRef;
    var search = "";
    const leafletRoutePolylines = [];
    const leafletRoutePolylineKeys = [];
    const listItems = [];
    const vehicleMarkers = [];

    if(lineRef) {
        search = "&LineRef=" + lineRef;
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
        useEffect(() => {
            (async () => {
                const response = await fetch(
                    "https://app.qa.obanyc.com/api/siri/vehicle-monitoring.json?key=OBANYC&_=1707407738784&OperatorRef=MTA+NYCT" + search
                );
                const parsed = await response.json();
                setVehicles(parsed.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity);
                setSituations(parsed.Siri.ServiceDelivery.SituationExchangeDelivery);
            })();
        }, []);

        // const vehiclePositions = [];
        for (let i = 0; i < vehicles.length; i++) {
            const longLat = [];
            longLat.push(vehicles[i].MonitoredVehicleJourney.VehicleLocation.Latitude)
            longLat.push(vehicles[i].MonitoredVehicleJourney.VehicleLocation.Longitude)

            // vehiclePositions.push(new google.maps.LatLng(longLat[0],longLat[1]))
            vehicleMarkers.push(<Marker position={longLat} key={longLat} icon={icon}>
                <Popup key={longLat}>
                    A popup at {longLat}. Bus # {i}.
                </Popup>
            </Marker>);
            var lng = vehicles[i].MonitoredVehicleJourney.VehicleLocation.Longitude;
            var lat = vehicles[i].MonitoredVehicleJourney.VehicleLocation.Latitude;
            listItems.push(<li key={i}>{vehicles[i].MonitoredVehicleJourney.VehicleRef}</li>);
        };
    }

    return (<MapContainer style={{ height: '100vh', width: '100wh' }} center={OBA.Config.defaultMapCenter} zoom={15} scrollWheelZoom={true}>
        <ReactLeafletGoogleLayer apiKey='AIzaSyC65u47U8CJxTrmNcXDP2KwCYGxmQO3ZfU' type={'roadmap'} />
        {leafletRoutePolylines}
        {vehicleMarkers}
    </MapContainer>)
}

export default getMap;