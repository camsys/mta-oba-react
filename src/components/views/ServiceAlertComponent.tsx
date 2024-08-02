import React, {useContext, useState} from "react";
import {OBA} from "../../js/oba";
import serviceAlertContainerComponent from "./ServiceAlertContainerComponent.tsx";
import {ServiceAlertInterface} from "../../js/updateState/DataModels";

function getServiceAlertComponent  ({serviceAlertDatum}:ServiceAlertInterface) : JSX.Element {
    console.log("service alert component contents generating ",serviceAlertDatum)
    return(
        <div className="card-content collapse-content" styles="max-height: 0px;">
            {serviceAlertDatum[0].descriptionParts.map((part,itt)=> {return(<p key = {itt}>{part}</p>)})}
        </div>)
}


export default getServiceAlertComponent;