import React from "react";

function getRouteVehicleComponent(){
    return(<ul className="approaching-buses"> <li><a href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true" className="bus">7619</a></li></ul>)
    // <ul className="approaching-buses">
    //     <li>
    //         <a href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
    //             className="bus">7619</a>
    //         <span className="bus-info">
    //           <span className="approaching">&lt;1 stop away</span>
    //           <span className="passengers">~16 passengers</span>
    //         </span>
    //     </li>
    // </ul>
}
export default getRouteVehicleComponent