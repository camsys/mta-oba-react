import React, { createContext, useState , ReactNode} from 'react';

const VehicleStateContext = createContext();
const VehiclesApproachingStopsContext = createContext();
import log from 'loglevel';
import { AgencyAndId } from '../../js/updateState/DataModels';


//todo: should be broken out into two states based on features which change and do not change
// eg. vehicle position vs vehicle features
const VehicleStateProvider = ({ children }: { children: ReactNode }) => {
    const [vehicleState, setState] = useState({
        renderCounter:1
    });
    log.info("initial state vehicle state set: ",vehicleState)

    return (
        <VehicleStateContext.Provider value={{vehicleState, setState}}>
            {children}
        </VehicleStateContext.Provider>
    );
};

const VehiclesApproachingStopsProvider = ({ children }: { children: ReactNode }) => {
    const [vehiclesApproachingStopsState, setVehiclesApproachingStopsState] = useState({
        renderCounter:1
    });
    log.info("initial state vehicle approaching state set: ",vehiclesApproachingStopsState)

    return (
        <VehiclesApproachingStopsContext.Provider value={{vehiclesApproachingStopsState: vehiclesApproachingStopsState, setVehiclesApproachingStopsState}}>
            {children}
        </VehiclesApproachingStopsContext.Provider>
    );
};


const shortenRoute = (routeId) => {
    // if string return last part, if AgencyAndId return id
    if(typeof routeId === "object"){
        return routeId.id;
    } 
    let routeIdParts = routeId.split("_");
    let routeIdWithoutAgency = routeIdParts[1];
    return routeIdWithoutAgency;
}

const vehicleDataIdentifier = "_vehicleData"
const serviceAlertDataIdentifier = "_serviceAlertData"
const updatedTimeIdentifier = "_updatedAt"
const stopSortedDataIdentifier = "_vehicleDataSortedByStop"
const stopSortedFutureVehicleDataIdentifier = "_stopSortedFutureVehicleDataIdentifier"

export { VehicleStateProvider,
    VehicleStateContext,
    VehiclesApproachingStopsProvider,
    VehiclesApproachingStopsContext,
    vehicleDataIdentifier,
    updatedTimeIdentifier,
    serviceAlertDataIdentifier,
    stopSortedDataIdentifier,
    stopSortedFutureVehicleDataIdentifier,
    shortenRoute};