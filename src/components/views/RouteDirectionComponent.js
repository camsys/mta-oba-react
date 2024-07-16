import React, {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent";
import {OBA} from "../../js/oba";
import {routeDirectionComponentDatum} from "../../js/updateState/dataModels";
import RouteStopComponent from "./RouteStopComponent";

function getRouteStopComponents(routeStopComponentsData){
    console.log("getting RouteStopComponents for: ", routeStopComponentsData)
    let out = routeStopComponentsData.map((datum)=>{return new RouteStopComponent(datum)})
    return out
}

export default function getRouteDirectionComponent(routeDirectionComponentDatum){
    const { state} = useContext(CardStateContext);
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
                <ul className="route-stops" styles="color: #00AEEF;" key="test">
                    {console.log("preparing to get RouteStopComponents from: ", routeDirectionComponentDatum)}
                    {
                        getRouteStopComponents(routeDirectionComponentDatum.routeStopComponentsData)
                    }
                </ul>
            </div>
        </div>
    )
    console.log("RouteDirectionComponent: ", out)
    return out
}
