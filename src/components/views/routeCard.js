import React, {useContext, useState} from "react";
import {OBA} from "../../js/oba";
import {GlobalStateContext} from "../../components/util/globalState";
import ServiceAlertContainerComponent from "./serviceAlertContainerComponent";
import RouteDirectionComponent from "./routeDirectionComponent"



function getRouteCard  () {
    OBA.Util.log("adding route card");

     const { state} = useContext(GlobalStateContext);

    var time = new Date();
    time = time.toLocaleString('en-US', { hour: 'numeric',  minute: 'numeric', hour12: true })

  const handleRefresh = () => {
    window.location.reload();
  }

   return (<React.Fragment>
      <h2 className="cards-header">Routes:</h2>
      <div className="cards">
        <div className="card route-card b38">
          <div className="card-header" styles="border-color: #00AEEF">
            <h3 className="card-title">{state.routeTitle}</h3>
          </div>
          <div className="card-content">
            <ul className="card-details">
              <li className="via">{state.description}</li>
            </ul>
            <ServiceAlertContainerComponent/>
            <RouteDirectionComponent/>
            <RouteDirectionComponent/>
          </div>
        </div>
      </div>
      <refreshComponent/>
      </React.Fragment>);

 }

export default getRouteCard;