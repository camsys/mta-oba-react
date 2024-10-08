import React, {useContext, useEffect, useState} from "react";
import {
    serviceAlertDataIdentifier,
    vehicleDataIdentifier,
    updatedTimeIdentifier,
    VehicleStateContext, stopSortedDataIdentifier
} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";
import {createServiceAlertInterface, createVehicleRtInterface} from "./DataModels";








function extractData (routeId,siri){
    let update= false;
    console.log("extractData from Siri")
    let keyword = "serviceAlert & vehicle"
    let lastCallTime = siri?.Siri?.ServiceDelivery?.ResponseTimestamp
    let [vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap] = [new Map(), new Map(),new Map()]

    let vehicleActivity = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery
    console.log(vehicleActivity)
    vehicleActivity = vehicleActivity!=null ? vehicleActivity[0]?.VehicleActivity : null
    console.log("siri vehicles found:",vehicleActivity)
    if (vehicleActivity != null && vehicleActivity.length != 0) {
        update = true;
        for (let i = 0; i < vehicleActivity.length; i++) {
            OBA.Util.trace("processing vehicle #" + i);
            let mvj = vehicleActivity[i].MonitoredVehicleJourney
            let vehicleDatum = createVehicleRtInterface(mvj,OBA.Util.ISO8601StringToDate(lastCallTime))
            vehicleDataMap.set(mvj.VehicleRef,vehicleDatum)
            let vehicles = stopsToVehiclesMap.get(vehicleDatum.nextStop)
            if(vehicles===null || typeof vehicles === "undefined"){
                vehicles = []
                stopsToVehiclesMap.set(vehicleDatum.nextStop,vehicles)
            }
            vehicles.push(vehicleDatum)
        };
        OBA.Util.log('processed vehicles')
    } else {
        OBA.Util.log('no '+keyword+' recieved. not processing '+keyword)
    }

    let serviceAlertActivity = siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
    serviceAlertActivity = serviceAlertActivity==null? null :serviceAlertActivity[0]?.Situations?.PtSituationElement
    console.log("service alerts found:", serviceAlertActivity)
    if (serviceAlertActivity != null) {
        update = true;
        console.log("service alerts found:", serviceAlertActivity)
        for (let i = 0; i < serviceAlertActivity.length; i++) {
            let situationElement = serviceAlertActivity[i]
            console.log("processing service alert:", situationElement)
            let effects = situationElement.Affects.VehicleJourneys.AffectedVehicleJourney
            console.log(effects)
            const routesWithServiceAlerts = {}
            effects.forEach((effect)=>{
                let delim = "_"
                // todo: externalize target for ease of reference & to easily generate multiple target types
                let serviceAlertTarget = effect?.LineRef
                let alerts
                alerts = serviceAlertDataMap.get(serviceAlertTarget)
                alerts = alerts==null? [] : alerts
                alerts.push(createServiceAlertInterface(situationElement))
                // console.log("adding service alert: ",serviceAlertTarget,alerts)
                serviceAlertDataMap.set(serviceAlertTarget,alerts)
                serviceAlertTarget = effect?.LineRef + delim + effect?.DirectionRef
                alerts = serviceAlertDataMap.get(serviceAlertTarget)
                alerts = alerts==null? [] : alerts
                alerts.push(createServiceAlertInterface(situationElement))
                // console.log("adding service alert: ",serviceAlertTarget,alerts)
                serviceAlertDataMap.set(serviceAlertTarget,alerts)
            })
            console.log("processing service alert: ",situationElement)
        };
        console.log("maps made via siri: ",[vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap])
        OBA.Util.log('processed '+keyword)
    } else {
        OBA.Util.log('no '+keyword+' recieved. not processing '+keyword)
    }
    console.log("maps made via siri: ",[vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap])
    return [[routeId,vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap,lastCallTime],update]
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

const fetchAndProcessVehicleMonitoring = async ([routeId,targetAddress]) =>{
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
            console.error("error processing Siri data",error);
        });


}

