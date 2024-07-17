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
import {VehicleCardContentComponent} from "../../components/views/VehicleCard";





const siriEffect = (routeId) => {
    let operatorRef = routeId.split("_")[0].replace(" ","+");
    const lineRef = routeId.split("_")[1];


    function extractData (siri){
        console.log("extractData")
        dataSpecifiers.keyword = "serviceAlert & vehicle"
        let classList = dataSpecifiers.classList
        let vehicleActivity = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity
        OBA.Util.log(dataSpecifiers.keyword+" found:")
        OBA.Util.log(vehicleActivity)

        let [vehicleDataList,serviceAlertDataList,serviceAlertComponents,mapVehicleComponents,routeVehicleComponents] = [[],[],[],[],[]]
        console.log([vehicleDataList,serviceAlertDataList,serviceAlertComponents,mapVehicleComponents,routeVehicleComponents])
        if (vehicleActivity != null && vehicleActivity.length != 0) {
            update = true;
            for (let i = 0; i < vehicleActivity.length; i++) {
                OBA.Util.trace("processing "+dataSpecifiers.keyword+"#" + i);
                // let obj= new classList.dataClass(indivParser(jsonList,i))
                let mvj = vehicleActivity[i].MonitoredVehicleJourney
                vehicleDataList.push(new vehicleData(mvj))
                serviceAlertDataList.push(new serviceAlertData(mvj))
                serviceAlertComponents.push(new serviceAlertComponent(new serviceAlertData(mvj)))
                mapVehicleComponents.push(new mapVehicleComponent(new vehicleData(mvj)))
                routeVehicleComponents.push(new routeVehicleComponent(new vehicleData(mvj)))
            };
            console.log([vehicleDataList,serviceAlertDataList,serviceAlertComponents,mapVehicleComponents,routeVehicleComponents])
            OBA.Util.log('processed '+dataSpecifiers.keyword)
        } else {
            OBA.Util.log('no '+dataSpecifiers.keyword+' recieved. not processing '+dataSpecifiers.keyword)
        }
        OBA.Util.log(dataSpecifiers.keyword+" post process")
        return [vehicleDataList,serviceAlertDataList,serviceAlertComponents,mapVehicleComponents,routeVehicleComponents]
    }


    function updateState([vehicleDataList,serviceAlertDataList,serviceAlertComponents,mapVehicleComponents,routeVehicleComponents]){
        // let classList = dataSpecifiers.classList
        console.log("should update serviceAlert & vehicle state?",update)
        if(update) {
            console.log("adding to serviceAlert & vehicle state:",[vehicleDataList,serviceAlertDataList,serviceAlertComponents,mapVehicleComponents,routeVehicleComponents])
            // let capitalkeyword = dataSpecifiers.keyword.substring(0, 1).toUpperCase() + dataSpecifiers.keyword.substring(1);
            let stateFunc = (prevState) => {
                let newState = {...prevState}
                newState[lineRef+"_serviceAlertData"] = vehicleData
                newState[lineRef+"_vehicleAlertData"] = serviceAlertData
                newState[lineRef+"_serviceAlertComponents"]=serviceAlertComponents
                newState[lineRef+"_mapVehicleComponents"]=mapVehicleComponents
                newState[lineRef+"_routeVehicleComponents"]=routeVehicleComponents
                return newState
            }
            setState(stateFunc);
        }
        console.log("new serviceAlert & vehicle state",state)

    }




    var keyword = "vehicle"


    let search = "&OperatorRef=" +operatorRef + "&LineRef"+"=" + lineRef.replace("+","%2B");
    let targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search
    console.log("searching for siri at: ",targetAddress)
    targetAddress = lineRef==null?null:targetAddress

    let vehicleSpecifiers = new dataSpecifiers("vehicle",
        new classList(vehicleData,
            [new classWrap(mapVehicleComponent,lineRef+"_map"),
                new classWrap(routeVehicleComponent,lineRef+"_route")
                // new classWrap(VehicleCardContentComponent,lineRef+"_vehicle")
            ]),
        new pathRouting((siri)=>{return siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity},
            (objList,i)=>{return objList[i].MonitoredVehicleJourney}))
    let serviceAlertSpecifiers = new dataSpecifiers("serviceAlert",
        new classList(serviceAlertData,
            [new classWrap(serviceAlertComponent,lineRef+"_sidebar")]),
        new pathRouting((siri)=>{return siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity},
            (objList,i)=>{return objList[i].MonitoredVehicleJourney}))

    const dataSpecifiersList = [vehicleSpecifiers,serviceAlertSpecifiers]
    const { setState } = useContext(VehicleStateContext);
    var update = false



    useEffect(() => {
        if(targetAddress==null){
            return
        }
        fetch(targetAddress)
            .then((response) => response.json())
            .then((siri) => {
                OBA.Util.log("reading serviceAlert & vehicle from " + targetAddress)
                updateState(extractData(siri))
                // extractData(siri)

            })
            .catch((error) => {
                console.error(error);
            });

    }, []);
};

export default siriEffect;
