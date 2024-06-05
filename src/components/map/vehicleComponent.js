import {OBA} from "../../js/oba";
import React from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import bus from "../../img/icon/bus.svg";
import busStroller from "../../img/icon/bus-stroller.svg";




//
//
// var hasRealtime = monitoredVehicleJourney.Monitored;
//
//
// if(typeof monitoredVehicleJourney.MonitoredCall !== 'undefined') {
//
//     // Scheduled Departure Text
//     var layoverSchedDepartureText = "";
//     var layoverLateDepartureText = " <span class='not_bold'>(at terminal)</span>";
//     var prevTripSchedDepartureText = "";
//     var prevTripLateDepartureText = " <span class='not_bold'>(+ scheduled layover at terminal)</span>";
//
//     var loadOccupancy = getOccupancyForStop(monitoredVehicleJourney);
//     var distance = monitoredVehicleJourney.MonitoredCall.Extensions.Distances.PresentableDistance + loadOccupancy;
//
//     var timePrediction = null;
//     if(typeof monitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime !== 'undefined'
//         && monitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime !== null) {
//         timePrediction = Util.getArrivalEstimateForISOString(
//             monitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime,
//             updateTimestampReference);
//     }
//
//     var layover = false;
//     if(typeof monitoredVehicleJourney.ProgressStatus !== 'undefined'
//         && monitoredVehicleJourney.ProgressStatus.indexOf("layover") !== -1) {
//         layover = true;
//     }
//
//     var prevTrip = false;
//     if(typeof monitoredVehicleJourney.ProgressStatus !== 'undefined'
//         && monitoredVehicleJourney.ProgressStatus.indexOf("prevTrip") !== -1) {
//         prevTrip = true;
//     }
//
//     var stalled = false;
//     if(typeof monitoredVehicleJourney.ProgressRate !== 'undefined'
//         && monitoredVehicleJourney.ProgressRate === "noProgress") {
//         stalled = true;
//     }
//
//     var mvjDepartureTimeAsText = monitoredVehicleJourney.OriginAimedDepartureTime,
//         departureTimeAsDateTime = null;
//
//     var isDepartureTimeAvailable = false;
//     var isDepartureOnSchedule = false;
//
//     if(typeof mvjDepartureTimeAsText !== 'undefined'){
//         isDepartureTimeAvailable = true;
//         departureTimeAsDateTime = Util.ISO8601StringToDate(mvjDepartureTimeAsText);
//         isDepartureOnSchedule = departureTimeAsDateTime && departureTimeAsDateTime.getTime() >= updateTimestampReference;
//
//         layoverSchedDepartureText = " <span class='not_bold'>(at terminal, scheduled to depart at " + departureTimeAsDateTime.format("h:MM TT") + ")</span>";
//         prevTripSchedDepartureText = " <span class='not_bold'>(+layover, scheduled to depart terminal at " + departureTimeAsDateTime.format("h:MM TT") + ")</span>";
//     }
//
//     // If realtime data is available and config is set, add vehicleID
//     if (Config.showVehicleIdInStopPopup === true){
//         var vehicleId = monitoredVehicleJourney.VehicleRef.split("_")[1];
//         distance += '<span class="vehicleId"> (#' + vehicleId + ')</span>';
//     }
//     var arrival = "arrival";
//     var spooking = false;
//     if (typeof monitoredVehicleJourney.ProgressStatus !== 'undefined' && monitoredVehicleJourney.ProgressStatus !== null && monitoredVehicleJourney.ProgressStatus === 'spooking') {
//         spooking = true;
//         arrival = "scheduled_arrival";
//     }
//     if(typeof monitoredVehicleJourney.MonitoredCall !='undefined' &&
//         typeof monitoredVehicleJourney.MonitoredCall.Extensions !='undefined'  &&
//         typeof monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures !='undefined' &&
//         typeof monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle !='undefined' &&
//         monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle == true) {
//         arrival = "stroller_"+arrival;
//     }
//
//     // time mode
//     if(timePrediction != null) {
//         timePrediction += ", " + distance;
//
//         if(isDepartureTimeAvailable){
//             if(layover === true) {
//                 if(isDepartureOnSchedule){
//                     timePrediction += layoverSchedDepartureText;
//                 }else{
//                     timePrediction += layoverLateDepartureText;
//                 }
//             }
//             else if(prevTrip === true){
//                 if(isDepartureOnSchedule){
//                     timePrediction += prevTripSchedDepartureText;
//                 } else {
//                     timePrediction += prevTripLateDepartureText;
//                 }
//             }
//         }
//         else{
//             if(layover === true) {
//                 timePrediction += layoverLateDepartureText;
//             }
//         }
//         if(spooking) {
//             timePrediction += " (Estimated)";
//         }
//
//         var lastClass = ((_ === maxObservationsToShow - 1 || _ === mvjs.length - 1) ? " last" : "");
//         html += '<li class="' + arrival + lastClass + '">';
//
//         if(typeof monitoredVehicleJourney.MonitoredCall !='undefined' &&
//             typeof monitoredVehicleJourney.MonitoredCall.Extensions !='undefined'  &&
//             typeof monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures !='undefined' &&
//             typeof monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle !='undefined' &&
//             monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle == true) {
//             html += "";
//         }
//
//         html += timePrediction + '</li>';
//
//         // distance mode
//     } else {
//         if(isDepartureTimeAvailable){
//             if(layover === true) {
//                 if(isDepartureOnSchedule) {
//                     distance += layoverSchedDepartureText;
//                 } else {
//                     distance += layoverLateDepartureText;
//                 }
//             }
//             else if(prevTrip == true) {
//                 if(isDepartureOnSchedule){
//                     distance += prevTripSchedDepartureText;
//                 } else {
//                     distance += prevTripLateDepartureText;
//                 }
//             }
//         }
//         if(spooking) {
//             distance += " (Estimated)";
//         }
//
//         var lastClass = ((_ === maxObservationsToShow - 1 || _ === mvjs.length - 1) ? " last" : "");
//
//         html += '<li class="' + arrival + lastClass + '">';
//
//         if(typeof monitoredVehicleJourney.MonitoredCall !='undefined' &&
//             typeof monitoredVehicleJourney.MonitoredCall.Extensions !='undefined'  &&
//             typeof monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures !='undefined' &&
//             typeof monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle !='undefined' &&
//             monitoredVehicleJourney.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle == true) {
//             html += "";
//         }
//         html += distance + '</li>';
//     }
// }
//
//




const baseVehicleIcon = L.icon({
    iconUrl: bus,
    className: "svg-icon",
    iconSize: [24, 40],
    iconAnchor: [12, 40]
});

const scheduledVehicleIcon = L.icon({
    iconUrl: bus,
    className: "svg-icon",
    iconSize: [24, 40],
    iconAnchor: [12, 40]
});

function vehicleComponent  (longLat,vid, route, destination, strollerVehicle) {
    OBA.Util.trace('generating vehicle: ' + vid)
    let out = (<Marker position={longLat} key={longLat} icon={baseVehicleIcon}>
        <Popup key={longLat} className="map-popup">
            <div className="popup-content">
                <img src={strollerVehicle?busStroller:bus} alt="bus" className="icon"/>
                    <div className="bus-info">
                        <span className="route">{route} {destination}</span>
                        <span className="vehicle">Vehicle #{vid}</span>
                    </div>
            </div>
            <button className="close-popup-button">
                <span className="icon-wrap">
                    <img src="/img/icon/close-circle.svg" alt="Close Popup" className="icon"/>
                </span>
            </button>
        </Popup>
    </Marker>);

    return out
}
export default vehicleComponent;

