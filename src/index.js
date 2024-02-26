import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { ReactSVG } from "react-svg";
import './img/favicon.ico';
import './css/bustime.css';
import './js/bustime.js';
import searchWhite from './img/icon/search_white.svg';
import img from './img/bustime-logo.png';





function App  () {
  const [vehicles, setVehicles] = useState({});
  const [situations, setSituations] = useState({});

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://app.qa.obanyc.com/api/siri/vehicle-monitoring.json?key=OBANYC&_=1707407738784&OperatorRef=MTA+NYCT"
      );
      const parsed = await response.json();
      setVehicles(parsed.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity);
      setSituations(parsed.Siri.ServiceDelivery.SituationExchangeDelivery);
    })();
  }, []);
    const listItems = [];
    for (let i = 0; i < vehicles.length; i++) {
      listItems.push(<li key={i}>{vehicles[i].MonitoredVehicleJourney.LineRef}</li>);
  };

   return <h1>
   <ul>{listItems}</ul></h1>;

 }
ReactDOM.render( <img id="logo" src={img} alt="MTA Bus Time" class="logo" />,  document.getElementById('logo')); 
ReactDOM.render(<App />, document.getElementById('app'));
ReactDOM.render( searchWhite,  document.getElementById('submitButton'));
