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



import appComponent from "./components/app";
function GetApp () {
 return appComponent()
}

var mapNode = document.getElementById('root');
var root = createRoot(mapNode);
root.render(<GetApp />);


