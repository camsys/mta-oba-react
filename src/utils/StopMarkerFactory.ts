import L from "leaflet";
import { StopMarker } from "./dataLayer";
import {useNavigation} from "../js/updateState/NavigationEffect.ts";

export const createStopMarker = (
    stopDatum,
    selectStop: Function,
    popupOptions: L.PopupOptions,
    icon: L.Icon,
    zIndexOverride: number=0,
) => {

    const marker = new StopMarker(stopDatum.longLat, {
        icon,
        zIndexOffset: zIndexOverride || -10,
        title: stopDatum.name,
        keyboard: false,
    },stopDatum);

    // Add popup
    const popupContent = `
        <img src="img/icon/bus-stop.svg" alt="busstop icon" class="icon"/>
        <div class="popup-info">
            <span class="name">${stopDatum.name}</span>
            <span class="stop-code">Stopcode ${stopDatum.id.split("_")[1]}</span>
            <button class="view-full close-map" aria-label="view full stop details">
                View Stop Details
            </button>
        </div> 
    `;
    marker.bindPopup(popupContent, popupOptions);

    marker.on("click", () => {
        selectStop(stopDatum);
    });

    return marker;
};