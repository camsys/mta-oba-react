import React, {useContext, useEffect, useState} from "react";
import {serviceAlertData, vehicleData} from "./dataModels";
import {
    serviceAlertDataIdentifier,
    vehicleDataIdentifier,
    VehicleStateContext
} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";








    function extractData (siri){
        let update= false;
        console.log("extractData from Siri")
        let keyword = "serviceAlert & vehicle"
        let vehicleActivity = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery
        console.log(vehicleActivity)
        vehicleActivity = vehicleActivity!=null ? vehicleActivity[0]?.VehicleActivity : null
        console.log("vehicles found:",vehicleActivity)
        let serviceAlertActivity = siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
        serviceAlertActivity = serviceAlertActivity==null? null :serviceAlertActivity[0]?.Situations
        console.log("service alerts found:", serviceAlertActivity)
        let [vehicleDataMap,serviceAlertDataMap] = [new Map(), new Map()]
        console.log([vehicleDataMap,serviceAlertDataMap])
        if (vehicleActivity != null && vehicleActivity.length != 0) {
            update = true;
            for (let i = 0; i < vehicleActivity.length; i++) {
                OBA.Util.trace("processing vehicle #" + i);
                let mvj = vehicleActivity[i].MonitoredVehicleJourney
                vehicleDataMap.set(mvj.VehicleRef,new vehicleData(mvj))
                // console.log("processing mvj: ",mvj)
            };
            OBA.Util.log('processed vehicles')
        } else {
            OBA.Util.log('no '+keyword+' recieved. not processing '+keyword)
        }
        // todo: setup service alerts
        if (serviceAlertActivity != null) {
            update = true;
            for (let i = 0; i < serviceAlertActivity.length; i++) {
                console.log("service alerts found:", serviceAlertActivity)
                OBA.Util.trace("processing "+keyword+"#" + i);
                let situationElement = vehicleActivity[i]?.PtSituationElement
                console.log(situationElement)
                let effects = situationElement.Affects.VehicleJourneys.AffectedVehicleJourney
                console.log(effects)
                effects.forEach((effect)=>{
                    let delim = "_"
                    // todo: externalize target for ease of reference & to easily generate multiple target types
                    let serviceAlertTarget = effect?.LineRef + delim + effect?.DirectionRef
                    let alerts = serviceAlertDataMap.get(serviceAlertTarget)
                    alerts = alerts==null? [] : alerts
                    alerts.push(new serviceAlertData(situationElement))
                    console.log("adding service alert: ",serviceAlertTarget,alerts)
                    serviceAlertDataMap.set(serviceAlertTarget,alerts)
                })
                console.log("processing service alert: ",situationElement)
            };
            console.log("maps made via siri: ",[vehicleDataMap,serviceAlertDataMap])
            OBA.Util.log('processed '+keyword)
        } else {
            OBA.Util.log('no '+keyword+' recieved. not processing '+keyword)
        }
        OBA.Util.log(keyword+" post process")
        return [[vehicleDataMap,serviceAlertDataMap],update]
    }


    function updateVehiclesState([vehicleDataList,serviceAlertDataList],setState,lineRef){
        console.log("adding to serviceAlert & vehicle state:",[vehicleDataList,serviceAlertDataList])
        let stateFunc = (prevState) => {
            let newState = {...prevState}
            newState.renderCounter = prevState.renderCounter + 1
            newState[lineRef+serviceAlertDataIdentifier] = serviceAlertDataList
            newState[lineRef+vehicleDataIdentifier] = vehicleDataList
            return newState
        }
        setState(stateFunc);
    }

const fetchAndProcessSiri = async (targetAddress) =>{
    return fetch(targetAddress)
        .then((response) => response.json())
        .then((siri) => {
            OBA.Util.log("reading serviceAlert & vehicle from " + targetAddress)
            let processedData = extractData(siri)
            let update = processedData[1]
            if(update){
                console.log("should update serviceAlert & vehicle state?",update)
                return processedData[0]
                console.log("new serviceAlert & vehicle state",vehicleState)
            }
            return null
        })
        .catch((error) => {
            console.error(error);
        });


}

const siriVehiclesEffect = (routeId) => {
    let operatorRef = routeId.split("_")[0].replace(" ","+");
    const lineRef = routeId.split("_")[1];

    let search = "&OperatorRef=" +operatorRef + "&LineRef"+"=" + lineRef.replace("+","%2B");
    // search = search + "&MaximumNumberOfCallsOnwards=3&VehicleMonitoringDetailLevel=calls"
    let targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search
    console.log("searching for siri at: ",targetAddress)
    targetAddress = lineRef==null?null:targetAddress
    const {vehicleState, setState } = useContext(VehicleStateContext);


    useEffect( () => {
        if (targetAddress == null) {
            return
        }
        fetchAndProcessSiri(targetAddress).then((processedData) => {
            processedData != null ? updateVehiclesState(processedData, setState, lineRef) : null
        })
    }, []);
};


export default siriVehiclesEffect;
