import L from "leaflet";

export const createRoutePolyline = (
    routeData,
    isHighlighted = false
) => {
    log.info("RoutePolylineFactory loaded");
    const polylineOptions = {
        positions: routeData.points,
        color: `#${routeData.color}`,
        weight: isHighlighted ? 10 : 3,
        opacity: isHighlighted ? 0.6 : 1,
        zIndex: isHighlighted ? 10 : 1,
    };

    // Create the polyline
    const polyline = L.polyline(polylineOptions.positions, {
        color: polylineOptions.color,
        weight: polylineOptions.weight,
        opacity: polylineOptions.opacity,
    });

    return polyline;
};