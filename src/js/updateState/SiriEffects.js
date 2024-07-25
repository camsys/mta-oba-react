import React, {useContext, useEffect, useState} from "react";
import {serviceAlertData, vehicleData} from "./dataModels";
import {
    serviceAlertDataIdentifier,
    vehicleDataIdentifier,
    updatedTimeIdentifier,
    VehicleStateContext
} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";








    function extractData (routeId,siri){
        let update= false;
        console.log("extractData from Siri")
        let keyword = "serviceAlert & vehicle"
        let lastCallTime = siri?.Siri?.ServiceDelivery?.ResponseTimestamp
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
        return [[routeId,vehicleDataMap,serviceAlertDataMap,lastCallTime],update]
    }


    function updateVehiclesState(updates,setState){
        console.log("adding updates to vehicleState:",updates)
        let stateFunc = (prevState) => {
            let newState = {...prevState}
            newState.renderCounter = prevState.renderCounter + 1
            Object.entries(updates).forEach(([key, val]) => {newState[key]=val})
            return newState
        }
        setState(stateFunc);
    }

const fetchAndProcessSiri = async ([routeId,targetAddress]) =>{
    console.log("searching for siri at: ",targetAddress)
    return fetch(targetAddress)
        .then((response) => response.json())
        .then((siri) => {
            OBA.Util.log("reading serviceAlert & vehicle from " + targetAddress)
            let processedData = extractData(routeId,siri)
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

const siriGetVehiclesForAddressesEffect = (targetAddresses,vehicleState, setState ) =>
{
    let getData = async () => {
        console.log("siri seeks promises from ", targetAddresses)
        let returnedPromises = await Promise.all(targetAddresses.map(adr => fetchAndProcessSiri(adr)))
        console.log("siri promises awaited ", returnedPromises)
        let dataObjs = returnedPromises.filter(
            (result) => result !== null && typeof result !== "undefined")
            .map(
                ([routeId, vehicleDataList, serviceAlertDataList, lastCallTime]) => {
                    let dataObj = {}
                    dataObj[routeId + serviceAlertDataIdentifier] = serviceAlertDataList
                    dataObj[routeId + vehicleDataIdentifier] = vehicleDataList
                    dataObj[routeId + updatedTimeIdentifier] = lastCallTime
                    return dataObj
                })
        if (dataObjs.length === 0) {
            return null
        }
        let vehicleDataObj = dataObjs.reduce((acc, vehiclesForRouteObj) => {
            Object.entries(vehiclesForRouteObj).forEach(
                ([key, val]) => {
                    acc[key] = val
                })
            return acc
        })
        console.log("siri data found: ", vehicleDataObj)

        return vehicleDataObj

    }
    getData().then((processedData) => {
        console.log("processedData", processedData)
        processedData != null ? updateVehiclesState(processedData, setState) : null
        console.log("vehicleState", vehicleState)
    }).catch((x) => console.log("siri call issue!", x))
}




export const siriGetVehiclesForRoutesEffect = (routeIdList,vehicleState, setState ) => {
    console.log("looking for Siri Data!",routeIdList)

    let baseTargetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT

    let targetAddresses = routeIdList.map((routeId)=>{
        let operatorRef = routeId.split("_")[0].replace(" ","+");
        const lineRef = routeId.split("_")[1];
        return [lineRef,baseTargetAddress+"&OperatorRef=" +operatorRef + "&LineRef"+"=" + routeId.replace("+","%2B")];
    })

    return siriGetVehiclesForAddressesEffect(targetAddresses,vehicleState,setState)
};
