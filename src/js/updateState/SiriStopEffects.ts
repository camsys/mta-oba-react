import React from "react";
import {createServiceAlertInterface, createVehicleRtInterface, VehicleRtInterface, ServiceAlertInterface, VehicleStateObject, VehicleStateUpdateValue, Card} from "./DataModels";
import {SiriWrapper, SiriMonitoredStopVisitActivity, SiriPtSituationElement, SiriAffectedVehicleJourney} from "./DataContracts";
import {
    updatedTimeIdentifier,stopSortedFutureVehicleDataIdentifier
} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";
import log from 'loglevel';
import {getSearchTermAdditions} from "./keyWordsAndSupportUtils"







function extractData (stopId: string, siri: SiriWrapper): [[string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined], boolean] {
    let update= false;
    log.info("extractData for siri stop ",stopId,siri)
    let keyword = "serviceAlert & vehicle"
    const siriData = siri?.siri
    let lastCallTime = siriData?.Siri?.ServiceDelivery?.ResponseTimestamp
    log.info("siri stop lastCallTime",lastCallTime)
    let [vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap,stopsToExtendedVehiclesMap] =
        [new Map(), new Map(),new Map(),new Map()]

    let stopActivity = siriData?.Siri?.ServiceDelivery?.StopMonitoringDelivery
    log.info("siri stop activity",stopActivity)
    let stopActivityArray: SiriMonitoredStopVisitActivity[] | null | undefined = stopActivity!=null ? stopActivity[0]?.MonitoredStopVisit : null
    log.info("siri stop vehicles found:",stopActivityArray)
    if (stopActivityArray != null && stopActivityArray.length != 0) {
        update = true;
        for (let i = 0; i < stopActivityArray.length; i++) {
            OBA.Util.trace("siri stop processing vehicle #" + i);
            let mvj = stopActivityArray[i].MonitoredVehicleJourney
            let tripLevelIsDetour = stopActivityArray[i].Extensions?.IsDetour
            let vehicleDatum = createVehicleRtInterface(mvj, OBA.Util.ISO8601StringToDate(lastCallTime), tripLevelIsDetour)
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
        log.info('siri stop processed vehicles')
    } else {
        log.info('no '+keyword+' recieved. not processing '+keyword)
    }

    let serviceAlertActivity = siriData?.Siri?.ServiceDelivery?.SituationExchangeDelivery
    let serviceAlertActivityArray: SiriPtSituationElement[] | null | undefined = serviceAlertActivity==null? null :serviceAlertActivity[0]?.Situations?.PtSituationElement
    log.info("siri stop service alerts found:", serviceAlertActivityArray)
    if (serviceAlertActivityArray != null) {
        update = true;
        log.info("siri stop service alerts found:", serviceAlertActivityArray)
        for (let i = 0; i < serviceAlertActivityArray.length; i++) {
            let situationElement = serviceAlertActivityArray[i]
            // log.info("siri stop processing service alert:", situationElement)
            let effects = situationElement.Affects.VehicleJourneys.AffectedVehicleJourney
            log.info(effects)
            const routesWithServiceAlerts = {}
            effects.forEach((effect: SiriAffectedVehicleJourney) => {
                let delim = "_"
                // todo: externalize target for ease of reference & to easily generate multiple target types
                let serviceAlertTarget = effect?.LineRef
                let alerts
                alerts = serviceAlertDataMap.get(serviceAlertTarget)
                alerts = alerts==null? [] : alerts
                alerts.push(createServiceAlertInterface(situationElement))
                // log.info("siri stop adding service alert: ",serviceAlertTarget,alerts)
                serviceAlertDataMap.set(serviceAlertTarget,alerts)
                serviceAlertTarget = effect?.LineRef + delim + effect?.DirectionRef
                alerts = serviceAlertDataMap.get(serviceAlertTarget)
                alerts = alerts==null? [] : alerts
                alerts.push(createServiceAlertInterface(situationElement))
                // log.info("adding service alert: ",serviceAlertTarget,alerts)
                serviceAlertDataMap.set(serviceAlertTarget,alerts)
            })
            log.info("siri stop processing service alert: ",situationElement)
        };
        log.info("siri stop maps made via siri: ",[vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap])
        log.info('siri stop processed '+keyword)
    } else {
        log.info('no '+keyword+' recieved. not processing '+keyword)
    }
    log.info("maps made via siri stop : ",[vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap,stopsToExtendedVehiclesMap])
    return [[stopId,vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap,stopsToExtendedVehiclesMap,lastCallTime],update]
}


function updateVehiclesState(updates: Record<string, VehicleStateUpdateValue>, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>) {

    let stateFunc = (prevState: VehicleStateObject) => {
        let newState: VehicleStateObject = {...prevState}
        newState.renderCounter = prevState.renderCounter + 1
        Object.entries(updates).forEach(([key, val]: [string, VehicleStateUpdateValue]) => {(newState as unknown as Record<string, VehicleStateUpdateValue>)[key]=val})
        return newState
    }
    setState(stateFunc);
}

const fetchAndProcessStopMonitoring = async ([stopId, targetAddress]: [string, string]): Promise<[string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined] | null> => {
    if(process.env.SIRI_OVERRIDE_STOP){
        targetAddress = process.env.SIRI_OVERRIDE_STOP
    }
    log.info("searching for siri stop at: ",targetAddress)
    return fetch(targetAddress)
        .then((response: Response) => response.json())
        .then((siri: SiriWrapper) => {
            log.info("reading serviceAlert & vehicle for stop from " + targetAddress)
            let processedData: [[string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined], boolean] = extractData(stopId,siri)
            let update = processedData[1]
            if(update){
                log.info("should update stop serviceAlert & vehicle state?",update)
                return processedData[0]
            }
            return null
        })
        .catch((error: Error) => {
            log.error(error);
            return null
        });


}

const mergeSiri = (dataObjsList: Record<string, VehicleStateUpdateValue>[]): Record<string, VehicleStateUpdateValue> => {
    return dataObjsList.reduce((combinedRoutes: Record<string, VehicleStateUpdateValue>, vehiclesForRouteObj: Record<string, VehicleStateUpdateValue>) => {
        Object.entries(vehiclesForRouteObj).forEach(
            ([routeInfoIdentifier, routeObj]: [string, VehicleStateUpdateValue]) => {
                if(routeInfoIdentifier.includes(updatedTimeIdentifier)){
                    combinedRoutes[routeInfoIdentifier] = routeObj
                }
                else if(combinedRoutes[routeInfoIdentifier] !==null && combinedRoutes[routeInfoIdentifier] !==undefined
                    && routeObj !==null && routeObj !==undefined && typeof routeObj === "object"
                ){
                    (routeObj as Map<string, VehicleRtInterface | ServiceAlertInterface[]>).forEach((siriData: VehicleRtInterface | ServiceAlertInterface[], siriIdentifier: string) => {
                        (combinedRoutes[routeInfoIdentifier] as Map<string, VehicleRtInterface | ServiceAlertInterface[]>).set(siriIdentifier, siriData)}
                    )}
                else{combinedRoutes[routeInfoIdentifier] = routeObj}})
        return combinedRoutes
    })
}

const siriGetAndSetVehiclesForStopMonitoring = (targetAddresses: [string, string][], vehicleState: VehicleStateObject, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>): void => {
    return siriGetAndSetVehicles(targetAddresses,vehicleState, setState,fetchAndProcessStopMonitoring)
}

const siriGetAndSetVehicles = (targetAddresses: [string, string][], vehicleState: VehicleStateObject, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>, dataProcessFunction: (adr: [string, string]) => Promise<[string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined] | null>): void =>
{
    let getData = async () => {
        log.info("siri stop seeks promises from ", targetAddresses)
        let returnedPromises = await Promise.all(targetAddresses.map((adr: [string, string]) => dataProcessFunction(adr)))
        log.info("siri stop promises recieved ", returnedPromises)
        type ProcessedStopData = [string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined];
        let dataObjsList: ProcessedStopData[] = returnedPromises.filter(
            (result) => result !== null && typeof result !== "undefined" && result!==undefined) as ProcessedStopData[]
        log.info("siri stop promises filtered",dataObjsList)
        let processedDataObjs: Record<string, VehicleStateUpdateValue>[] = dataObjsList.map(
                ([stopId, vehicleDataList, serviceAlertDataList, stopsToVehicles, stopsToExtendedVehiclesMap, lastCallTime]: [string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined]) => {
                 log.info("siri stop data found: ", vehicleDataList, serviceAlertDataList, stopsToVehicles,stopsToExtendedVehiclesMap)
                // turn them into a list by route
                // then get them into <state route&keyword-> <map stopIden -> vehicles>>
                // not sure we'll stick with this, but it's fast and dirty because it needs to happen
                // before backend support for timing
                // todo: pls fix w/ proper backend support
                let dataObj: Record<string, VehicleStateUpdateValue> = {}
                if(stopsToExtendedVehiclesMap.get(stopId) !== null &&  stopsToExtendedVehiclesMap.get(stopId) !== undefined){
                    log.info("siri stop data found: ", stopsToExtendedVehiclesMap.get(stopId))
                    Object.entries((stopsToExtendedVehiclesMap.get(stopId) as unknown as Record<string, VehicleRtInterface>)).forEach(
                        ([key, siriObj]: [string, VehicleRtInterface]) => {
                            let routeAndDir = siriObj.routeId +"_"+siriObj.direction
                            let mapOfStopsToVehicles = dataObj[routeAndDir +  stopSortedFutureVehicleDataIdentifier] as Map<string, VehicleRtInterface[]> | undefined
                            if(typeof mapOfStopsToVehicles === "undefined"){
                                mapOfStopsToVehicles = new Map<string, VehicleRtInterface[]>()
                                dataObj[routeAndDir + stopSortedFutureVehicleDataIdentifier] = mapOfStopsToVehicles
                                dataObj[routeAndDir + updatedTimeIdentifier] = lastCallTime
                                mapOfStopsToVehicles.set(stopId,[siriObj])
                            } else {
                                (mapOfStopsToVehicles as Map<string, VehicleRtInterface[]>).get(stopId)!.push(siriObj)
                            }
                        }
                    )
                    dataObj[stopId + stopSortedFutureVehicleDataIdentifier] = stopsToExtendedVehiclesMap
                }
                return dataObj
            })
        if (processedDataObjs.length === 0) {
            return null
        }
        log.info("combining siri stop objs",processedDataObjs)
        let siriCombinedDataObj = mergeSiri(processedDataObjs)
        log.info("siri stop data found: ", siriCombinedDataObj)
        return siriCombinedDataObj

    }
    getData().then((processedData: Record<string, VehicleStateUpdateValue> | null) => {
        log.info("siri stop data processedData", processedData)
        processedData != null ? updateVehiclesState(processedData, setState) : null
        log.info("siri stop  data state", vehicleState)
    }).catch((x: Error) => log.info("siri stop call issue!", x))
}


export const siriGetVehiclesForStopViewEffect = (currentCard: Card, vehicleState: VehicleStateObject, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>): void => {
    let stopIdList = currentCard.stopIdList
    let baseTargetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.STOP_MONITORING_ENDPOINT
    // let baseTargetAddress = "https://" + process.env.ENV_ADDRESS + ""
    log.info("looking for Siri Data for stops!",stopIdList)

    let targetAddresses: [string, string][] = []
    targetAddresses = [... stopIdList].map((stopId: string) => {
        return [stopId,baseTargetAddress+ "stopId=" + stopId.replace("+","%2B")+getSearchTermAdditions(currentCard)]
    })
    log.info("siri stop data target addresses ", targetAddresses)

    return siriGetAndSetVehiclesForStopMonitoring(targetAddresses,vehicleState,setState)
}
