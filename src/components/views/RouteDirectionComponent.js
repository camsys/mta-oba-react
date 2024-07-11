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
                <ul className="route-stops" styles="color: #00AEEF;" key="test">
                    {console.log("preparing to get RouteStopComponents from: ", routeDirectionComponentDatum)}
                    {
                        getRouteStopComponents(routeDirectionComponentDatum.routeStopComponentsData)
                        // routeDirectionComponentDatum.routeStopComponentsData.map(datum=>{return new RouteStopComponent(datum)})
                    }
                </ul>
            </div>
        </div>
    )
    console.log("RouteDirectionComponent: ", out)
    return out
}


//     <div className="route-direction inner-card collapsible">
//     <button className="card-header collapse-trigger" aria-haspopup="true"
// aria-expanded="false"
// aria-label="Toggle B38 to Ridgewood Metro Av Open / Closed">
//     <span className="label">to <strong>Ridgewood Metro Av</strong></span>
// </button>
// <div className="card-content collapse-content" styles="max-height: 0px;">
//     <ul className="route-stops" styles="color: #00AEEF;">
//         <li><a href="#" tabIndex="-1">Cadman Plz W/Tillary St</a></li>
//         <li><a href="#" tabIndex="-1">Cadman Plz W/Montague St</a></li>
//         <li><a href="#" tabIndex="-1">Joralemon St/Court St</a></li>
//         <li><a href="#" tabIndex="-1">Fulton St/Jay St</a></li>
//         <li><a href="#" tabIndex="-1">Fulton St/Duffield St</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Bond St</a></li>
//         <li className="has-info">
//             <a href="#" tabIndex="-1">DeKalb Av/Flatbush Av Ex</a>
//             <ul className="approaching-buses">
//                 <li>
//                     <a
//                         href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
//                         className="bus">7001</a>
//                     <span className="bus-info">
//                           <span className="approaching">1 stop away</span>
//                           <span className="passengers">~10 passengers</span>
//                         </span>
//                 </li>
//             </ul>
//         </li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Ft Greene Pl</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/S Portland Av</a></li>
//         <li className="has-info">
//             <a href="#" tabIndex="-1">DeKalb Av/Carlton Av</a>
//             <ul className="approaching-buses">
//                 <li>
//                     <a
//                         href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
//                         className="bus">7222</a>
//                     <span className="bus-info">
//                           <span className="approaching">approaching</span>
//                         </span>
//                 </li>
//             </ul>
//         </li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Vanderbilt Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Washington Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Ryerson Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Classon Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Franklin Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Bedford Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Nostrand Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Marcy Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Tompkins Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Throop Av</a></li>
//         <li><a href="#" tabIndex="-1">Dekalb Av/Marcus Garvey Bl</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Lewis Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Stuyvesant Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Malcolm X Bl</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Broadway</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Evergreen Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Myrtle Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Wilson Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Knickerbocker Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Irving Av</a></li>
//         <li><a href="#" tabIndex="-1">DeKalb Av/Wyckoff Av</a></li>
//         <li className="has-info">
//             <a href="#" tabIndex="-1">DeKalb Av/St Nicholas Av</a>
//             <ul className="approaching-buses">
//                 <li>
//                     <a
//                         href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
//                         className="bus">7105</a>
//                     <span className="bus-info">
//                           <span className="approaching">at stop</span>
//                         </span>
//                 </li>
//                 <li>
//                     <a
//                         href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
//                         className="bus">7336</a>
//                     <span className="bus-info">
//                           <span className="approaching">approaching</span>
//                           <span className="passengers">~20 passengers</span>
//                         </span>
//                 </li>
//             </ul>
//         </li>
//         <li><a href="#" tabIndex="-1">Seneca Av/DeKalb Av</a></li>
//         <li><a href="#" tabIndex="-1">Stanhope St/Onderdonk Av</a></li>
//         <li><a href="#" tabIndex="-1">Stanhope St/Woodward Av</a></li>
//         <li><a href="#" tabIndex="-1">Seneca Av/Bleecker St</a></li>
//         <li><a href="#" tabIndex="-1">Stanhope St/Grandview Av</a></li>
//         <li><a href="#" tabIndex="-1">Seneca Av/Gates Av</a></li>
//         <li><a href="#" tabIndex="-1">Grandview Av/Metropolitan Av</a></li>
//         <li><a href="#" tabIndex="-1">Metropolitan Av/Starr St</a></li>
//         <li><a href="#" tabIndex="-1">Seneca Av/Cornelia St</a></li>
//     </ul>
// </div>
// </div>