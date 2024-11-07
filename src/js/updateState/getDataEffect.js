import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import {VehicleStateContext} from "../../components/util/VehicleStateComponent";
import log from 'loglevel';

const getDataEffect = (currentCard, targetAddress,
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
                log.info(dataSpecifiersList)
                dataSpecifiersList.forEach((dataSpecifiers)=>{
                    log.info(dataSpecifiers)
                    log.info(dataSpecifiers.keyword)
                    OBA.Util.log("reading "+dataSpecifiers.keyword+" from " + targetAddress)
                    updateState(extractData(parsed,dataSpecifiers))
                })
            })
            .catch((error) => {
                console.error(error);
            });

    }, []);
};

export default getDataEffect;