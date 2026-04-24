 


// ---------SIRI Data Contracts----------

export interface SiriServiceDelivery {
    ResponseTimestamp: string;
    VehicleMonitoringDelivery?: SiriVehicleMonitoringDelivery[];
    StopMonitoringDelivery?: SiriStopMonitoringDelivery[];
    SituationExchangeDelivery?: SiriSituationExchangeDelivery[];
}

export interface SiriVehicleMonitoringDelivery {
    VehicleActivity?: SiriMonitoredVehicleJourneyActivity[];
}

export interface SiriMonitoredVehicleJourneyActivity {
    MonitoredVehicleJourney: SiriMonitoredVehicleJourney;
}

export interface SiriMonitoredVehicleJourney {
    VehicleRef: string;
    LineRef: string;
    DirectionRef?: string;
    DestinationName: string;
    Monitored: boolean;
    ProgressStatus?: string;
    VehicleLocation: {
        Latitude: number;
        Longitude: number;
    };
    Bearing?: number;
    MonitoredCall?: SiriMonitoredCall;
    OnwardCalls?: {
        OnwardCall?: SiriMonitoredCall[];
    };
    OriginAimedDepartureTime: string;
}

export interface SiriMonitoredCall {
    StopPointRef?: string;
    StopPointName?: string;
    ExpectedArrivalTime?: string;
    Extensions?: {
        Distances?: {
            PresentableDistance?: string;
            DistanceFromCall?: number;
            StopsFromCall?: number;
            CallDistanceAlongRoute?: number;
        };
        Capacities?: {
            EstimatedPassengerLoadFactor?: string;
            EstimatedPassengerCount?: number;
            EstimatedPassengerCapacity?: number;
        };
        VehicleFeatures?: {
            StrollerVehicle?: boolean;
        };
    };
}

export interface SiriStopMonitoringDelivery {
    MonitoredStopVisit?: SiriMonitoredStopVisitActivity[];
}

export interface SiriMonitoredStopVisitActivity {
    MonitoredVehicleJourney: SiriMonitoredVehicleJourney;
}

export interface SiriSituationExchangeDelivery {
    Situations?: {
        PtSituationElement?: SiriPtSituationElement[];
    };
}

export interface SiriPtSituationElement {
    Summary: string;
    Description: string;
    Affects: {
        VehicleJourneys: {
            AffectedVehicleJourney: SiriAffectedVehicleJourney[];
        };
    };
}

export interface SiriAffectedVehicleJourney {
    LineRef?: string;
    DirectionRef?: string;
}

export interface SiriResponse {
    Siri?: {
        ServiceDelivery?: SiriServiceDelivery;
    };
}

export interface SiriWrapper {
    siri?: SiriResponse;
}





// ------------- SEARCH CARD DATA CONTRACTS --------------


export interface SearchStopData {
    name: string;
    id: string;
    latitude: number;
    longitude: number;
    stopDirection: string;
}

export interface SearchRouteDirectionData {
    directionId: string;
    hasUpcomingScheduledService: boolean;
    destination: string;
    stops: SearchStopData[];
    polylines: (string | SearchPolylineData)[];
}

export interface SearchPolylineData {
    line?: string;
    detourStatus?: string;
    disruptionStatus?: string;
}

export interface SearchRouteData {
    id: string;
    shortName: string;
    longName: string;
    color: string;
    description: string;
    directions: SearchRouteDirectionData[];
}

export interface SearchRouteDirectionData {
    directionId: string;
    hasUpcomingScheduledService: boolean;
    destination: string;
    stops: SearchStopData[];
    polylines: (string | SearchPolylineData)[];
}

export interface SearchStopData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    stopDirection: string;
    routesAvailable: SearchRouteData[];
}

export interface SearchGeoData {
    latitude: number;
    longitude: number;
    nearbyRoutes: (SearchRouteData | SearchStopData)[];
}