import React, {useContext, useEffect, useState} from "react";
import {VehicleStateContext} from "Components/util/VehicleStateComponent";


export default function getRefreshComponent({extraClasses}){
    var time = new Date();
    time = time.toLocaleString('en-US', { hour: 'numeric',  minute: 'numeric', hour12: true});
    const {vehicleState}=useContext(VehicleStateContext)

    const handleRefresh = () => {
        window.location.reload();
    }
    useEffect(()=>{
        time = time.toLocaleString('en-US', { hour: 'numeric',  minute: 'numeric', hour12: true , second:'numeric'});
    },[vehicleState])

    return(<button className={`refresh-button ${extraClasses}`} aria-label="Refresh the data" onClick={handleRefresh}>
                <span className="label">
                    <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 20 20"><path className="blue"
                                                    d="M5.106 5.083a6.91 6.91 0 0 1 7.02-1.681 1.051 1.051 0 1 0 .638-2 9.037 9.037 0 0 0-11.13 11.944.21.21 0 0 1-.084.253l-1.176.781a.84.84 0 0 0-.362.841.84.84 0 0 0 .656.664l3.707.824h.168a.841.841 0 0 0 .462-.143.84.84 0 0 0 .362-.53l.765-3.707a.84.84 0 0 0-.353-.84.841.841 0 0 0-.933 0l-1.127.74a.244.244 0 0 1-.266-.054.235.235 0 0 1-.053-.081 6.96 6.96 0 0 1 1.706-7.01ZM19.985 4.797a.84.84 0 0 0-.639-.672l-3.69-.866a.84.84 0 0 0-1.009.63l-.84 3.682a.84.84 0 0 0 .336.841.84.84 0 0 0 .487.16.79.79 0 0 0 .446-.135l1.21-.756a.244.244 0 0 1 .185 0 .235.235 0 0 1 .135.134 6.935 6.935 0 0 1-8.65 8.793 1.05 1.05 0 0 0-1.32.698 1.043 1.043 0 0 0 .69 1.311c.868.27 1.772.407 2.681.404a9.037 9.037 0 0 0 8.398-12.4.227.227 0 0 1 .084-.26l1.135-.706a.84.84 0 0 0 .361-.858Z" /></svg>
                    </span>
                    Refresh <span className="updated-at">(<span className="updated">updated&nbsp;
                    </span>{time})</span>
                </span>
            </button>)}
