import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import {RouteCard} from "./RouteCard";
import {StopCard} from "./StopCardWrapper.tsx";
import {MatchType} from "../../js/updateState/DataModels";


export function GeoCardWrapper  () :JSX.Element {
    const { state} = useContext(CardStateContext);
    console.log("generating GeoCard:", state.currentCard.searchMatches);

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

    console.log("geocard routes&stops",routes,stops)

    return (<React.Fragment>
        <h2 className={`cards-header ${stops.length > 1 ? "collapsible" : ""}`}>Routes:</h2>
        <div className="cards geocard routes">
            {state.currentCard.searchMatches.map(match=>{
                return match.routeMatches.map(routeMatch=>{
                    return <RouteCard routeMatch={routeMatch} oneOfMany={routes.length>1}/>
                    })
                })
            }
        </div>
        <h2 className={`cards-header ${stops.length>1?"collapsible":""}`}>Stops:</h2>
        <div className="cards geocard stops">
            {
                state.currentCard.searchMatches.map(match=>{
                return match.routeMatches.map(routeMatch=>{
                    return new StopCard(routeMatch,stops.length>1)
                    })
                })
            }
        </div>
    </React.Fragment>);

}