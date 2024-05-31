import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import './css/bustime.css';
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
import { createRoot } from 'react-dom/client';
import { MapContainer, Marker, Popup, TileLayer, Polyline } from 'react-leaflet'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OBA } from './js/oba';

import routeCard from './components/views/routeCard.js';
import homeCard from './components/views/homeCard.js';
import mapComponent from './components/map/map.js';



OBA.Util.log('OBA Util is live.');



function GetBusInfo  () {
  const lineRef = queryString.parse(location.search).LineRef;
  if(lineRef){
  OBA.Util.log("adding route card")
   return routeCard();
  }else{
      return homeCard()
      }
 }

 import mapWrap from "./components/map/mapWrap";
 function GetMapWrapper () {
  return mapWrap()
 }

 import footerComponent from "./components/pageStructure/footer";
 function GetFooter () {
  return footerComponent()
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

var mapNode = document.getElementById('map-wrap');
var root = createRoot(mapNode);
root.render(<GetMapWrapper />);

var mapNode = document.getElementById('footer');
var root = createRoot(mapNode);
root.render(<GetFooter />);

