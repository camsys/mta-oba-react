import React, {useContext, useEffect, useState} from "react";
import {
    serviceAlertDataIdentifier,
    vehicleDataIdentifier,
    updatedTimeIdentifier,
    VehicleStateContext, stopSortedDataIdentifier
} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";
import {createServiceAlertInterface, createVehicleRtInterface} from "./DataModels";
import log from 'loglevel';








function extractData (routeId,siri){
    let update= false;
    log.info("extractData from Siri")
    let keyword = "serviceAlert & vehicle"
    let lastCallTime = siri?.Siri?.ServiceDelivery?.ResponseTimestamp
    let [vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap] = [new Map(), new Map(),new Map()]

    let vehicleActivity = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery
    log.info(vehicleActivity)
    vehicleActivity = vehicleActivity!=null ? vehicleActivity[0]?.VehicleActivity : null
    log.info("siri vehicles found:",vehicleActivity)
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
        log.info('processed vehicles' , stopsToVehiclesMap)
    } else {
        log.info('no '+keyword+' recieved. not processing '+keyword)
    }

    let serviceAlertActivity = siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
    serviceAlertActivity = serviceAlertActivity==null? null :serviceAlertActivity[0]?.Situations?.PtSituationElement
    log.info("service alerts found:", serviceAlertActivity)
    if (serviceAlertActivity != null) {
        update = true;
        log.info("service alerts found:", serviceAlertActivity)
        for (let i = 0; i < serviceAlertActivity.length; i++) {
            let situationElement = serviceAlertActivity[i]
            log.info("processing service alert:", situationElement)
            let effects = situationElement.Affects.VehicleJourneys.AffectedVehicleJourney
            log.info(effects)
            const routesWithServiceAlerts = {}
            effects.forEach((effect)=>{
                let delim = "_"
                // todo: externalize target for ease of reference & to easily generate multiple target types
                let serviceAlertTarget = effect?.LineRef
                let alerts
                alerts = serviceAlertDataMap.get(serviceAlertTarget)
                alerts = alerts==null? [] : alerts
                alerts.push(createServiceAlertInterface(situationElement))
                // log.info("adding service alert: ",serviceAlertTarget,alerts)
                serviceAlertDataMap.set(serviceAlertTarget,alerts)
                serviceAlertTarget = effect?.LineRef + delim + effect?.DirectionRef
                alerts = serviceAlertDataMap.get(serviceAlertTarget)
                alerts = alerts==null? [] : alerts
                alerts.push(createServiceAlertInterface(situationElement))
                // log.info("adding service alert: ",serviceAlertTarget,alerts)
                serviceAlertDataMap.set(serviceAlertTarget,alerts)
            })
            log.info("processing service alert: ",situationElement)
        };
        log.info("maps made via siri: ",[vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap])
        log.info('processed '+keyword)
    } else {
        log.info('no '+keyword+' recieved. not processing '+keyword)
    }
    log.info("maps made via siri: ",[vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap])
    return [[routeId,vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap,lastCallTime],update]
}


function updateVehiclesState(updates,setState){
    log.info("adding updates to vehicleState:",updates)
    let stateFunc = (prevState) => {
        let newState = {...prevState}
        newState.renderCounter = prevState.renderCounter + 1
        Object.entries(updates).forEach(([key, val]) => {newState[key]=val})
        return newState
    }
    setState(stateFunc);
}

const fetchAndProcessVehicleMonitoring = async ([routeId,targetAddress]) =>{
    log.info("searching for siri at: ",targetAddress)
    return fetch(targetAddress)
        .then((response) => response.json())
        .then((siri) => {
            log.info("reading serviceAlert & vehicle from " + targetAddress)
            let processedData = extractData(routeId,siri)
            let update = processedData[1]
            if(update){
                log.info("should update serviceAlert & vehicle state?",update)
                return processedData[0]
            }
            return null
        })
        .catch((error) => {
            log.error("error processing Siri data",error);
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
        log.info("siri seeks promises from ", targetAddresses)
        let returnedPromises = await Promise.all(targetAddresses.map(adr => dataProcessFunction(adr)))
        log.info("siri promises awaited ", returnedPromises)
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
        log.info("combining siri objs",dataObjsList)
        let siriCombinedDataObj = mergeSiri(dataObjsList)
        log.info("siri data found: ", siriCombinedDataObj)
        return siriCombinedDataObj

    }
    getData().then((processedData) => {
        log.info("processedData", processedData)
        processedData != null ? updateVehiclesState(processedData, setState) : null
        log.info("vehicleState", vehicleState)
    }).catch((x) => log.info("siri call issue!", x))
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
    log.info("looking for Siri Data for vehicle!",routeIdList,vehicleId)
    let targetAddresses = getTargetList(routeIdList)

    if(targetAddresses.length!==1){
        log.error("a very odd situation has occured and should be reported in siriGetVehiclesForVehicleViewEffect",routeIdList,vehicleId,vehicleState,setState)
    }
    targetAddresses = targetAddresses.concat(targetAddresses.map(adr=>{
        return [adr[0],adr[1]+`&VehicleRef=${vehicleId.split('_')[1]}&MaximumNumberOfCallsOnwards=50&VehicleMonitoringDetailLevel=calls`]}))

    return siriGetAndSetVehiclesForVehicleMonitoring(targetAddresses,vehicleState,setState)
}

export const siriGetVehiclesForRoutesEffect = (routeIdList,vehicleState, setState ) => {
    log.info("looking for Siri Data!",routeIdList)
    let targetAddresses = getTargetList(routeIdList)
    return siriGetAndSetVehiclesForVehicleMonitoring(targetAddresses,vehicleState,setState)
};
