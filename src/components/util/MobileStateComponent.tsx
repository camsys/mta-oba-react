import React, {createContext, ReactNode, useContext, useState} from "react";
import log from 'loglevel';

const MobileStateContext = createContext<{
    isMobile: boolean,
    setIsMobile: React.Dispatch<React.SetStateAction<boolean>>;
}|undefined>(undefined)

const MobileStateProvider = ({children} : {children:ReactNode}):JSX.Element =>{
    const [isMobile, setIsMobile] = useState<boolean>(false)

    return (<MobileStateContext.Provider value={{isMobile, setIsMobile}}>
        {children}
    </MobileStateContext.Provider>)
}

const useMobileState = () =>{
    const context = useContext(MobileStateContext)
    if (!context) {
        throw new Error("useMobileState must be used within MobileStateProvider")
    }
    return context
}

export {MobileStateContext, MobileStateProvider, useMobileState}
