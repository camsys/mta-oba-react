import L, { map } from "leaflet";
import { StopMarker } from "./dataLayer";
import {useNavigation} from "../js/updateState/NavigationEffect.ts";
import log from 'loglevel';
import {setMapLatLngAndZoom} from "./mapZoom";

export const createStopMarker = (
    stopDatum,
    selectStop: Function,
    popupOptions: L.PopupOptions,
    icon: L.Icon,
    zIndexOverride: number=0,
    mapRef: L.Map
) => {

    const marker = new StopMarker(stopDatum.longLat, {
        icon,
        zIndexOffset: zIndexOverride || -10,
        title: stopDatum.name,
        // keyboard: true,
    },stopDatum);

    // Note: Popup content and binding for stop markers are handled elsewhere;
    // this factory is responsible only for marker creation and click selection.

    marker.on("click", () => {
        selectStop(stopDatum);
    });

    marker.on("keypress", (e:L.LeafletKeyboardEvent) => {
        if (e.originalEvent.key === 'Enter') {
            selectStop(stopDatum);
        }
    });




    // TODO: Refactor marker focus logic to use event bubbling (marker.fire).
    // Current mapRef tunneling is a shortcut to bypass Leaflet's focus 
    // event propagation limits and meet launch deadline.
    marker.on('add', () => {
        log.trace("Stop marker added to map, setting up focus event listener");
        const el = marker.getElement();
        log.trace("Marker element:", el);
        if (!el) return;
        log.info("Adding focus event listener to marker element");
        el.setAttribute('tabindex', '0');

        el.addEventListener('focus', (e) => {
            e.preventDefault();
            log.trace("Browser focus event fired on marker element");
            if (el.matches(':focus-visible')) {
                const pos = marker.getLatLng();
                log.info("Marker is focus-visible, checking if it's within map bounds", pos);
                setMapLatLngAndZoom(mapRef,pos.lat,pos.lng,null,true)
            }
        }, { passive: false });
    });
    return marker;
};