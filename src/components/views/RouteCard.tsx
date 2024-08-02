import React, { useContext, useState } from "react";
import { OBA } from "../../js/oba";
import { CardStateContext } from "../../components/util/CardStateComponent";
import ServiceAlertContainerComponent from "./ServiceAlertContainerComponent";
import getRouteDirectionComponent from "./RouteDirectionComponent";
import { MapHighlightingStateContext } from "../util/MapHighlightingStateComponent";
import {MatchType, RouteMatch, SearchMatch} from "../../js/updateState/DataModels";










export function RouteCard({ routeMatch }: SearchMatch): JSX.Element {
    console.log("generating route card: ", routeMatch);
    if (routeMatch.type !== MatchType.RouteMatch) {
        return null
    }

    const { mapHighlightingState, setHighlightingState } = useContext(MapHighlightingStateContext);
    const setHoveredItemId = (id: string | null): void => {
        console.log("highlighting: ", id);
        if (mapHighlightingState.highlightedComponentId !== id) {
            setHighlightingState((prevState) => ({
                ...prevState,
                highlightedComponentId: id,
            }));
        }
    };

    let routeId = routeMatch.routeId.split("_")[1];
    let serviceAlertIdentifier = routeMatch.routeId;

    return (
        <React.Fragment>
            <div className={`card route-card ${routeMatch.routeId}`}>
                <div
                    className="card-header"
                    style={{ borderColor: "#" + routeMatch.color }}
                    onMouseEnter={() => setHoveredItemId(routeMatch.routeId)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    >
                    <h3 className="card-title">{OBA.Config.noWidows(routeMatch.routeTitle)}</h3>
                </div>
                <div className="card-content">
                    <ul className="card-details">
                        <li className="via">{routeMatch.description}</li>
                    </ul>
                    <ServiceAlertContainerComponent {...{ routeId, serviceAlertIdentifier }} />
                        {routeMatch.directions.map((dir, index) =>
                            React.createElement(getRouteDirectionComponent, {
                                ...dir.routeDirectionComponentData,
                                color: routeMatch.color,
                                key: index,
                            })
                        )}
                </div>
            </div>
        </React.Fragment>
);
}

export function RouteCardWrapper(): JSX.Element {
    const { state } = useContext(CardStateContext);
    console.log("adding route cards for matches:", state.currentCard.searchMatches);

    return (
        <React.Fragment>
            <h2 className="cards-header">Routes:</h2>
    <div className="cards">
        {state.currentCard.searchMatches.map((searchMatch, index) =>
                <RouteCard routeMatch={searchMatch} key={index}/>
            )}
        </div>
        </React.Fragment>
);
}