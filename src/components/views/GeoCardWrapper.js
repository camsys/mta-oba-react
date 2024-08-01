import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import {getRouteCard} from "./RouteCard";
import {StopCard} from "./StopCardWrapper";


export function GeoCardWrapper  () {
    const { state} = useContext(CardStateContext);
    console.log("generating GeoCard:", state.currentCard.searchMatches);

    return (<React.Fragment>
        <h2 className="cards-header">Routes:</h2>
        <div className="cards geocard routes">
            {state.currentCard.searchMatches.map(match=>{
                return match.routeMatches.map(routeMatch=>{
                    return new getRouteCard(routeMatch)
                    })
                })
            }
        </div>
        <h2 className="cards-header">Stops:</h2>
        <div className="cards geocard stops">
            {
                state.currentCard.searchMatches.map(match=>{
                return match.routeMatches.map(routeMatch=>{
                    return new StopCard(routeMatch)
                    })
                })
            }
        </div>
    </React.Fragment>);

}