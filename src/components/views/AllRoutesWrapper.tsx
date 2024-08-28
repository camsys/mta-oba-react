import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import {MatchType, RouteMatch} from "../../js/updateState/DataModels";
import {useHighlight} from "../util/MapHighlightingStateComponent";
import {CollapsableRouteCard, RouteCardContent} from "./RouteCard";
import { OBA } from "../../js/oba";
import {CollapsableStopCard} from "./StopCardWrapper";
import {useSearch} from "../../js/updateState/SearchEffect";


export function AbreviatedRouteCard({ routeMatch}: RouteMatch): JSX.Element {
    console.log("generating allroutes card: ", routeMatch);
    const {search} = useSearch()
    if (routeMatch.type !== MatchType.RouteMatch) {
        return null
    }
    return (
        <React.Fragment>
            <div className={`card route-card ${routeMatch.routeId}`} onClick={()=>search(routeMatch.routeId)}>
                <div
                    className="card-header"
                    style={{ borderColor: "#" + routeMatch.color }}
                >
                    <h3 className="card-title">{OBA.Config.noWidows(routeMatch.routeTitle)}</h3>
                </div>
            </div>
        </React.Fragment>
    );
}

export function AllRoutesWrapper():JSX.Element{
    const {state} = useContext(CardStateContext)
    let routes = state.currentCard.searchMatches.map(match=>{
        return match.routeMatches.map(routeMatch=>{
            if(routeMatch.type === MatchType.RouteMatch){return routeMatch}
        })
    }).flat().filter(x=>x!==null&&typeof x!=='undefined')


    return (<React.Fragment>
        <h2 className={`cards-header`}>Routes:</h2>
        <div className="cards allroutes">
            {routes.map((routeMatch,index) => {
                return <AbreviatedRouteCard routeMatch={routeMatch} key={index}/>
            })}
        </div>
    </React.Fragment>);
}