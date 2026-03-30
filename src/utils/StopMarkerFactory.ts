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

    // Note: Popup content and binding for stop markers are handled elsewhere;
    // this factory is responsible only for marker creation and click selection.

    marker.on("click", () => {
        selectStop(stopDatum);
    });

    return marker;
};