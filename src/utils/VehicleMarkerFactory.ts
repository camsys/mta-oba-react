import L from "leaflet";
import bus from "../img/icon/bus.svg";
import busStroller from "../img/icon/bus-stroller.svg";
import {VehicleRtInterface} from "../js/updateState/DataModels";

export const createVehicleMarker = (
    vehicleDatum: VehicleRtInterface,
    icon: L.Icon,
    popupOptions: L.PopupOptions,
    zIndexOverride: number = 3,
): L.Marker => {
    const vehicleIdParts = vehicleDatum.vehicleId.split("_");
    const vehicleIdWithoutAgency = vehicleIdParts[1];

    const marker = L.marker(vehicleDatum.longLat, {
        icon: icon,
        zIndexOffset: zIndexOverride,
        title: `Vehicle ${vehicleIdWithoutAgency}, ${vehicleDatum.routeId} to ${vehicleDatum.destination}`,
        keyboard: false,
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
    marker.bindPopup(popupContent, popupOptions);

    return marker;
};