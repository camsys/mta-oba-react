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
        serviceAlertActivity = serviceAlertActivity==null? null :serviceAlertActivity[0]?.Situations?.PtSituationElement
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
                    // if(routesWithServiceAlerts[serviceAlertTarget]===null){
                    //     alerts = serviceAlertDataMap.get(serviceAlertTarget)
                    //     alerts = alerts==null? [] : alerts
                    //     alerts.push(new serviceAlertData(situationElement))
                    //     console.log("adding service alert: ",serviceAlertTarget,alerts)
                    //     serviceAlertDataMap.set(serviceAlertTarget,alerts)
                    //     routesWithServiceAlerts[serviceAlertTarget] = alerts
                    // }

                    alerts = serviceAlertDataMap.get(serviceAlertTarget)
                    alerts = alerts==null? [] : alerts
                    alerts.push(new serviceAlertData(situationElement))
                    console.log("adding service alert: ",serviceAlertTarget,alerts)
                    serviceAlertDataMap.set(serviceAlertTarget,alerts)


                    serviceAlertTarget = effect?.LineRef + delim + effect?.DirectionRef
                    alerts = serviceAlertDataMap.get(serviceAlertTarget)
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
        let dataObjsList = returnedPromises.filter(
            (result) => result !== null && typeof result !== "undefined")
            .map(
                ([routeId, vehicleDataList, serviceAlertDataList, lastCallTime]) => {
                    let dataObj = {}
                    dataObj[routeId + serviceAlertDataIdentifier] = serviceAlertDataList
                    dataObj[routeId + vehicleDataIdentifier] = vehicleDataList
                    dataObj[routeId + updatedTimeIdentifier] = lastCallTime
                    return dataObj
                })
        if (dataObjsList.length === 0) {
            return null
        }
        let siriCombinedDataObj = dataObjsList.reduce((combinedRoutes, vehiclesForRouteObj) => {
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

    return routeIdList.map((routeId)=>{
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
        return [adr[0],adr[1]+`&VehicleRef=${vehicleId.split('_')[1]}&MaximumNumberOfCallsOnwards=3&VehicleMonitoringDetailLevel=calls`]}))

    return siriGetVehiclesForAddressesEffect(targetAddresses,vehicleState,setState)
}

export const siriGetVehiclesForRoutesEffect = (routeIdList,vehicleState, setState ) => {
    console.log("looking for Siri Data!",routeIdList)
    let targetAddresses = getTargetList(routeIdList)
    return siriGetVehiclesForAddressesEffect(targetAddresses,vehicleState,setState)
};
