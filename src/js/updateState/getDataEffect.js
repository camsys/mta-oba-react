import React, {useContext, useEffect, useState} from "react";
import {OBA} from "../oba";
import {GlobalStateContext} from "../../components/util/globalState";
import queryString from "query-string";
import routeStopComponent from "../../components/views/routeStopComponent";
import mapStopComponent from "../../components/map/mapStopComponent";
import {stopData} from "./dataModels"

const getDataEffect = (currentCard, keyword, stateProperties,stateUpdateItems,targetAddress,
                       mapComponentClass,routeComponentClass) => {
    const { state, setState } = useContext(GlobalStateContext);
    var keyword = keyword
    var stateProperties = stateProperties
    var update = false

    function extractData (parsed,[objs,mapComponents,routeComponents]){
        let jsonList = parsed?.stops
        OBA.Util.log(keyword+" found:")
        OBA.Util.log(jsonList)
        if (jsonList != null && jsonList.length != 0) {
            update = true;
            for (let i = 0; i < jsonList.length; i++) {
                OBA.Util.log("processing "+keyword+"#" + i+ ": " +jsonList[i].name);
                let obj= new stopData(jsonList[i])
                objs.push(obj)
                mapComponents.push(new mapStopComponent(obj))
                routeComponents.push(new routeStopComponent(obj, i))
            };

            OBA.Util.log('processed '+keyword)
        } else {
            OBA.Util.log('no '+keyword+' recieved. not processing '+keyword)
        }
        OBA.Util.log(keyword+" post process")
        OBA.Util.log(objs)
        OBA.Util.log(mapComponents)
        OBA.Util.log(routeComponents)
        return [objs,mapComponents,routeComponents]
    }

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





    useEffect(() => {
        OBA.Util.log("reading "+keyword+" from " + targetAddress)
        fetch(targetAddress)
            .then((response) => response.json())
            .then((parsed) => {
                updateState(extractData(parsed,stateUpdateItems))
            })
            .catch((error) => {
                console.error(error);
            });

    }, [setState]);
};

export default getDataEffect;