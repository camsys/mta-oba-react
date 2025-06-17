import React, {useContext, useEffect, useState} from "react";
import {serviceAlertDataIdentifier, vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import {ServiceAlertInterface} from "../../js/updateState/DataModels";
import log from 'loglevel';
import DOMPurify from 'dompurify';


function ServiceAlertComponent  ({serviceAlertDatum}:ServiceAlertInterface) : JSX.Element {
    log.info("service alert component contents generating ",serviceAlertDatum)
    return(
        <div className="card-content collapse-content">
            {serviceAlertDatum[0].descriptionParts.map((part,itt)=> {


                // part = DOMPurify.sanitize(part, {
                //     ALLOWED_TAGS: ['b', 'strong', 'p', 'a'],
                //     ALLOWED_ATTR: ['href'],
                //     ALLOW_DATA_ATTR: false,
                // });
                try{
                    return(<p key = {itt} dangerouslySetInnerHTML={{__html: part}}></p>)
                }catch(e){
                    log.error("Error rendering service alert component", e)
                }
            })}
        </div>)
}

export default function ServiceAlertContainerComponent  ({ routeId,serviceAlertIdentifier, collapsed}:{ routeId : string ,serviceAlertIdentifier : string,collapsed:boolean}) : JSX.Element {
    log.info("generating service alert component")
    let {getServiceAlert} = useServiceAlert()
    let serviceAlertDatum = getServiceAlert(routeId,serviceAlertIdentifier)
    if(serviceAlertDatum===null||typeof serviceAlertDatum==="undefined"){return null}
    return (<div className="service-alert inner-card collapsible">
        <button className="card-header collapse-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Toggle Service Alert Open/Closed" tabIndex={collapsed?-1:0}>
            <ServiceAlertSvg/>
            <span className="label">Service Alert for {routeId}</span>
        </button>
        <ServiceAlertComponent {...{serviceAlertDatum}}/>
    </div>)
}

export function useServiceAlert(){
    const { vehicleState} = useContext(VehicleStateContext)
    function getServiceAlert(routeId : string ,serviceAlertIdentifier : string){
        log.info("getting service alert data",vehicleState,routeId+serviceAlertDataIdentifier,serviceAlertIdentifier)
        let routeServiceAlerts = vehicleState[routeId+serviceAlertDataIdentifier]
        if(routeServiceAlerts===null||typeof routeServiceAlerts==="undefined"){return null}
        let serviceAlertDatum = vehicleState[routeId+serviceAlertDataIdentifier].get(serviceAlertIdentifier)
        log.info("service alert datum found from state",serviceAlertDatum)
        if(typeof serviceAlertDatum==="undefined"){return null}
        return serviceAlertDatum
    }

    return {getServiceAlert}
}

export function ServiceAlertSvg(){
    return(<span className="svg-icon-wrap svc-alert-icon" role="presentation" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                <path className="yellow" fillRule="evenodd" clipRule="evenodd"
                      d="M8.88184 0.314668C9.21848 0.108886 9.60539 0 9.99995 0C10.3945 0 10.7814 0.108886 11.118 0.314668C11.4547 0.52045 11.728 0.815142 11.9079 1.1663L11.9111 1.17253L19.7705 16.8915C19.9346 17.2175 20.0133 17.5813 19.998 17.946C19.9827 18.3111 19.8744 18.6663 19.6832 18.9777C19.4919 19.2891 19.2244 19.5465 18.9057 19.7255C18.5871 19.9044 18.228 19.9989 17.8625 20H17.8604H2.13945H2.13728C1.77185 19.9989 1.41276 19.9044 1.09412 19.7255C0.775488 19.5465 0.50788 19.2891 0.316714 18.9777C0.125549 18.6663 0.0171731 18.3111 0.00187865 17.946C-0.0133979 17.5813 0.0646962 17.2187 0.228751 16.8927L8.08882 1.17255L8.09195 1.16628C8.27184 0.815127 8.54521 0.52045 8.88184 0.314668Z"/>
                <path className="black always-black" fillRule="evenodd" clipRule="evenodd"
                      d="M9.99974 5.88691C10.5917 5.88691 11.0716 6.36681 11.0716 6.95879V11.6036C11.0716 12.1956 10.5917 12.6755 9.99974 12.6755C9.40776 12.6755 8.92785 12.1956 8.92785 11.6036V6.95879C8.92785 6.36681 9.40776 5.88691 9.99974 5.88691ZM11.4289 15.5339C11.4289 16.3232 10.789 16.963 9.99974 16.963C9.21043 16.963 8.57056 16.3232 8.57056 15.5339C8.57056 14.7445 9.21043 14.1047 9.99974 14.1047C10.789 14.1047 11.4289 14.7445 11.4289 15.5339Z"/>
                </svg>
            </span>)
}