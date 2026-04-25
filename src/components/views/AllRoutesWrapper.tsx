import React, {useContext} from "react";
import {useCardState} from "../util/CardStateComponent";
import {MatchType, RouteMatch} from "../../js/updateState/DataModels";
import {useHighlight} from "../util/MapHighlightingStateComponent";
import {CollapsableRouteCard, RouteCardContent} from "./RouteCard";
import { OBA } from "../../js/oba";
import {CollapsableStopCard} from "./StopCardWrapper";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import log from 'loglevel';
import { UnderlineOnFocusElement } from "../shared/common";


export function AbreviatedRouteCard({ routeMatch}: {routeMatch: RouteMatch}): JSX.Element | null {
    log.info("generating allroutes card: ", routeMatch);
    const {search} = useNavigation()
    if (routeMatch.type !== MatchType.RouteMatch) {
        return null
    }
    return (
        <React.Fragment>
            <div className={`card route-card ${routeMatch.routeId}`} onClick={()=>search(routeMatch.routeId)}>
                <UnderlineOnFocusElement
                    variant="black"
                    as="button"
                    className="card-header link-header"
                    style={{ borderColor: "#" + routeMatch.color }}
                    tabIndex={0}
                >
                    <h3 className="card-title">{OBA.Config.noWidows(routeMatch.routeTitle)}</h3>
                </UnderlineOnFocusElement>
            </div>
        </React.Fragment>
    );
}

export function AllRoutesWrapper():JSX.Element{
    const {state} = useCardState()
    let routes = state.currentCard.searchMatches.map(match=>{
        return match.routeMatches
            .filter(routeMatch => routeMatch.type === MatchType.RouteMatch)
            .map(routeMatch => routeMatch)
    }).flat() as RouteMatch[]


    return (<React.Fragment>
        <h2 className={`cards-header`}>Routes:</h2>
        <div className="cards allroutes">
            {routes.map((routeMatch,index) => {
                return <AbreviatedRouteCard routeMatch={routeMatch} key={index}/>
            })}
        </div>
    </React.Fragment>);
}