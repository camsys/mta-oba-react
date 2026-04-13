import React, { createContext, useState , ReactNode, useContext} from 'react';
import log from 'loglevel';
import { VehicleStateObject, AgencyAndId} from '../../js/updateState/DataModels';











const VehicleStateContext = createContext<
    {vehicleState: VehicleStateObject; setState: React.Dispatch<React.SetStateAction<VehicleStateObject>>;} | undefined>(undefined);
    
const VehiclesApproachingStopsContext = createContext<
    {vehiclesApproachingStopsState: VehicleStateObject; setVehiclesApproachingStopsState: React.Dispatch<React.SetStateAction<VehicleStateObject>>;} | undefined>(undefined);
//todo: should be broken out into two states based on features which change and do not change
// eg. vehicle position vs vehicle features



const VehicleStateProvider = ({ children }: { children: ReactNode }) : JSX.Element => {
    const [vehicleState, setState] = useState<VehicleStateObject>({
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
        <VehiclesApproachingStopsContext.Provider value={{vehiclesApproachingStopsState, setVehiclesApproachingStopsState}}>
            {children}
        </VehiclesApproachingStopsContext.Provider>
    );
};

const useVehicleState = () => {
    const context = useContext(VehicleStateContext);
    if (context === undefined) {
        throw new Error('useVehicleState must be used within a VehicleStateProvider');
    }
    return context;
}

const useVehicleApproachingStops = () => {
    const context = useContext(VehiclesApproachingStopsContext);
    if (context === undefined) {
        throw new Error('useVehicleApproachingStops must be used within a VehiclesApproachingStopsProvider');
    }
    return context;
}


const shortenRoute = (routeId:AgencyAndId | string) => {
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
    useVehicleState,
    VehiclesApproachingStopsProvider,
    VehiclesApproachingStopsContext,
    useVehicleApproachingStops,
    vehicleDataIdentifier,
    updatedTimeIdentifier,
    serviceAlertDataIdentifier,
    stopSortedDataIdentifier,
    stopSortedFutureVehicleDataIdentifier,
    shortenRoute};