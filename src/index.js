import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import './css/bustime.css';
import './js/bustime.js';
import './js/routeMap.js'
import './js/util.js'
import routeCard from './js/routeCard.js';
import searchWhite from './img/icon/search_white.svg';
import searchBlue from './img/icon/search_blue.svg';
import caretBlue from './img/icon/right-caret_blue.svg';
import caretBlack from './img/icon/right-caret_black.svg';
import caretWhite from './img/icon/right-caret_white.svg';
import busStop from './img/icon/bus-stop.svg';
import bus from './img/icon/bus.svg';
import stroller from './img/icon/stroller.svg';
import bustimeLogo from './img/bustime-logo.png';
import queryString from 'query-string';
import Select from "react-select";
import Async, { useAsync } from 'react-select/async';
const position = [40.675417,-73.981129];
import { createRoot } from 'react-dom/client';
import { MapContainer, Marker, Popup, TileLayer, Polyline } from 'react-leaflet'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({ iconUrl: bus ,
className: "svg-icon",
  iconSize: [24, 40],
  iconAnchor: [12, 40]});

import OBAUtil from './js/util';
import OBAConfig from './js/config';

OBAUtil.log('OBA Util is live.');
const envAddress = "app.dev.obanyc.com/"

function generatePolyline(id,polyline,color){
  return <Polyline key={id} positions={polyline} color={"#"+color} />
}


function useFetchRouteData(lineRef) {
  const [loading, setLoading] = React.useState([]);
  const [routes, setRoutes] = useState({});

  React.useEffect(() => {
    setLoading(true);
    fetch("https://"+ envAddress + OBAConfig.searchUrl +"?q="+lineRef)
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


function GetBusInfo  () {
  const [vehicles, setVehicles] = useState({});
  const [situations, setSituations] = useState({});
  const [routePolylines, setRoutePolylines] = useState({});
  const queryParameters = new URLSearchParams(window.location.search)
  const lineRef = queryString.parse(location.search).LineRef;
  var search = "";



  if(lineRef){
    search = "&LineRef="+lineRef;

    // const {loading, routes, polylines} = UseFetchAndProcessRoutes(lineRef)
    // console.log(polylines)
    const { loading, routes } = useFetchRouteData(lineRef);
    const leafletRoutePolylines = [];
    const leafletRoutePolylineKeys = [];

    if(!loading) {
      let color = routes.color
      let routeId = routes.id
      const allDecodedPolylines = []
      for (let i = 0; i < routes.directions.length; i++) {
        let dir = routes.directions[i];
        for (let j = 0; j < dir.polylines.length; j++) {
          let encodedPolyline = dir.polylines[j]
          let decodedPolyline = OBAUtil.decodePolyline(encodedPolyline)
          let first = true
          let polylineId = routeId+"_dir_"+i+"_lineNum_"+j
          let leafletPolyline = generatePolyline(polylineId,decodedPolyline,color)
          leafletRoutePolylines.push(leafletPolyline)
          leafletRoutePolylineKeys.push(polylineId)
          allDecodedPolylines.push(decodedPolyline)
        }
      }
    }

    useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://app.dev.obanyc.com/api/siri/vehicle-monitoring.json?key=OBANYC&_=1707407738784&OperatorRef=MTA+NYCT"+search
      );
      const parsed = await response.json();
      setVehicles(parsed.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity);
      setSituations(parsed.Siri.ServiceDelivery.SituationExchangeDelivery);
    })();
  }, []);
    const listItems = [];
    const vehicleMarkers = [];
    // const vehiclePositions = [];
    for (let i = 0; i < vehicles.length; i++) {
      const longLat = [];
      longLat.push(vehicles[i].MonitoredVehicleJourney.VehicleLocation.Latitude)
      longLat.push(vehicles[i].MonitoredVehicleJourney.VehicleLocation.Longitude)

      // vehiclePositions.push(new google.maps.LatLng(longLat[0],longLat[1]))
      vehicleMarkers.push(<Marker position={longLat} key={longLat}icon={icon}>
      <Popup key={longLat}>
        A popup at {longLat}. Bus # {i}.
      </Popup>
    </Marker>);
      var lng = vehicles[i].MonitoredVehicleJourney.VehicleLocation.Longitude;
      var lat = vehicles[i].MonitoredVehicleJourney.VehicleLocation.Latitude;
      listItems.push(<li key={i}>{vehicles[i].MonitoredVehicleJourney.VehicleRef}</li>);      
  };

    var mapNode = document.getElementById('map-div');
