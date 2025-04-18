import L from "leaflet";

export const createStopMarker = (
    stopDatum,
    zIndexOverride
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

    const marker = L.marker(stopDatum.longLat, {
        icon,
        zIndexOffset: zIndexOverride || -10,
        title: stopDatum.name,
        keyboard: false,
    });

    // Add popup
    const popupContent = `
        <div class="popup-info">
            <img src="img/icon/bus-stop.svg" alt="busstop icon" class="icon"/>
            <span class="name">${stopDatum.name}</span>
            <span class="stop-code">Stopcode ${stopDatum.id.split("_")[1]}</span>
            <button class="view-full close-map" aria-label="view full stop details">
                View Stop Details
            </button>
        </div>
    `;
    marker.bindPopup(popupContent, {
        autoPan: false,
        keepInView: false,
    });

    return marker;
};