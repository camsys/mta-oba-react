import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import vehicleComponent from "../../components/map/vehicleComponent";
import {GlobalStateContext} from "../../components/util/globalState";
import queryString from "query-string";

const siriEffect = () => {


    function generateVehicleMarker(vehicleInfo,lineRef,log){
        const longLat = [];
        let mvj = vehicleInfo.MonitoredVehicleJourney
        longLat.push(mvj.VehicleLocation.Latitude)
        longLat.push(mvj.VehicleLocation.Longitude)
        let destination = mvj.DestinationName
        let strollerVehicle = mvj.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle
        let hasRealtime = mvj.Monitored;
        let vehicleId = mvj.VehicleRef
        let direction = mvj?.Bearing
        let vc = vehicleComponent(longLat,
            vehicleId, lineRef,destination,strollerVehicle,
            hasRealtime,direction)
        if (log) {
            OBA.Util.log('first vehicleComponent:')
            OBA.Util.log(vc)

        }
        updateVehicles = true;
        return vc
    }


    function parseSiri (siri, lineRef){
        let newVehicleMarkers = [];
        OBA.Util.log(siri)
        let vehicles = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity
        let situations = siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
        OBA.Util.trace("vehicles found:")
        OBA.Util.trace(vehicles)
        if (vehicles != null && vehicles.length != 0) {
            let first = true;
            for (let i = 0; i < vehicles.length; i++) {

                newVehicleMarkers.push(generateVehicleMarker(vehicles[i]));
            };

            OBA.Util.log('processed vehicles')
        } else {
            OBA.Util.log('no vehicles recieved. not processing vehicles')
        }
        return [vehicles,situations,newVehicleMarkers]
    }

    function updateState(newVehicleMarkers){
        OBA.Util.trace('completed call to siri')
        OBA.Util.trace("pre-update vehicle state")
        OBA.Util.trace(state.vehicleMarkers)
        OBA.Util.log("updating vehicle state to")
        OBA.Util.log(newVehicleMarkers)
        OBA.Util.trace("updating vehicles state?: " + updateVehicles)
        OBA.Util.trace(updateVehicles)
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
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "&"+OBA.Config.cards.routeCard.queryIdentifier+"=" + lineRef;
    var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search;
    var updateVehicles = false;

    useEffect(() => {
        OBA.Util.log("reading siri from " + targetAddress)
        fetch(targetAddress)
            .then((response) => response.json())
            .then((parsed) => {
                let [vehicles,situations, vehicleMarkers] = parseSiri(parsed,lineRef)
                updateState(vehicleMarkers)
            })
            .catch((error) => {
                console.error(error);
            });

    }, [setState]);
};

export default siriEffect;