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
    typeof obj?.stopDirection === "string";

export const isRouteInterface = (obj: any): obj is RouteInterface =>
    typeof obj === "object" &&
    obj !== null &&
    typeof obj?.color === "string" &&
    typeof obj?.routeId === "string" &&
    typeof obj?.routeTitle === "string" &&
    typeof obj?.description === "string";