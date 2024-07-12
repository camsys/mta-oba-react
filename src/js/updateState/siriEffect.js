import React, {useContext, useEffect, useState} from "react";
import queryString from "query-string";
import getDataEffect from "./getDataEffect";
import {serviceAlertData, stopData, vehicleData} from "./dataModels";
import mapVehicleComponent from "../../components/map/vehicleComponent";
import routeVehicleComponent from "../../components/views/routeVehicleComponent";
import {classList, classWrap, dataSpecifiers, pathRouting} from "./dataEffectsSupport";
import serviceAlertComponent from "../../components/views/serviceAlertComponent";
import {VehicleStateContext} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";


const getDataFromSiri = (targetAddress,
                       dataSpecifiersList) => {

    const { state, setState } = useContext(VehicleStateContext);
    var update = false

    function extractData (parsed,dataSpecifiers){
        let listParser = dataSpecifiers.pathRouting.pathToList
        let indivParser = dataSpecifiers.pathRouting.pathToIndividual
        let classList = dataSpecifiers.classList
        let jsonList = listParser(parsed)
        OBA.Util.log(dataSpecifiers.keyword+" found:")
        OBA.Util.log(jsonList)
        if (jsonList != null && jsonList.length != 0) {
            update = true;
            for (let i = 0; i < jsonList.length; i++) {
                OBA.Util.trace("processing "+dataSpecifiers.keyword+"#" + i);
                let obj= new classList.dataClass(indivParser(jsonList,i))
                classList.dataContainer.push(obj)
                classList.otherClasses.forEach((c)=>{
                    c.container.push(new c.targetClass(obj, i))
                })
                // mapComponents.push(new dataSpecifiers.classList.mapComponentClass(obj))
                // routeComponents.push(new dataSpecifiers.classList.routeComponentClass(obj, i))
            };

            OBA.Util.log('processed '+dataSpecifiers.keyword)
        } else {
            OBA.Util.log('no '+dataSpecifiers.keyword+' recieved. not processing '+dataSpecifiers.keyword)
        }
        OBA.Util.log(dataSpecifiers.keyword+" post process")
        return dataSpecifiers
    }

    function updateState(dataSpecifiers){
        let classList = dataSpecifiers.classList
        OBA.Util.log("should update "+dataSpecifiers.keyword+" state?")
        OBA.Util.log(update)
        if(update) {
            OBA.Util.log("adding to "+dataSpecifiers.keyword+" state:")
            let capitalkeyword = dataSpecifiers.keyword.substring(0, 1).toUpperCase() + dataSpecifiers.keyword.substring(1);
            let stateFunc = (prevState) => {
                let newState = {...prevState}
                newState[dataSpecifiers.keyword+"Data"] = classList.dataContainer
                classList.otherClasses.forEach((c)=>{
                    newState[c.identifier + capitalkeyword + "Components"] = c.container
                })
                return newState
            }
            setState(stateFunc);
        }
        OBA.Util.log("new "+dataSpecifiers.keyword+" state")

    }





    useEffect(() => {
        if(targetAddress==null){
            return
        }
        fetch(targetAddress)
            .then((response) => response.json())
            .then((parsed) => {
                console.log(dataSpecifiersList)
                dataSpecifiersList.forEach((dataSpecifiers)=>{
                    console.log(dataSpecifiers)
                    console.log(dataSpecifiers.keyword)
                    OBA.Util.log("reading "+dataSpecifiers.keyword+" from " + targetAddress)
                    updateState(extractData(parsed,dataSpecifiers))
                })
            })
            .catch((error) => {
                console.error(error);
            });

    }, []);
};


const siriEffect = (routeId) => {


    var keyword = "vehicle"
    const lineRef = routeId;
    let search = "&LineRef"+"=" + lineRef;
    let targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search
    targetAddress = lineRef==null?null:targetAddress

    let vehicleSpecifiers = new dataSpecifiers("vehicle",
        new classList(vehicleData,
            [new classWrap(mapVehicleComponent,"map"),
            new classWrap(routeVehicleComponent,"route")]),
        new pathRouting((siri)=>{return siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity},
            (objList,i)=>{return objList[i].MonitoredVehicleJourney}))
    let serviceAlertSpecifiers = new dataSpecifiers("serviceAlert",
        new classList(serviceAlertData,
            [new classWrap(serviceAlertComponent,"sidebar")]),
        new pathRouting((siri)=>{return siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity},
            (objList,i)=>{return objList[i].MonitoredVehicleJourney}))



    getDataFromSiri(targetAddress,[vehicleSpecifiers,serviceAlertSpecifiers])
};

