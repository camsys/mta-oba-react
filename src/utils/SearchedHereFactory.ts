import L from "leaflet";
import { v4 as uuidv4 } from "uuid";

export const createSearchedHereMarker = (
    latlon: [number, number],
    zIndexOverride: number = 700
): L.Marker => {
    const icon = L.icon({
        iconUrl: "img/search-location-map-pin.png", // Path to the "searched here" icon
        className: "svg-icon",
        iconSize: [24, 20], // Adjust size as needed
        iconAnchor: [12, 10], // Anchor point for the icon
        popupAnchor: [0, 0], // Anchor point for the popup
    });

    const marker = L.marker(latlon, {
        icon,
        zIndexOffset: zIndexOverride,
        title: "Searched Location",
        keyboard: false,
    });

    // Add popup
    const popupContent = `
        <div class="popup-info">
            <span class="searched-here-span">Searched Location</span>
        </div>
    `;
    marker.bindPopup(popupContent, {
        autoPan: false,
        keepInView: false,
    });

    return marker;
};