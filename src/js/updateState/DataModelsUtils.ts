import {RouteInterface, StopInterface} from "./DataModels";

export const isStopInterface = (obj: any): obj is StopInterface =>
    typeof obj === "object" &&
    obj !== null &&
    typeof obj?.name === "string" &&
    Array.isArray(obj?.longLat) &&
    obj.longLat?.length === 2 &&
    typeof obj.longLat?.[0] === "number" &&
    typeof obj.longLat?.[1] === "number" &&
    typeof obj?.id === "string" &&
    typeof obj?.stopDirection === "string" &&
    typeof obj?.datumId === "string" &&
    typeof obj?.datumName === "string";

export const isRouteInterface = (obj: any): obj is RouteInterface =>
    typeof obj === "object" &&
    obj !== null &&
    typeof obj?.color === "string" &&
    typeof obj?.routeId === "string" &&
    typeof obj?.routeTitle === "string" &&
    (typeof obj?.description === "string" || obj?.description === undefined || obj?.description === null) &&
    typeof obj?.datumId === "string" &&
    typeof obj?.datumName === "string";


export const extractRouteInterface = (obj: any): RouteInterface | null => {
    if (isRouteInterface(obj)) {
        const { color, routeId, routeTitle, description, datumId, datumName } = obj;
        return { color, routeId, routeTitle, description, datumId, datumName };
    }
    return null;
};



export const extractStopInterface = (obj: any): StopInterface | null => {
    if (isStopInterface(obj)) {
        const { name, longLat, id, stopDirection, datumId, datumName } = obj;
        return { name, longLat, id, stopDirection, datumId, datumName };
    }
    return null;
};