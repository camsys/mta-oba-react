import L from "leaflet";
import { StopMarker } from "./dataLayer";
import {useNavigation} from "../js/updateState/NavigationEffect.ts";

export const createStopMarker = (
    stopDatum,
    selectStop: Function,
    zIndexOverride: number=0,
) => {
    const directionKey = stopDatum?.stopDirection || "unknown";
    const stopImageUrl = `img/stop/stop-${directionKey}${zIndexOverride ? "-active" : ""}.png`;

    const icon = L.icon({
        iconUrl: stopImageUrl,
        className: "svg-icon",
        iconSize: zIndexOverride ? [40, 40] : [27, 27],
        iconAnchor: zIndexOverride ? [20, 20] : [13, 13],
        popupAnchor: [0, 0],
    });

    const marker = L.marker([stopDatum.longLat[0],stopDatum.longLat[1]], {
        icon,
        zIndexOffset: zIndexOverride || -10,
        title: stopDatum.name,
        keyboard: false,
    });

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
    marker.bindPopup(popupContent, {
        className: "map-popup stop-popup",
        autoPan: false,
        keepInView: false,
        autoClose: false
    });

    marker.on("click", () => {
        selectStop(stopDatum);
    });

    return marker;
};