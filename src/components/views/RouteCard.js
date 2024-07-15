import React, {useContext, useState} from "react";
import {OBA} from "../../js/oba";
import {CardStateContext} from "../../components/util/CardStateComponent";
import ServiceAlertContainerComponent from "./serviceAlertContainerComponent";
import RefreshComponent from "./RefreshComponent"
import getRouteDirectionComponent from "./RouteDirectionComponent";
import {MapHighlightingStateContext} from "../util/MapHighlightingStateComponent";


function getRouteCard (routeMatch){
    console.log("generating route card: ",routeMatch)
    // const { state, setState} = useContext(CardStateContext);
    const {mapHighlightingState, setState} = useContext(MapHighlightingStateContext);

    const setHoveredItemId = (id) =>{
        console.log("highlighting: ",id)
        if(mapHighlightingState.highlightedComponentId!=id){
            setState((prevState)=>{return {
                ...prevState,
                highlightedComponentId:id}})
        }
    }
    return(
        <React.Fragment>
            <div className={"card route-card " + routeMatch.routeId}>
                <div className="card-header" style={{ borderColor: '#'+routeMatch.color}}
                     onMouseEnter={() => setHoveredItemId(routeMatch.routeId)}
                     onMouseLeave={() => setHoveredItemId(null)}>
                    <h3 className="card-title">{routeMatch.routeTitle}</h3>
                </div>
                <div className="card-content">
                    <ul className="card-details">
                        <li className="via">{routeMatch.description}</li>
                    </ul>
                    <ServiceAlertContainerComponent/>
                    {routeMatch.directions.map(dir=>{return new getRouteDirectionComponent(dir.routeDirectionComponentData)})}
                </div>
            </div>
        </React.Fragment>
    )
}

function getRouteCardsWrapper  () {
    const { state} = useContext(CardStateContext);
    console.log("adding route cards for matches:", state.currentCard.searchMatches);

   return (<React.Fragment>
      <h2 className="cards-header">Routes:</h2>
      <div className="cards">
          {state.currentCard.searchMatches.map(match=>{
              return new getRouteCard(match)})}
      </div>
      <RefreshComponent/>
      </React.Fragment>);

 }

export default getRouteCardsWrapper;