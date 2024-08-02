import React from "react";
import {createServiceAlertInterface, createVehicleRtInterface} from "./DataModels";
import {
    updatedTimeIdentifier,stopSortedFutureVehicleDataIdentifier
} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";








function extractData (stopId,siri){
    let update= false;
    console.log("extractData for siri stop ",stopId,siri)
    let keyword = "serviceAlert & vehicle"
    let lastCallTime = siri?.Siri?.ServiceDelivery?.ResponseTimestamp
    let [vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap,stopsToExtendedVehiclesMap] =
        [new Map(), new Map(),new Map(),new Map()]

    let stopActivity = siri?.Siri?.ServiceDelivery?.StopMonitoringDelivery
    console.log("siri stop activity",stopActivity)
    stopActivity = stopActivity!=null ? stopActivity[0]?.MonitoredStopVisit : null
    console.log("siri stop vehicles found:",stopActivity)
    if (stopActivity != null && stopActivity.length != 0) {
        update = true;
        for (let i = 0; i < stopActivity.length; i++) {
            OBA.Util.trace("siri stop processing vehicle #" + i);
            let mvj = stopActivity[i].MonitoredVehicleJourney
            let vehicleDatum = createVehicleRtInterface(mvj)
            vehicleDataMap.set(mvj.VehicleRef,vehicleDatum)
            let vehicles = stopsToVehiclesMap.get(vehicleDatum.nextStop)
            if(vehicles===null || typeof vehicles === "undefined"){
                vehicles = []
                stopsToVehiclesMap.set(vehicleDatum.nextStop,vehicles)
            }
            vehicles.push(vehicleDatum)
            vehicles = stopsToExtendedVehiclesMap.get(vehicleDatum.nextStop)
            if(vehicles===null || typeof vehicles === "undefined"){
                vehicles = []
                stopsToExtendedVehiclesMap.set(vehicleDatum.nextStop,vehicles)
            }
            vehicles.push(vehicleDatum)
        };
        OBA.Util.log('siri stop processed vehicles')
    } else {
        OBA.Util.log('no '+keyword+' recieved. not processing '+keyword)
    }

    let serviceAlertActivity = siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
    serviceAlertActivity = serviceAlertActivity==null? null :serviceAlertActivity[0]?.Situations?.PtSituationElement
    console.log("siri stop service alerts found:", serviceAlertActivity)
    if (serviceAlertActivity != null) {
        update = true;
        console.log("siri stop service alerts found:", serviceAlertActivity)
        for (let i = 0; i < serviceAlertActivity.length; i++) {
            let situationElement = serviceAlertActivity[i]
            console.log("siri stop processing service alert:", situationElement)
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
                console.log("siri stop adding service alert: ",serviceAlertTarget,alerts)
                serviceAlertDataMap.set(serviceAlertTarget,alerts)
                serviceAlertTarget = effect?.LineRef + delim + effect?.DirectionRef
                alerts = serviceAlertDataMap.get(serviceAlertTarget)
                alerts = alerts==null? [] : alerts
                alerts.push(createServiceAlertInterface(situationElement))
                console.log("adding service alert: ",serviceAlertTarget,alerts)
                serviceAlertDataMap.set(serviceAlertTarget,alerts)
            })
            console.log("siri stop processing service alert: ",situationElement)
        };
        console.log("siri stop maps made via siri: ",[vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap])
        OBA.Util.log('siri stop processed '+keyword)
    } else {
        OBA.Util.log('no '+keyword+' recieved. not processing '+keyword)
    }
    console.log("maps made via siri stop : ",[vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap,stopsToExtendedVehiclesMap])
    return [[stopId,vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap,stopsToExtendedVehiclesMap,lastCallTime],update]
}


function updateVehiclesState(updates,setState){

    let stateFunc = (prevState) => {
        let newState = {...prevState}
        newState.renderCounter = prevState.renderCounter + 1
        Object.entries(updates).forEach(([key, val]) => {newState[key]=val})
        return newState
    }
    setState(stateFunc);
}

