import ReactDOM from 'react-dom';
import React from 'react';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import { createRoot } from 'react-dom/client';
import { OBA } from './js/oba';
import log, {LogLevel} from 'loglevel';
import {AppRoot} from "./components/app";
import './css/tailwind.css';


log.setLevel(process.env.LOGGINGLEVEL,true)
log.setDefaultLevel(process.env.LOGGINGLEVEL)
log.info('OBA Util is live.');



log.info("test message")
var mapNode = document.getElementById('root');
var root = createRoot(mapNode);
root.render(<AppRoot />);



