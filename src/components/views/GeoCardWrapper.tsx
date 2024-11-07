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
        <h2 className={`cards-header`}>Routes:</h2>
        <div className="cards geocard routes">
            {routes.map((routeMatch,index) => {
                return <CollapsableRouteCard routeMatch={routeMatch} oneOfMany={routes.length > 1} key={index}/>
            })}
        </div>
        <h2 className={`cards-header ${stops.length>1?"collapsible":""}`}>Stops:</h2>
        <div className="cards geocard stops">
            {
                stops.map((match,index) => {
                    return <CollapsableStopCard match={match} oneOfMany={routes.length>1} key={index}/>
                })
            }
        </div>
    </React.Fragment>);

}