
export interface SiriServiceDelivery {
    ResponseTimestamp: string;
    VehicleMonitoringDelivery?: VehicleMonitoringDelivery[];
    StopMonitoringDelivery?: StopMonitoringDelivery[];
    SituationExchangeDelivery?: SituationExchangeDelivery[];
}

export interface VehicleMonitoringDelivery {
    VehicleActivity?: MonitoredVehicleJourneyActivity[];
}

export interface MonitoredVehicleJourneyActivity {
    MonitoredVehicleJourney: MonitoredVehicleJourney;
}

export interface MonitoredVehicleJourney {
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
    MonitoredCall?: MonitoredCall;
    OnwardCalls?: {
        OnwardCall?: MonitoredCall[];
    };
    OriginAimedDepartureTime: string;
}

export interface MonitoredCall {
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

export interface StopMonitoringDelivery {
    MonitoredStopVisit?: MonitoredStopVisitActivity[];
}

export interface MonitoredStopVisitActivity {
    MonitoredVehicleJourney: MonitoredVehicleJourney;
}

export interface SituationExchangeDelivery {
    Situations?: {
        PtSituationElement?: PtSituationElement[];
    };
}

export interface PtSituationElement {
    Summary: string;
    Description: string;
    Affects: {
        VehicleJourneys: {
            AffectedVehicleJourney: AffectedVehicleJourney[];
        };
    };
}

export interface AffectedVehicleJourney {
    LineRef?: string;
    DirectionRef?: string;
}

export interface SiriResponse {
    Siri?: {
        ServiceDelivery?: SiriServiceDelivery;
    };
}

export interface SiriStopWrapper {
    siri?: SiriResponse;
}