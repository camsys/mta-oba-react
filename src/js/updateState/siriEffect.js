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





const siriEffect = (routeId) => {


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




    var keyword = "vehicle"

    let operatorRef = routeId.split("_")[0].replace(" ","+");
    const lineRef = routeId.split("_")[1];
    let search = "&OperatorRef=" +operatorRef + "&LineRef"+"=" + lineRef.replace("+","%2B");
    let targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search
    console.log("searching for siri at: ",targetAddress)
    targetAddress = lineRef==null?null:targetAddress

    let vehicleSpecifiers = new dataSpecifiers("vehicle",
        new classList(vehicleData,
            [new classWrap(mapVehicleComponent,lineRef+"_map"),
                new classWrap(routeVehicleComponent,lineRef+"_route")]),
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

export default siriEffect;
