import L from "leaflet";
import log from "loglevel";
import { MapRouteDisruptionStatus } from "../js/updateState/DataModels";

export const createRoutePolyline = (
    routeData,
    isHighlighted = false
) => {
    log.info("RoutePolylineFactory loaded");
    
    // Determine polyline style based on disruption status
    let weight = isHighlighted ? 10 : 3;
    let dashArray = undefined;
    let opacity = isHighlighted ? 0.6 : 1;
    
    switch (routeData.disruptionStatus) {
        case MapRouteDisruptionStatus.Detour:
            // Detour: bold line (2x normal weight)
            weight = isHighlighted ? 20 : 6;
            break;
        case MapRouteDisruptionStatus.Removed:
            // Removed: dotted line with 80% opacity
            dashArray = "3, 6";
            opacity = 0.7;
            break;
        case MapRouteDisruptionStatus.Canonical:
        default:
            // Canonical: normal appearance
            break;
    }
    
    const polylineOptions = {
        positions: routeData.points,
        color: `#${routeData.color}`,
        weight: weight,
        opacity: opacity,
        zIndex: isHighlighted ? 10 : 1,
    };

    // Create the polyline
    const polylineConfig: any = {
        color: polylineOptions.color,
        weight: polylineOptions.weight,
        opacity: polylineOptions.opacity,
    };
    
    if (dashArray) {
        polylineConfig.dashArray = dashArray;
    }
    
    const polyline = L.polyline(polylineOptions.positions, polylineConfig);

    return polyline;
};