import ReactDOM from 'react-dom';
import React from 'react';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import { createRoot } from 'react-dom/client';
import { OBA } from './js/oba';
import log, {LogLevel} from 'loglevel';



log.setLevel(process.env.LOGGINGLEVEL,true)
log.setDefaultLevel(process.env.LOGGINGLEVEL)
log.info('OBA Util is live.');



import appComponent from "./components/app";
function GetApp () {
 return appComponent()
}



log.info("test message")
var mapNode = document.getElementById('root');
var root = createRoot(mapNode);
root.render(<GetApp />);


