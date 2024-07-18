import React, { createContext, useState } from 'react';

const VehicleStateContext = createContext();


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

const vehicleDataIdentifier = "_vehicleData"
const serviceAlertDataIdentifier = "_serviceAlertData"

export { VehicleStateProvider, VehicleStateContext,vehicleDataIdentifier,serviceAlertDataIdentifier };