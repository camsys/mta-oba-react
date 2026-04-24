import React from "react";
import {
    serviceAlertDataIdentifier,
    vehicleDataIdentifier,
    updatedTimeIdentifier,
    stopSortedDataIdentifier
} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";
import {createServiceAlertInterface, createVehicleRtInterface, VehicleRtInterface, ServiceAlertInterface, AgencyAndId, Card, VehicleStateObject, VehicleStateUpdateValue} from "./DataModels";
import {SiriWrapper, MonitoredVehicleJourneyActivity, PtSituationElement, AffectedVehicleJourney} from "./DataContracts";
import log from 'loglevel';
import {getSearchTermAdditions} from "./keyWordsAndSupportUtils"








function extractData (routeId: string, siri: SiriWrapper): [[string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined], boolean] {
    let update= false;
    log.info("extractData from Siri")
    let keyword = "serviceAlert & vehicle"
    let lastCallTime = siri?.siri?.Siri?.ServiceDelivery?.ResponseTimestamp
    let [vehicleDataMap,serviceAlertDataMap,stopsToVehiclesMap] = [new Map(), new Map(),new Map()]

    let vehicleActivity = siri?.siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery
    log.info(vehicleActivity)
    let vehicleActivityArray: MonitoredVehicleJourneyActivity[] | null | undefined = vehicleActivity!=null ? vehicleActivity[0]?.VehicleActivity : null
    log.info("siri vehicles found:",vehicleActivityArray)
    if (vehicleActivityArray != null && vehicleActivityArray.length != 0) {
        update = true;
        for (let i = 0; i < vehicleActivityArray.length; i++) {
            OBA.Util.trace("processing vehicle #" + i);
            let mvj = vehicleActivityArray[i].MonitoredVehicleJourney
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

    let serviceAlertActivity = siri?.siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
    let serviceAlertActivityArray: PtSituationElement[] | null | undefined = serviceAlertActivity==null? null :serviceAlertActivity[0]?.Situations?.PtSituationElement
    log.info("service alerts found:", serviceAlertActivityArray)
    if (serviceAlertActivityArray != null) {
        update = true;
        log.info("service alerts found:", serviceAlertActivityArray)
        for (let i = 0; i < serviceAlertActivityArray.length; i++) {
            let situationElement = serviceAlertActivityArray[i]
            log.info("processing service alert:", situationElement)
            let effects = situationElement.Affects.VehicleJourneys.AffectedVehicleJourney
            log.info(effects)
            const routesWithServiceAlerts = {}
            effects.forEach((effect: AffectedVehicleJourney) => {
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


function updateVehiclesState(updates: Record<string, Map<string, VehicleRtInterface | ServiceAlertInterface[]> | Map<string, VehicleRtInterface[]> | string | undefined>, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>) {
    log.info("adding updates to vehicleState:",updates)
    let stateFunc = (prevState: VehicleStateObject) => {
        let newState: VehicleStateObject = {...prevState}
        newState.renderCounter = prevState.renderCounter + 1
        Object.entries(updates).forEach(([key, val]: [string, VehicleStateUpdateValue]) => {(newState as unknown as Record<string, VehicleStateUpdateValue>)[key]=val})
        return newState
    }
    setState(stateFunc);
}

const fetchAndProcessVehicleMonitoring = async ([routeId, targetAddress]: [string, string]): Promise<[string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined] | null> => {
    log.info("searching for siri at: ",targetAddress)
    return fetch(targetAddress)
        .then((response: Response) => response.json())
        .then((siri: SiriWrapper) => {
            log.info("reading serviceAlert & vehicle from " + targetAddress)
            let processedData: [[string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined], boolean] = extractData(routeId,siri)
            let update = processedData[1]
            if(update){
                log.info("should update serviceAlert & vehicle state?",update)
                return processedData[0]
            }
            return null
        })
        .catch((error: Error) => {
            log.error("error processing Siri data",error);
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
                else if(combinedRoutes[routeInfoIdentifier] !==null && typeof combinedRoutes[routeInfoIdentifier] !=='undefined'){
                    (routeObj as Map<string, VehicleRtInterface | ServiceAlertInterface[]>).forEach((siriData: VehicleRtInterface | ServiceAlertInterface[], siriIdentifier: string) => {
                        (combinedRoutes[routeInfoIdentifier] as Map<string, VehicleRtInterface | ServiceAlertInterface[]>).set(siriIdentifier, siriData)}
                    )}
                else{combinedRoutes[routeInfoIdentifier] = routeObj}})
        return combinedRoutes
    })
}

const siriGetAndSetVehiclesForVehicleMonitoring = (targetAddresses: [string, string][], vehicleState: VehicleStateObject, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>): void => {
    siriGetAndSetVehicles(targetAddresses,vehicleState, setState,fetchAndProcessVehicleMonitoring)
}

const siriGetAndSetVehicles = (targetAddresses: [string, string][], vehicleState: VehicleStateObject, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>, dataProcessFunction: (adr: [string, string]) => Promise<[string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined] | null>): void =>
{
    let getData = async () => {
        log.info("siri seeks promises from ", targetAddresses)
        let returnedPromises = await Promise.all(targetAddresses.map((adr: [string, string]) => dataProcessFunction(adr)))
        log.info("siri promises awaited ", returnedPromises)
        let dataObjsList: Record<string, VehicleStateUpdateValue>[] = returnedPromises.filter(
            (result) => result !== null && typeof result !== "undefined")
            .map(
                ([routeId, vehicleDataList, serviceAlertDataList, stopsToVehicles, lastCallTime]: [string, Map<string, VehicleRtInterface>, Map<string, ServiceAlertInterface[]>, Map<string, VehicleRtInterface[]>, string | undefined]) => {
                    let dataObj: Record<string, VehicleStateUpdateValue> = {}
                    dataObj[routeId + serviceAlertDataIdentifier] = serviceAlertDataList
                    dataObj[routeId + vehicleDataIdentifier] = vehicleDataList
                    dataObj[routeId + updatedTimeIdentifier] = lastCallTime
                    dataObj[routeId + stopSortedDataIdentifier] = stopsToVehicles
                    return dataObj
                })
        if (dataObjsList.length === 0) {
            return null;
        }
        log.info("combining siri objs",dataObjsList)
        let siriCombinedDataObj = mergeSiri(dataObjsList)
        log.info("siri data found: ", siriCombinedDataObj)
        return siriCombinedDataObj

    }
    getData().then((processedData: Record<string, VehicleStateUpdateValue> | null) => {
        log.info("processedData", processedData)
        processedData != null ? updateVehiclesState(processedData, setState) : null
        log.info("vehicleState", vehicleState)
    }).catch((x: Error) => log.info("siri call issue!", x))
}

const getTargetList = (routeIdList: Set<AgencyAndId>, currentCard: Card): [string, string][] => {
    let baseTargetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT

    return [...routeIdList].map((routeId: AgencyAndId) => {
        let operatorRef = routeId.agency.replace(" ","+");
        const lineRef = routeId.id;
        return [lineRef,baseTargetAddress+"OperatorRef=" +operatorRef + "&LineRef"+"=" + routeId.id.replace("-SBS","%2B") +getSearchTermAdditions(currentCard)];
    })
}

export const siriGetVehiclesForVehicleViewEffect = (currentCard: Card, vehicleState: VehicleStateObject, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>): void => {
    let routeIdList = currentCard.routeIdList
    let vehicleId = currentCard.vehicleId
    log.info("looking for Siri Data for vehicle!",routeIdList,vehicleId)
    let targetAddresses = getTargetList(routeIdList,currentCard)

    if(targetAddresses.length!==1){
        log.error("a very odd situation has occured and should be reported in siriGetVehiclesForVehicleViewEffect",routeIdList,vehicleId,vehicleState,setState)
    }
    targetAddresses = targetAddresses.concat(targetAddresses.map((adr: [string, string]) => {
        return [adr[0],adr[1]+`&VehicleRef=${vehicleId?.split('_')[1]}&MaximumNumberOfCallsOnwards=50&VehicleMonitoringDetailLevel=calls`]}))

    return siriGetAndSetVehiclesForVehicleMonitoring(targetAddresses,vehicleState,setState)
}

export const siriGetVehiclesForRoutesEffect = (currentCard: Card, vehicleState: VehicleStateObject, setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>): void => {
    let routeIdList = currentCard.routeIdList
    log.info("looking for Siri Data!",routeIdList)
    let targetAddresses = getTargetList(routeIdList, currentCard)
    return siriGetAndSetVehiclesForVehicleMonitoring(targetAddresses,vehicleState,setState)
};
