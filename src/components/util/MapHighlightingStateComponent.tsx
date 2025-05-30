import React, {createContext, useContext, useState} from 'react';
import log from 'loglevel';

const MapHighlightingStateContext = createContext({});

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

const useHighlight = () =>{
    const { mapHighlightingState, setHighlightingState } = useContext(MapHighlightingStateContext);
    const highlightId = (id:string) =>{
        log.info("highlighting: ", id);
        if (mapHighlightingState.highlightedComponentId !== id) {
            setHighlightingState((prevState) => ({
                highlightedComponentId: id,
            }));
        }
    }

    const getHighlightedId = () =>{
        return mapHighlightingState.highlightedComponentId
    }
    
    return {highlightId,getHighlightedId}
} 

export { MapHighlightingStateProvider, MapHighlightingStateContext,useHighlight };