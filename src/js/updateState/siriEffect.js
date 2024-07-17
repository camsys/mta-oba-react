import React, {useContext, useEffect, useState} from "react";
import {serviceAlertData, vehicleData} from "./dataModels";
import {
    serviceAlertDataIdentifier,
    vehicleDataIdentifier,
    VehicleStateContext
} from "../../components/util/VehicleStateComponent";
import {OBA} from "../oba";





const siriEffect = (routeId) => {
    let operatorRef = routeId.split("_")[0].replace(" ","+");
    const lineRef = routeId.split("_")[1];


    function extractData (siri){
        console.log("extractData")
        let keyword = "serviceAlert & vehicle"
        let vehicleActivity = siri?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery[0]?.VehicleActivity
        OBA.Util.log(keyword+" found:")
        OBA.Util.log(vehicleActivity)

        let [vehicleDataList,serviceAlertDataList] = [[],[]]
        console.log([vehicleDataList,serviceAlertDataList])
        if (vehicleActivity != null && vehicleActivity.length != 0) {
            update = true;
            for (let i = 0; i < vehicleActivity.length; i++) {
                OBA.Util.trace("processing "+keyword+"#" + i);
                // let obj= new classList.dataClass(indivParser(jsonList,i))
                let mvj = vehicleActivity[i].MonitoredVehicleJourney
                vehicleDataList.push(new vehicleData(mvj))
                serviceAlertDataList.push(new serviceAlertData(mvj))
            };
            console.log([vehicleDataList,serviceAlertDataList])
            OBA.Util.log('processed '+keyword)
        } else {
            OBA.Util.log('no '+keyword+' recieved. not processing '+keyword)
        }
        OBA.Util.log(keyword+" post process")
        return [vehicleDataList,serviceAlertDataList]
    }


    function updateState([vehicleDataList,serviceAlertDataList]){
        console.log("should update serviceAlert & vehicle state?",update)
        if(update) {
            console.log("adding to serviceAlert & vehicle state:",[vehicleDataList,serviceAlertDataList])
            let stateFunc = (prevState) => {
                let newState = {...prevState}
                newState.renderCounter = prevState.renderCounter + 1
                newState[lineRef+serviceAlertDataIdentifier] = serviceAlertDataList
                newState[lineRef+vehicleDataIdentifier] = vehicleDataList
                return newState
            }
            setState(stateFunc);
        }
        console.log("new serviceAlert & vehicle state",vehicleState)

    }





    let search = "&OperatorRef=" +operatorRef + "&LineRef"+"=" + lineRef.replace("+","%2B");
    let targetAddress = "https://" + process.env.ENV_ADDRESS + "/" + process.env.VEHICLE_MONITORING_ENDPOINT + search
    console.log("searching for siri at: ",targetAddress)
    targetAddress = lineRef==null?null:targetAddress
    const {vehicleState, setState } = useContext(VehicleStateContext);
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
            })
            .catch((error) => {
                console.error(error);
            });

    }, []);
};

export default siriEffect;
