import React, { createContext, useState } from 'react';

const MapHighlightingStateContext = createContext();

const MapHighlightingStateProvider = ({children}) => {
    const [mapHighlightingState, setHighlightingState] = useState({
        highlightedComponentId:""
    });

    return (
        <MapHighlightingStateContext.Provider value={{mapHighlightingState, setHighlightingState}}>
            {children}
        </MapHighlightingStateContext.Provider>
    );
};

export { MapHighlightingStateProvider, MapHighlightingStateContext };