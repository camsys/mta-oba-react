import L from "leaflet";
import bus from "../img/icon/bus.svg";
import busStroller from "../img/icon/bus-stroller.svg";
import {VehicleRtInterface} from "../js/updateState/DataModels";
import {useNavigation} from "../js/updateState/NavigationEffect.ts";

export const createVehicleMarker = (
    vehicleDatum: VehicleRtInterface,
    selectVehicle: Function,
    zIndexOverride: number = 3,
): L.Marker => {
    const vehicleIdParts = vehicleDatum.vehicleId.split("_");
    const vehicleIdWithoutAgency = vehicleIdParts[1];

    let scheduled = vehicleDatum.hasRealtime?"":"scheduled/"
    let imgDegrees = vehicleDatum.bearing - vehicleDatum.bearing%5
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    let icon = L.icon({
        iconUrl: vehicleImageUrl,
        className: "svg-icon",
        iconSize: [51,51],
        iconAnchor: [25,25],
        popupAnchor: [0,0]
    })

    const markerOptions = {
        zIndexOffset: zIndexOverride,
        title: `Vehicle ${vehicleIdWithoutAgency}, ${vehicleDatum.routeId} to ${vehicleDatum.destination}`,
        vehicleId: vehicleDatum.vehicleId,
        routeId: vehicleDatum.routeId,
        key: `VehicleMarker_${vehicleDatum.vehicleId}_${vehicleDatum.longLat}`,
        position: vehicleDatum.longLat,
        icon: icon,
        id: `VehicleMarker_${vehicleDatum.vehicleId}`,
        keyboard: false,
    };

    const marker = L.marker(markerOptions.position, {
        icon: markerOptions.icon,
        zIndexOffset: markerOptions.zIndexOffset,
        title: markerOptions.title,
        keyboard: markerOptions.keyboard,
    });

    // Add popup
    const popupContent = `
        <img src="${vehicleDatum?.strollerVehicle ? busStroller : bus}" alt="bus" class="icon"/>
        <div class="popup-info">
            <span class="route">${vehicleDatum.routeId.split("_")[1]} ${vehicleDatum.destination}</span>
            <span class="vehicle">Vehicle #${vehicleIdWithoutAgency}</span>
            <button class="view-full close-map" aria-label="view full vehicle details">
                View Vehicle Details
            </button>
        </div>
    `;
    marker.bindPopup(popupContent, {
        className: "map-popup vehicle-popup",
        autoPan: false,
        keepInView: false,
        autoClose: false
    });

    marker.on("click", () => {
        selectVehicle(vehicleDatum.routeId, vehicleDatum.vehicleId, [vehicleDatum.longLat[0], vehicleDatum.longLat[1]]);
    });

    return marker;
};