export default siriEffect;
//
//
//
//     function generateVehicleMarker(vehicleInfo,lineRef,log){
//         const longLat = [];
//         let mvj = vehicleInfo.MonitoredVehicleJourney
//         let vc = vehicleComponent(new vehicleData(mvj))
//         if (log) {
//             OBA.Util.log('first vehicleComponent:')
//             OBA.Util.log(vc)
//
//         }
//
//         return vc
//     }
//
//
//     function parseSiri (siri, [objs,mapComponents,routeComponents]){
//         let newVehicleMarkers = [];
//         OBA.Util.log(siri)
//         let vehicles = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity
//         let situations = siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
//         OBA.Util.trace("vehicles found:")
//         OBA.Util.trace(vehicles)
//         if (vehicles != null && vehicles.length != 0) {
//             update = true;
//             let first = true;
//             for (let i = 0; i < vehicles.length; i++) {
//                 let obj= new vehicleData(vehicles[i].MonitoredVehicleJourney)
//                 objs.push(obj)
//                 mapComponents.push(new mapVehicleComponent(obj))
//                 routeComponents.push(new routeVehicleComponent(obj))
//                 // newVehicleMarkers.push(generateVehicleMarker(vehicles[i]));
//             };
//
//             OBA.Util.log('processed vehicles')
//         } else {
//             OBA.Util.log('no vehicles recieved. not processing vehicles')
//         }
//         OBA.Util.log(keyword+" post process")
//         OBA.Util.log(objs)
//         OBA.Util.log(mapComponents)
//         OBA.Util.log(routeComponents)
//         return [objs,mapComponents,routeComponents]
//     }
//
//
//     var stateProperties = ["vehicleObjs","mapVehicleComponents","routeVehicleComponents"]
//     function updateState([newObjs,newMapComps,newRouteComps]){
//
//         OBA.Util.log("should update "+keyword+" state?")
//         OBA.Util.log(update)
//         if(update) {
//             OBA.Util.log("adding to "+keyword+" state:")
//             OBA.Util.log(newObjs)
//             OBA.Util.log(newMapComps)
//             OBA.Util.log(newRouteComps)
//             let stateFunc = (prevState) => {
//                 console.log(prevState)
//                 let newState = {...prevState}
//                 console.log(newState)
//                 newState[stateProperties[0]]=newObjs
//                 newState[stateProperties[1]]=newMapComps
//                 newState[stateProperties[2]]=newRouteComps
//                 console.log(newState)
//                 return newState
//             }
//             setState((prevState)=>({
//                 ...prevState,
//                 vehicleObjs:newObjs,
//                 mapVehicleComponents:newMapComps,
//                 newRouteComps:newRouteComps
//             }));
//             console.log("routeComponents:",state.routeComponents)
//         }
//         OBA.Util.log("new "+keyword+" state")
//         OBA.Util.log(state[stateProperties[0]])
//         OBA.Util.log(state[stateProperties[1]])
//         OBA.Util.log(state[stateProperties[2]])
//     }
//
//
//     var logState = function () {
//         OBA.Util.log("logging state")
//         OBA.Util.log("new "+keyword+" state")
//         OBA.Util.log(state[stateProperties[0]])
//         OBA.Util.log(state[stateProperties[1]])
//         OBA.Util.log(state[stateProperties[2]])
//     }
//
//
//     const { state, setState } = useContext(CardStateContext);
//     const lineRef = queryString.parse(location.search).LineRef;
//     let search = "&"+currentCard.queryIdentifier+"=" + lineRef;
//     var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search;
//     var update = false;
//     var keyword = "vehicles"
//     let stateUpdateItems = [[],[],[]]
//
//     useEffect(() => {
//         OBA.Util.log("reading siri from " + targetAddress)
//         fetch(targetAddress)
//             .then((response) => response.json())
//             .then((parsed) => {
//                 // let [vehicles,situations, vehicleMarkers] = parseSiri(parsed,stateUpdateItems)
//                 updateState(parseSiri(parsed,stateUpdateItems))
//             })
//             .catch((error) => {
//                 console.error(error);
//             });
//
//     }, []);
// };
//
// export default siriEffect;