var root = createRoot(mapNode);
root.render(<MapContainer style={{ height: '100vh', width: '100wh' }} center={position} zoom={15} scrollWheelZoom={true}>
    <ReactLeafletGoogleLayer apiKey='AIzaSyC65u47U8CJxTrmNcXDP2KwCYGxmQO3ZfU' type={'roadmap'} />
    {leafletRoutePolylines}
    {vehicleMarkers}
  </MapContainer>);
  routeCard.getRouteCard;
alert('get here 1??');

  var mapNode = document.getElementById('app');
var root = createRoot(mapNode);
root.render(routeCard.getRouteCard);

  
   return root.render(routeCard.getRouteCard);

  }else{
      var mapNode = document.getElementById('map-div');
var root = createRoot(mapNode);
root.render(<MapContainer style={{ height: '100vh', width: '100wh' }} center={position} zoom={15} scrollWheelZoom={true}>
    <ReactLeafletGoogleLayer apiKey='AIzaSyC65u47U8CJxTrmNcXDP2KwCYGxmQO3ZfU' type={'roadmap'} />
  </MapContainer>);
    return <div><h2>Try these example searches:</h2>
          <ul>
            <li>Route:
              <ul className="links">
                <li><a href="?LineRef=B63">B63</a></li>
                <li><a href="?LineRef=M5">M5</a></li>
                <li><a href="?LineRef=Bx1">Bx1</a></li>
              </ul>
            </li>
            <li>Intersection:
              <ul className="links">
                <li><a href="#">Main st and Kissena Bl</a></li>
              </ul>
            </li>
            <li>Stop Code:
              <ul className="links">
                <li><a href="#">200884</a></li>
              </ul>
            </li>
          </ul>
          <ul className="menu icon-menu" role="menu">
            <li>
              <a href="#">
                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
                    <path className="blue" d="M0 3.333a2.083 2.083 0 1 0 4.167 0 2.083 2.083 0 0 0-4.167 0ZM7.083 4.167h12.084a.833.833 0 0 0 0-1.667H7.083a.833.833 0 0 0 0 1.667ZM0 10a2.083 2.083 0 1 0 4.167 0A2.083 2.083 0 0 0 0 10ZM19.167 9.167H7.083a.833.833 0 0 0 0 1.666h12.084a.834.834 0 0 0 0-1.666ZM0 16.667a2.083 2.083 0 1 0 4.167 0 2.083 2.083 0 0 0-4.167 0ZM19.167 15.833H7.083a.833.833 0 1 0 0 1.667h12.084a.833.833 0 0 0 0-1.667Z"/>
                  </svg>
                </span>
                <span className="label">Available Routes</span>
              </a>
            </li>
          </ul></div>;
  }




  
 }

var domNode = document.getElementById('logo-link');
var root = createRoot(domNode);
root.render(<img id="logo" style={{width: 100 + '%'}} src={bustimeLogo} alt="MTA Bus Time" className="logo" />);

domNode = document.getElementById('app');
root = createRoot(domNode);
root.render(<GetBusInfo />);

domNode = document.getElementById('submit-search');
root = createRoot(domNode);
root.render(<img src={searchWhite} alt="Search" />);

domNode = document.getElementById('search-field');
root = createRoot(domNode);
root.render(<input type="text" name="LineRef" id="search-input" placeholder="Search" autoComplete="off" />);