import ReactDOM from 'react-dom';
import React from 'react';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import { createRoot } from 'react-dom/client';
import { OBA } from './js/oba';
import log, {LogLevel} from 'loglevel';
import {AppRoot} from "./components/app";
import "./css/leafletLayer.css";
import "./css/bustime.sass";
import './css/tailwind.css';


log.setLevel((process.env.LOGGINGLEVEL || 'info') as any, true)
log.setDefaultLevel((process.env.LOGGINGLEVEL || 'info') as any)
log.info('OBA Util is live.');

const hash = window.location.hash.substring(1);
if (hash) {
    const cleanSearch = decodeURIComponent(hash);
    window.location.replace(`/?search=${encodeURIComponent(cleanSearch)}`);
} else {
    var mapNode = document.getElementById('root');
    if(mapNode) {
        var root = createRoot(mapNode);
        root.render(<AppRoot />);
    }
}




