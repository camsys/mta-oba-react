import React, {useContext, useState} from "react";
import {OBA} from "../../js/oba";
import {GlobalStateContext} from "../../components/util/globalState";
import ServiceAlertContainerComponent from "./serviceAlertContainerComponent";
import RouteDirectionComponent from "./routeDirectionComponent"
import RefreshComponent from "./RefreshComponent"



function getRouteCard  () {
    OBA.Util.log("adding route card");

     const { state} = useContext(GlobalStateContext);

   return (<React.Fragment>
      <h2 className="cards-header">Routes:</h2>
      <div className="cards">
        <div className="card route-card b38">
          <div className="card-header" styles="border-color: #00AEEF">
            <h3 className="card-title">{state.currentCard.routeTitle}</h3>
          </div>
          <div className="card-content">
            <ul className="card-details">
              <li className="via">{state.description}</li>
            </ul>
            <ServiceAlertContainerComponent/>
            <RouteDirectionComponent directionId="0" />
            <RouteDirectionComponent directionId="1" />
          </div>
        </div>
      </div>
      <RefreshComponent/>
      </React.Fragment>);

 }

export default getRouteCard;