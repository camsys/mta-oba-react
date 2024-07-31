import React, { createContext, useState } from 'react';

const VehicleStateContext = createContext();
const VehiclesApproachingStopsContext = createContext();


//todo: should be broken out into two states based on features which change and do not change
// eg. vehicle position vs vehicle features
const VehicleStateProvider = ({children}) => {
    const [vehicleState, setState] = useState({
        renderCounter:1
    });
    console.log("initial state set: ",vehicleState)

    return (
        <VehicleStateContext.Provider value={{vehicleState, setState}}>
            {children}
        </VehicleStateContext.Provider>
    );
};

const VehiclesApproachingStopsProvider = ({children}) => {
    const [vehiclesApproachingStopsState, setVehiclesApproachingStopsState] = useState({
        renderCounter:1
    });
    console.log("initial state set: ",vehiclesApproachingStopsState)

    return (
        <VehiclesApproachingStopsContext.Provider value={{vehiclesApproachingStopsState: vehiclesApproachingStopsState, setVehiclesApproachingStopsState}}>
            {children}
        </VehiclesApproachingStopsContext.Provider>
    );
};

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
    stopSortedFutureVehicleDataIdentifier};