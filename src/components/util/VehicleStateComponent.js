import React, { createContext, useState } from 'react';

const VehicleStateContext = createContext();

const VehicleStateProvider = ({children}) => {
    const [vehicleState, setState] = useState({
        mapVehicleComponents: [],
        routeVehicleComponents: [],
        renderCounter:1
    });
    console.log("initial state set: ",vehicleState)

    return (
        <VehicleStateContext.Provider value={{vehicleState, setState}}>
            {children}
        </VehicleStateContext.Provider>
    );
};

export { VehicleStateProvider, VehicleStateContext };