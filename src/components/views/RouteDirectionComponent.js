import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import {OBA} from "../../js/oba";
import RouteStopComponent from "./RouteStopComponent";


export default function getRouteDirectionComponent(routeDirectionComponentDatum,color){
    console.log("generating RouteDirectionComponent:", routeDirectionComponentDatum)
    let out = (
        <div className="route-direction inner-card collapsible">
            <button className="card-header collapse-trigger" aria-haspopup="true"
                    aria-expanded="false"
                    aria-label={"Toggle "+routeDirectionComponentDatum.routeId+" to " + routeDirectionComponentDatum.routeDestination +" Open / Closed"}>
                <span className="label">to <strong> {routeDirectionComponentDatum.routeDestination}</strong></span>
            </button>
            <div className="card-content collapse-content" styles="max-height: 0px;">
                {/*this should be broken out into a component which re-renders when the stops call completes*/}
                {/* this ul needs to get the route color applied in the style attribute, says becky */}
                {/*todo: fix this.*/}

                <ul className="route-stops" style={{ color: '#'+color}}>
                    {console.log("preparing to get RouteStopComponents from: ", routeDirectionComponentDatum)}
                    {
                        routeDirectionComponentDatum.routeStopComponentsData.map(
                            stopDatum =><RouteStopComponent stopDatum={stopDatum} routeId = {routeDirectionComponentDatum.routeId} />)
                    }
                </ul>
            </div>
        </div>
    )
    console.log("RouteDirectionComponent: ", out)
    return out
}
