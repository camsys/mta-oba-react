import ReactDOM from 'react-dom';
import React from 'react';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import { createRoot } from 'react-dom/client';
import { OBA } from './js/oba';




OBA.Util.log('OBA Util is live.');



import appComponent from "./components/app";
function GetApp () {
 return appComponent()
}

var mapNode = document.getElementById('root');
var root = createRoot(mapNode);
root.render(<GetApp />);


