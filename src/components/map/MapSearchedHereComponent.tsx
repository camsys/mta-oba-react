import L from "leaflet";
import { v4 as uuidv4 } from 'uuid';
import log from 'loglevel';

export function createMapSearchedHereMarker( latlon :[number, number]): L.Marker | null {
    log.info('validating createMapSearchedHereMarker vars: ', latlon);
    if (latlon == null || latlon == undefined) {
        log.info('invalid latlon for createMapSearchedHereMarker: ', latlon);
        return null;
    }
    log.info('starting to generate createMapSearchedHereMarker: ', latlon);

    const icon = L.icon({
        iconUrl: "img/search-location-map-pin.png",
        className: "svg-icon",
        iconSize: [24, 20],
        iconAnchor: [12, 10],
        popupAnchor: [0, 0]
    });

    const popupContent = `
        <div class="popup-info">
            <span class="searched-here-span">Searched Location</span>
        </div>
    `;

    const marker = L.marker(latlon, {
        icon: icon,
        zIndexOffset: 700,
        title: "searched here icon",
        keyboard: false
    });

    marker.bindPopup(popupContent, {
        autoPan: false,
        keepInView: false,
        className: "map-searched-location"
    });

    log.info('generated createMapSearchedHereMarker: ', latlon, marker);
    return marker;
}

export default createMapSearchedHereMarker;