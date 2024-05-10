import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import './css/bustime.css';
import './js/bustime.js';
import searchWhite from './img/icon/search_white.svg';
import img from './img/bustime-logo.png';
import queryString from 'query-string';
import Select from "react-select";
import Async, { useAsync } from 'react-select/async';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
const position = [40.7128,-74.0060]


function GetBusInfo  () {
  const [vehicles, setVehicles] = useState({});
  const [situations, setSituations] = useState({});
  const queryParameters = new URLSearchParams(window.location.search)
  const lineRef = queryString.parse(location.search).LineRef;
  var search = "";

  if(lineRef){
    search = "&LineRef="+lineRef;
    useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://app.qa.obanyc.com/api/siri/vehicle-monitoring.json?key=OBANYC&_=1707407738784&OperatorRef=MTA+NYCT"+search
      );
      const parsed = await response.json();
      setVehicles(parsed.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity);
      setSituations(parsed.Siri.ServiceDelivery.SituationExchangeDelivery);
    })();
  }, []);
    const listItems = [];
    for (let i = 0; i < vehicles.length; i++) {
      listItems.push(<li key={i}>{vehicles[i].MonitoredVehicleJourney.VehicleRef}</li>);
  };

   return <h1>
   <ul>{listItems}</ul></h1>;

  }else{
    return <div><h2>Try these example searches:</h2>
          <ul>
            <li>Route: 
              <ul class="links">
                <li><a href="?LineRef=B63">B63</a></li>
                <li><a href="?LineRef=M5">M5</a></li>
                <li><a href="?LineRef=Bx1">Bx1</a></li>
              </ul>
            </li>
            <li>Intersection: 
              <ul class="links">
                <li><a href="#">Main st and Kissena Bl</a></li>
              </ul>
            </li>
            <li>Stop Code: 
              <ul class="links">
                <li><a href="#">200884</a></li>
              </ul>
            </li>
          </ul>
          <ul class="menu icon-menu" role="menu">
            <li>
              <a href="#">
                <span class="svg-icon-wrap" role="presentation" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
                    <path class="blue" d="M0 3.333a2.083 2.083 0 1 0 4.167 0 2.083 2.083 0 0 0-4.167 0ZM7.083 4.167h12.084a.833.833 0 0 0 0-1.667H7.083a.833.833 0 0 0 0 1.667ZM0 10a2.083 2.083 0 1 0 4.167 0A2.083 2.083 0 0 0 0 10ZM19.167 9.167H7.083a.833.833 0 0 0 0 1.666h12.084a.834.834 0 0 0 0-1.666ZM0 16.667a2.083 2.083 0 1 0 4.167 0 2.083 2.083 0 0 0-4.167 0ZM19.167 15.833H7.083a.833.833 0 1 0 0 1.667h12.084a.833.833 0 0 0 0-1.667Z"/>
                  </svg>
                </span>
                <span class="label">Available Routes</span>
              </a>
            </li>
          </ul></div>;
  }


  
 }
ReactDOM.render( <img id="logo" src={img} alt="MTA Bus Time" className="logo" />,  document.getElementById('logo-link')); 
ReactDOM.render(<GetBusInfo />, document.getElementById('app'));
ReactDOM.render( <img src={searchWhite} alt="Search" />,  document.getElementById('submit-search'));
ReactDOM.render( <input type="text" name="LineRef" id="search-input" placeholder="Search" autoComplete="off" />,  document.getElementById('search-field')); 
ReactDOM.render(<MapContainer style={{ height: '100vh', width: '100wh' }} center={position} zoom={13} scrollWheelZoom={true}>
    <ReactLeafletGoogleLayer apiKey='AIzaSyC65u47U8CJxTrmNcXDP2KwCYGxmQO3ZfU' type={'roadmap'} />
    <Marker position={position}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  </MapContainer>,  document.getElementById('map-div')); 
/*ReactDOM.render(<iframe width="100%" height="100%" frameBorder="0" style={{border:0}} src="https://www.google.com/maps/embed/v1/view?key=AIzaSyC65u47U8CJxTrmNcXDP2KwCYGxmQO3ZfU&center=40.7128,-74.0060&zoom=12" />,  document.getElementById('map-div')); 
ReactDOM.render( <AsyncSelect type="text" id="search-field" placeholder="Search" isMulti={false} isSearchable={true}
loadOptions={stopOptions} />,  document.getElementById('search-field')); */
