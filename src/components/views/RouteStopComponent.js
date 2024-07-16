import React, {useContext} from "react";
import RouteVehicleComponent from "./routeVehicleComponent"
import {CardStateContext} from "../util/CardStateComponent";
import {fetchSearchData} from "../../js/updateState/searchEffect";

function getRouteStopComponent  (stopData) {
    // console.log("generating RouteStopComponent for ",stopData)

    const { state, setState } = useContext(CardStateContext);
    const search = (searchterm) =>{
        fetchSearchData(state, setState, searchterm)
    }
//className="has-info" should be added if it has a child vehicle
    return (
        <li  key={stopData.name + " " + stopData.id}>
            <a href="#" onClick={() => search(stopData.id.split("_")[1])} tabIndex={stopData.id}>{stopData.name}</a>
        </li>
    )
}
export default getRouteStopComponent;