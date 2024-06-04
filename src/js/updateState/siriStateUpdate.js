import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import vehicleComponent from "../../components/map/vehicleComponent";
import {GlobalStateContext} from "../../components/util/globalState";
import queryString from "query-string";

const siriStateUpdate = () => {

    function parseSiri (siri){
        let newVehicleMarkers = [];
        OBA.Util.trace(siri)
        let vehicles = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity
        let situations = siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
        OBA.Util.trace("vehicles found:")
        OBA.Util.trace(vehicles)
        if (vehicles != null && vehicles.length != 0) {
            let first = true;
            for (let i = 0; i < vehicles.length; i++) {
                const longLat = [];
                longLat.push(vehicles[i].MonitoredVehicleJourney.VehicleLocation.Latitude)
                longLat.push(vehicles[i].MonitoredVehicleJourney.VehicleLocation.Longitude)
                let vehicleComponent1 = vehicleComponent(longLat, i)
                if (first) {
                    first = false;
                    OBA.Util.log('first vehicleComponent:')
                    OBA.Util.log(vehicleComponent1)
                    updateVehicles = true;
                }
                newVehicleMarkers.push(vehicleComponent1);
            };

            OBA.Util.log('processed vehicles')
        } else {
            OBA.Util.log('not processing vehicles')
        }
        return [vehicles,situations,newVehicleMarkers]
    }

    function updateVehicleMarkers(newVehicleMarkers){
        OBA.Util.log('completed call to siri')
        OBA.Util.log("pre-update vehicle state")
        OBA.Util.log(state.vehicleMarkers)
        OBA.Util.log("updating vehicle state to")
        OBA.Util.log(newVehicleMarkers)
        console.log("updating vehicles state?: " + updateVehicles)
        console.log(updateVehicles)
        if(updateVehicles) {
            setState((prevState) => ({
                ...prevState,
                vehicleMarkers: newVehicleMarkers
            }));
        }
        OBA.Util.log("new vehicle state")
        OBA.Util.log(state.vehicleMarkers)
    }



    const { state, setState } = useContext(GlobalStateContext);
    const newVehicleMarkers = [];
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "&"+OBA.Config.cards.routeCard.identifier+"=" + lineRef;
    var targetAddress = "https://" + process.env.ENV_ADDRESS + process.env.VEHICLE_MONITORING_ENDPOINT + search;
    var updateVehicles = false;

    useEffect(() => {
        OBA.Util.log("reading siri from" + targetAddress)
        fetch(targetAddress)
            .then((response) => response.json())
            .then((parsed) => {
                let [vehicles,situations, vehicleMarkers] = parseSiri(parsed)
                updateVehicleMarkers(vehicleMarkers)
            })
            .catch((error) => {
                console.error(error);
            });

    }, [setState]);
};

export default siriStateUpdate;