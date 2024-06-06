import React from "react";
import serviceAlertContainerComponent from "./serviceAlertContainerComponent";

function serviceAlertComponent  (serviceAlertData) {
    return(
        <div className="card-content collapse-content" styles="max-height: 0px;">
            <p>Eastbound B38 stop on Kossuth Pl at Bushwick Ave is closed.</p>
            <p>Buses are making a stop on DeKalb Ave at Bushwick Ave.</p>
            <p>What's happening? <br/>Building construction at 856 Bushwick Avenue</p>
            <p>Note: Real-time tracking on BusTime may be inaccurate in the
                service change area.</p>
            <p>The 2:59pm B38 to CADMAN PLZ W/TILLARY ST is canceled</p>
            <p>The 2:39pm B38 to CADMAN PLZ W/TILLARY ST is canceled</p>
            <p>Eastbound B38 buses are detoured because of roadwork on Lafayette
                Ave between Washington Ave and Classon Ave.</p>
            <p>Buses will not serve stops on Lafayette Ave from S Portland Ave to
                Grand Ave. Stops will be made along Fulton St as requested.</p>
            <p>Note: Bus arrival information may not be Available while buses are
                detoured.</p>
            <p><a href="/" tabIndex="-1">Click this link for a map of the detours.</a></p>
        </div>)
}


export default serviceAlertComponent;