import L, { map } from "leaflet";
import {VehicleRtInterface} from "../js/updateState/DataModels";
import log from 'loglevel';
import { setMapLatLngAndZoom } from "./mapZoom";

export const createVehicleMarker = (
    vehicleDatum: VehicleRtInterface,
    icon: L.Icon,
    popupOptions: L.PopupOptions,
    zIndexOverride: number = 3,
    mapRef: L.Map
): L.Marker => {
    const vehicleIdParts = vehicleDatum.vehicleId.split("_");
    const vehicleIdWithoutAgency = vehicleIdParts[1];

    const marker = L.marker(vehicleDatum.longLat, {
        icon: icon,
        zIndexOffset: zIndexOverride,
        title: `Vehicle ${vehicleIdWithoutAgency}, ${vehicleDatum.routeId} to ${vehicleDatum.destination}`,
        keyboard: true,
    });


    // TODO: Refactor marker focus logic to use event bubbling (marker.fire).
    // Current mapRef tunneling is a shortcut to bypass Leaflet's focus 
    // event propagation limits and meet launch deadline.
    marker.on('add', () => {
        log.trace("Vehicle marker added to map, setting up focus event listener");

        const el = marker.getElement();
        log.info("Vehicle marker added to map, Marker element:", el);
        if (!el) return;
        log.info("Vehicle marker added to map, Adding focus event listener to marker element");

        el.addEventListener('focus', (e) => {
            e.preventDefault();
            log.trace("Browser focus event fired on vehicle marker element");

            // Now check :focus-visible on the DOM element
            if (el.matches(':focus-visible')) {
                const pos = marker.getLatLng();
                log.info("Vehicle marker is focus-visible, checking if it's within map bounds", pos, mapRef.getBounds());
                setMapLatLngAndZoom(mapRef,pos.lat,pos.lng,null,true)
            }
        }, { passive: false });
    });


    return marker;
};