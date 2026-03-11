import L from "leaflet";
import { MapRouteComponentInterface, StopInterface, VehicleRtInterface } from "../js/updateState/DataModels";

export interface DatumElement {
    getDatumId(): string;
    getDatum(): MapRouteComponentInterface | VehicleRtInterface| StopInterface | string;
}


export class StopMarker extends L.Marker implements DatumElement {
    private datum: StopInterface;

    constructor(latlng: L.LatLngExpression, options: L.MarkerOptions, datum: StopInterface) {
        super(latlng, options);
        this.datum = datum;
    }

    getDatum(): StopInterface {
        return this.datum;
    }

    getDatumId(): string {
        return this.datum.id;
    }
}


export class VehicleArrivalMarker extends L.Marker implements DatumElement {
    private datum: VehicleRtInterface;

    constructor(latlng: L.LatLngExpression, options: L.MarkerOptions, datum: VehicleRtInterface) {
        super(latlng, options);
        this.datum = datum;
    }

    getDatum(): VehicleRtInterface {
        return this.datum;
    }

    getDatumId(): string {
        return this.datum.vehicleId;
    }
}

export class RoutePolyline extends L.Polyline implements DatumElement {
    private datum: MapRouteComponentInterface;

    constructor(latlngs: L.LatLngExpression[], options: L.PolylineOptions, datumId: MapRouteComponentInterface) {
        super(latlngs, options);
        this.datum = datumId;
    }

    getDatum(): MapRouteComponentInterface {
        return this.datum;
    }

    getDatumId(): string {
        return this.datum.routeId;
    }
}

export class RouteLayerGroup<T extends L.Layer & DatumElement> extends L.LayerGroup implements DatumElement {
    private datumId: string;
    

    constructor(datumId: string, layers?: T[], options?: L.LayerOptions) {
        super(layers, options);
        this.datumId = datumId;
    }

    getDatum(): string {
        return this.datumId;
    }

    getDatumId(): string {
        return this.datumId;
    }
}