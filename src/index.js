import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import './css/bustime.css';
import { createRoot } from 'react-dom/client';
import "leaflet/dist/leaflet.css";
import { OBA } from './js/oba';




OBA.Util.log('OBA Util is live.');



import appComponent from "./components/app";
function GetApp () {
 return appComponent()
}

var mapNode = document.getElementById('root');
var root = createRoot(mapNode);
root.render(<GetApp />);


