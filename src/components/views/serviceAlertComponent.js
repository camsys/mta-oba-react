import React, {useContext, useState} from "react";
import {OBA} from "../../js/oba";
import serviceAlertContainerComponent from "./serviceAlertContainerComponent";

function getServiceAlertComponent  (props) {
    let {serviceAlertDatum} = props
    console.log("service alert component contents generating ",serviceAlertDatum)
    return(
        <div className="card-content collapse-content" styles="max-height: 0px;">
            {serviceAlertDatum[0].descriptionParts.map((part)=> {return(<p>{part}</p>)})}
        </div>)
}


export default getServiceAlertComponent;