const mergeSiri = (dataObjsList) =>{
    return dataObjsList.reduce((combinedRoutes, vehiclesForRouteObj) => {
        Object.entries(vehiclesForRouteObj).forEach(
            ([routeInfoIdentifier, routeObj]) => {
                if(routeInfoIdentifier.includes(updatedTimeIdentifier)){
                    combinedRoutes[routeInfoIdentifier] = routeObj
                }
                else if(combinedRoutes[routeInfoIdentifier] !==null && typeof combinedRoutes[routeInfoIdentifier] !=='undefined'){
                    routeObj.forEach((siriData, siriIdentifier) => {
                        combinedRoutes[routeInfoIdentifier].set(siriIdentifier, siriData)}
                    )}
                else{combinedRoutes[routeInfoIdentifier] = routeObj}})
        return combinedRoutes
    })
}

const siriGetAndSetVehiclesForVehicleMonitoring = (targetAddresses,vehicleState, setState) =>{
    siriGetAndSetVehicles(targetAddresses,vehicleState, setState,fetchAndProcessVehicleMonitoring)
}

const siriGetAndSetVehiclesForStopMonitoring = (targetAddresses,vehicleState, setState) =>{
    siriGetAndSetVehicles(targetAddresses,vehicleState, setState,fetchAndProcessStopMonitoring)
}

const siriGetAndSetVehicles = (targetAddresses,vehicleState, setState, dataProcessFunction) =>
{
    let getData = async () => {
        console.log("siri seeks promises from ", targetAddresses)
        let returnedPromises = await Promise.all(targetAddresses.map(adr => dataProcessFunction(adr)))
        console.log("siri promises awaited ", returnedPromises)
        let dataObjsList = returnedPromises.filter(
            (result) => result !== null && typeof result !== "undefined")
            .map(
                ([routeId, vehicleDataList, serviceAlertDataList, stopsToVehicles, lastCallTime]) => {
                    let dataObj = {}
                    dataObj[routeId + serviceAlertDataIdentifier] = serviceAlertDataList
                    dataObj[routeId + vehicleDataIdentifier] = vehicleDataList
                    dataObj[routeId + updatedTimeIdentifier] = lastCallTime
                    dataObj[routeId + stopSortedDataIdentifier] = stopsToVehicles
                    return dataObj
                })
        if (dataObjsList.length === 0) {
            return null
        }
        console.log("combining siri objs",dataObjsList)
        let siriCombinedDataObj = mergeSiri(dataObjsList)
        console.log("siri data found: ", siriCombinedDataObj)
        return siriCombinedDataObj

    }
    getData().then((processedData) => {
        console.log("processedData", processedData)
        processedData != null ? updateVehiclesState(processedData, setState) : null
        console.log("vehicleState", vehicleState)
    }).catch((x) => console.log("siri call issue!", x))
}

const getTargetList = (routeIdList) =>{
    let baseTargetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT

    return [...routeIdList].map((routeId)=>{
        let operatorRef = routeId.split("_")[0].replace(" ","+");
        const lineRef = routeId.split("_")[1];
        return [lineRef,baseTargetAddress+"&OperatorRef=" +operatorRef + "&LineRef"+"=" + routeId.replace("+","%2B")];
    })
}

export const siriGetVehiclesForVehicleViewEffect = (routeIdList, vehicleId, vehicleState, setState ) => {
    console.log("looking for Siri Data for vehicle!",routeIdList,vehicleId)
    let targetAddresses = getTargetList(routeIdList)

    if(targetAddresses.length!==1){
        console.error("a very odd situation has occured and should be reported in siriGetVehiclesForVehicleViewEffect",routeIdList,vehicleId,vehicleState,setState)
    }
    targetAddresses = targetAddresses.concat(targetAddresses.map(adr=>{
        return [adr[0],adr[1]+`&VehicleRef=${vehicleId.split('_')[1]}&MaximumNumberOfCallsOnwards=50&VehicleMonitoringDetailLevel=calls`]}))

    return siriGetAndSetVehiclesForVehicleMonitoring(targetAddresses,vehicleState,setState)
}

export const siriGetVehiclesForRoutesEffect = (routeIdList,vehicleState, setState ) => {
    console.log("looking for Siri Data!",routeIdList)
    let targetAddresses = getTargetList(routeIdList)
    return siriGetAndSetVehiclesForVehicleMonitoring(targetAddresses,vehicleState,setState)
};
