import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import vehicleComponent from "../../components/map/vehicleComponent";
import {GlobalStateContext} from "../../components/util/globalState";
import queryString from "query-string";
import getDataEffect from "./getDataEffect";
import {vehicleData} from "./dataModels";
import mapVehicleComponent from "../../components/map/vehicleComponent";
import routeVehicleComponent from "../../components/views/routeVehicleComponent";

const siriEffect = (currentCard) => {

//
//     var keyword = "vehicle"
//     var stateProperties = ["vehicleObjs","mapVehicleComponents","routeVehicleComponents"]
//     let stateUpdateItems = [[],[],[]]
//     const lineRef = queryString.parse(location.search).LineRef;
//     let search = "&"+currentCard.queryIdentifier+"=" + lineRef;
//     var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search;
//
//     getDataEffect(currentCard,keyword,stateProperties,stateUpdateItems,targetAddress,
//         vehicleData, mapVehicleComponent,routeVehicleComponent,
//         (siri)=>{return siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity},
//         (objList,i)=>{return objList[i]})
// };
//
// export default siriEffect;



    function generateVehicleMarker(vehicleInfo,lineRef,log){
        const longLat = [];
        let mvj = vehicleInfo.MonitoredVehicleJourney
        let vc = vehicleComponent(new vehicleData(mvj))
        if (log) {
            OBA.Util.log('first vehicleComponent:')
            OBA.Util.log(vc)

        }

        return vc
    }


    function parseSiri (siri, [objs,mapComponents,routeComponents]){
        let newVehicleMarkers = [];
        OBA.Util.log(siri)
        let vehicles = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity
        let situations = siri?.Siri?.ServiceDelivery?.SituationExchangeDelivery
        OBA.Util.trace("vehicles found:")
        OBA.Util.trace(vehicles)
        if (vehicles != null && vehicles.length != 0) {
            update = true;
            let first = true;
            for (let i = 0; i < vehicles.length; i++) {
                let obj= new vehicleData(vehicles[i].MonitoredVehicleJourney)
                objs.push(obj)
                mapComponents.push(new mapVehicleComponent(obj))
                routeComponents.push(new routeVehicleComponent(obj))
                // newVehicleMarkers.push(generateVehicleMarker(vehicles[i]));
            };

            OBA.Util.log('processed vehicles')
        } else {
            OBA.Util.log('no vehicles recieved. not processing vehicles')
        }
        OBA.Util.log(keyword+" post process")
        OBA.Util.log(objs)
        OBA.Util.log(mapComponents)
        OBA.Util.log(routeComponents)
        return [objs,mapComponents,routeComponents]
    }


    var stateProperties = ["vehicleObjs","mapVehicleComponents","routeVehicleComponents"]
    function updateState([newObjs,newMapComps,newRouteComps]){

        OBA.Util.log("should update "+keyword+" state?")
        OBA.Util.log(update)
        if(update) {
            OBA.Util.log("adding to "+keyword+" state:")
            OBA.Util.log(newObjs)
            OBA.Util.log(newMapComps)
            OBA.Util.log(newRouteComps)
            let stateFunc = (prevState) => {
                prevState[stateProperties[0]]=newObjs
                prevState[stateProperties[1]]=newMapComps
                prevState[stateProperties[2]]=newRouteComps
                return prevState
            }
            setState(stateFunc);
        }
        OBA.Util.log("new "+keyword+" state")
        OBA.Util.log(state[stateProperties[0]])
        OBA.Util.log(state[stateProperties[1]])
        OBA.Util.log(state[stateProperties[2]])
    }



    const { state, setState } = useContext(GlobalStateContext);
    const lineRef = queryString.parse(location.search).LineRef;
    let search = "&"+currentCard.queryIdentifier+"=" + lineRef;
    var targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search;
    var update = false;
    var keyword = "vehicles"
    let stateUpdateItems = [[],[],[]]

    useEffect(() => {
        OBA.Util.log("reading siri from " + targetAddress)
        fetch(targetAddress)
            .then((response) => response.json())
            .then((parsed) => {
                // let [vehicles,situations, vehicleMarkers] = parseSiri(parsed,stateUpdateItems)
                updateState(parseSiri(parsed,stateUpdateItems))
            })
            .catch((error) => {
                console.error(error);
            });

    }, [setState]);
};

export default siriEffect;