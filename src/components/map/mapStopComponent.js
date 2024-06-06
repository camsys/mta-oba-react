import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import stopIcon from "../../img/icon/star_black.svg"


function mapStopComponent  (stopData) {
    return (<span></span>)
    // OBA.Util.trace('generating vehicle: ' + vid)
    // let imgDegrees = direction - direction%5
    // OBA.Util.trace("img degrees" + imgDegrees)
    // let scheduled = hasRealtime?"":"scheduled/"
    // OBA.Util.trace(scheduled)
    // let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    // OBA.Util.trace("vehicleImageUrl:")
    // OBA.Util.trace(vehicleImageUrl)
    // let icon = L.icon({
    //     iconUrl: stopIcon,
    //     className: "svg-icon",
    //     iconSize: [24, 40],
    //     iconAnchor: [12, 40]
    // })
    // let out = (<Marker position={longLat} key={longLat} icon={icon}>
    //     <Popup key={longLat} className="map-popup">
    //         <div className="popup-content">
    //             <img src={strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
    //             <div className="bus-info">
    //                 <span className="route">{route} {destination}</span>
    //                 <span className="vehicle">Vehicle #{vid}</span>
    //             </div>
    //         </div>
    //         <button className="close-popup-button">
    //             <span className="icon-wrap">
    //                 <img src="/img/icon/close-circle.svg" alt="Close Popup" className="icon"/>
    //             </span>
    //         </button>
    //     </Popup>
    // </Marker>);
    //
    // return out
}
export default mapStopComponent;

