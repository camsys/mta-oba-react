import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import vehicleComponent from "../../components/map/vehicleComponent";
import {GlobalStateContext} from "../../components/util/globalState";
import queryString from "query-string";
import getDataEffect from "./getDataEffect";
import {serviceAlertData, stopData, vehicleData} from "./dataModels";
import mapVehicleComponent from "../../components/map/vehicleComponent";
import routeVehicleComponent from "../../components/views/routeVehicleComponent";
import {classList, classWrap, dataSpecifiers, pathRouting} from "./dataEffectsSupport";
import mapStopComponent from "../../components/map/mapStopComponent";
import routeStopComponent from "../../components/views/routeStopComponent";
import serviceAlertComponent from "../../components/views/serviceAlertComponent";

const siriEffect = (currentCard) => {


    var keyword = "vehicle"
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "&"+currentCard.queryIdentifier+"=" + lineRef;
    var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search;


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



    getDataEffect(currentCard,targetAddress,[vehicleSpecifiers,serviceAlertSpecifiers])
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
//     const { state, setState } = useContext(GlobalStateContext);
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