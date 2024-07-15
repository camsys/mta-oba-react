import React, { createContext, useState } from 'react';

const MapHighlightingStateContext = createContext();

const MapHighlightingStateProvider = ({children}) => {
    const [mapHighlightingState, setState] = useState({
        highlightedComponentId:""
    });

    return (
        <MapHighlightingStateContext.Provider value={{mapHighlightingState, setState}}>
            {children}
        </MapHighlightingStateContext.Provider>
    );
};

export { MapHighlightingStateProvider, MapHighlightingStateContext };