const fetchAndProcessStopMonitoring = async ([stopId,targetAddress]) =>{
    console.log("searching for siri stop at: ",targetAddress)
    return fetch(targetAddress)
        .then((response) => response.json())
        .then((siri) => {
            OBA.Util.log("reading serviceAlert & vehicle from " + targetAddress)
            let processedData = extractData(stopId,siri)
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

const siriGetAndSetVehiclesForStopMonitoring = (targetAddresses,vehicleState, setState) =>{
    return siriGetAndSetVehicles(targetAddresses,vehicleState, setState,fetchAndProcessStopMonitoring)
}

const siriGetAndSetVehicles = (targetAddresses,vehicleState, setState, dataProcessFunction) =>
{
    let getData = async () => {
        console.log("siri stop seeks promises from ", targetAddresses)
        let returnedPromises = await Promise.all(targetAddresses.map(adr => dataProcessFunction(adr)))
        console.log("siri stop promises awaited ", returnedPromises)
        let dataObjsList = returnedPromises.filter(
            (result) => result !== null && typeof result !== "undefined")
            .map(
                ([stopId, vehicleDataList, serviceAlertDataList, stopsToVehicles,stopsToExtendedVehiclesMap, lastCallTime]) => {

                    // turn them into a list by route
                    // then get them into <state route&keyword-> <map stopIden -> vehicles>>
                    // not sure we'll stick with this, but it's fast and dirty because it needs to happen
                    // before backend support for timing
                    // todo: pls fix w/ proper backend support
                    console.log( stopsToExtendedVehiclesMap,stopId)
                    let dataObj = {}
                    Object.entries(stopsToExtendedVehiclesMap.get(stopId)).forEach(
                        ([key,siriObj]) => {
                            console.log(dataObj,key,siriObj)
                            let routeAndDir = siriObj.routeId +"_"+siriObj.direction
                            let mapOfStopsToVehicles = dataObj[routeAndDir +  stopSortedFutureVehicleDataIdentifier]
                            if(typeof mapOfStopsToVehicles === "undefined"){
                                mapOfStopsToVehicles = new Map()
                                dataObj[routeAndDir + stopSortedFutureVehicleDataIdentifier] = mapOfStopsToVehicles
                                dataObj[routeAndDir + updatedTimeIdentifier] = lastCallTime
                                mapOfStopsToVehicles.set(stopId,[siriObj])
                            } else {
                                mapOfStopsToVehicles.get(stopId).push(siriObj)
                            }
                        }
                    )
                    dataObj[stopId + stopSortedFutureVehicleDataIdentifier] = stopsToExtendedVehiclesMap
                    return dataObj
                })
        if (dataObjsList.length === 0) {
            return null
        }
        console.log("combining siri stop objs",dataObjsList)
        let siriCombinedDataObj = mergeSiri(dataObjsList)
        console.log("siri stop data found: ", siriCombinedDataObj)
        return siriCombinedDataObj

    }
    getData().then((processedData) => {
        console.log("siri stop data processedData", processedData)
        processedData != null ? updateVehiclesState(processedData, setState) : null
        console.log("siri stop  data state", vehicleState)
    }).catch((x) => console.log("siri stop call issue!", x))
}


export const siriGetVehiclesForStopViewEffect = (routeIdList, stopIdList, vehicleState, setState ) => {
    let baseTargetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOP_MONITORING_ENDPOINT
    console.log("looking for Siri Data for stops!",stopIdList)

    // let targetAddresses = getTargetList(routeIdList)
    let targetAddresses = []
    targetAddresses = [... stopIdList].map((stopId)=>{
        return [stopId,baseTargetAddress+ "&MonitoringRef=" + stopId.replace("+","%2B")
            + "&StopMonitoringDetailLevel=normal&MinimumStopVisitsPerLine=3"];
    })
    console.log("siri stop data target addresses ", targetAddresses)

    return siriGetAndSetVehiclesForStopMonitoring(targetAddresses,vehicleState,setState)
}
