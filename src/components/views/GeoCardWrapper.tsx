import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import {CollapsableRouteCard, RouteCard} from "./RouteCard";
import {CollapsableStopCard, StopCard} from "./StopCardWrapper.tsx";
import {MatchType} from "../../js/updateState/DataModels";
import log from 'loglevel';


export function GeoCardWrapper  () :JSX.Element {
    const { state} = useContext(CardStateContext);
    log.info("generating GeoCard:", state.currentCard.searchMatches);

    let routes = state.currentCard.searchMatches.map(match=>{
        return match.routeMatches.map(routeMatch=>{
            if(routeMatch.type === MatchType.RouteMatch){return routeMatch}
        })
    }).flat().filter(x=>x!==null&&typeof x!=='undefined')
    let stops = state.currentCard.searchMatches.map(match=>{
        return match.routeMatches.map(stopMatch=>{
            if(stopMatch.type === MatchType.StopMatch){return stopMatch}
        })
    }).flat().filter(x=>x!==null&&typeof x!=='undefined')

    log.info("geocard routes&stops",routes,stops)

    return (<React.Fragment>
        <div className="cards-header-toggle-group">
            <h2 className={`cards-header`}>Nearby:</h2>
            <div className="cards-header-toggle">
                <button data-target="stops" className="cards-toggle active" aria-pressed="true" aria-expanded="true" aria-label="Show nearby stops (currently visible)">Stops</button>
                <button data-target="routes" className="cards-toggle" aria-pressed="false" aria-expanded="false" aria-label="Show nearby routes (currently hidden)">Routes</button>
            </div>
        </div>
        <div className="cards geocards toggle-cards stops" aria-hidden="false">
            {
            stops.map((match,index) => {
                return <CollapsableStopCard match={match} oneOfMany={stops.length>1} key={index}/>
            })
            }
        </div>
        <div className="cards geocards toggle-cards routes hide" aria-hidden="true">
            {routes.map((routeMatch,index) => {
                return <CollapsableRouteCard routeMatch={routeMatch} oneOfMany={routes.length > 1} key={index}/>
            })}
        </div>
    </React.Fragment>);

}