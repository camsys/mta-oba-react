import React, {createContext, ReactNode, useContext, useState} from "react";
import log from 'loglevel';

const MapDisplayStateContext = createContext<{
    mapIsOpen: boolean,
    setMapIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}|undefined>(undefined)

const MapDisplayStateProvider = ({children} : {children:ReactNode}):JSX.Element =>{
    const [mapIsOpen, setMapIsOpen] = useState<boolean>(false)

    return (<MapDisplayStateContext.Provider value={{mapIsOpen, setMapIsOpen}}>
        {children}
    </MapDisplayStateContext.Provider>)
}

const useMapDisplayState = () =>{
    const context = useContext(MapDisplayStateContext)
    if (!context) {
        throw new Error("useMapDisplayState must be used within MapDisplayStateProvider")
    }
    return context
}

export {MapDisplayStateContext, MapDisplayStateProvider, useMapDisplayState}
