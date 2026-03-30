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


    return marker;
};