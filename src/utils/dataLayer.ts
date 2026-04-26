import L from "leaflet";
import { AgencyAndId, MapRouteComponentInterface, StopInterface, VehicleRtInterface } from "../js/updateState/DataModels";

export interface DatumElement {
    getDatumId(): AgencyAndId;
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

    getDatumId(): AgencyAndId {
        return this.datum.datumId;
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

    getDatumId(): AgencyAndId {
        return AgencyAndId.get(this.datum.routeId);
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

    getDatumId(): AgencyAndId {
        return AgencyAndId.get(this.datum.id);
    }
}

export class RouteLayerGroup<T extends L.Layer & DatumElement> extends L.LayerGroup implements DatumElement {
    private datumId: AgencyAndId | null;
    

    constructor(datumId: AgencyAndId | null, layers?: T[], options?: L.LayerOptions) {
        super(layers, options);
        this.datumId = datumId;
    }

    getDatum(): string {
        if (!this.datumId) {
            return '';
        }
        const probablyAgencyAndId: AgencyAndId = this.datumId;
        const indexable = typeof probablyAgencyAndId === 'string' ? probablyAgencyAndId : probablyAgencyAndId.toString();
        return indexable;
    }

    getDatumId(): AgencyAndId {
        if (!this.datumId) {
            throw new Error('DatumId is null');
        }
        return this.datumId;
    }
}