import React, {createContext, useContext, useState, ReactNode} from 'react';
import log from 'loglevel';
import { AgencyAndId } from '../../js/updateState/DataModels';

interface MapHighlightingState {
    highlightedComponentId: AgencyAndId | null;
}

const MapHighlightingStateContext = createContext<{
    mapHighlightingState: MapHighlightingState;
    setHighlightingState: React.Dispatch<React.SetStateAction<MapHighlightingState>>;
} | undefined>(undefined);

const MapHighlightingStateProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const [mapHighlightingState, setHighlightingState] = useState<MapHighlightingState>({
        highlightedComponentId: null
    });

    return (
        <MapHighlightingStateContext.Provider value={{mapHighlightingState, setHighlightingState}}>
            {children}
        </MapHighlightingStateContext.Provider>
    );
};

const useHighlight = () => {
    const context = useContext(MapHighlightingStateContext);
    if (!context) {
        throw new Error('useHighlight must be used within MapHighlightingStateProvider');
    }
    const { mapHighlightingState, setHighlightingState } = context;
    
    const highlightId = (id: AgencyAndId | null): void => {
        log.info("highlighting: ", id);
        if (mapHighlightingState.highlightedComponentId !== id) {
            setHighlightingState((prevState) => ({
                highlightedComponentId: id,
            }));
        }
    };

    const getHighlightedId = (): AgencyAndId | null=> {
        return mapHighlightingState.highlightedComponentId;
    };
    
    return { highlightId, getHighlightedId };
};

export { MapHighlightingStateProvider, MapHighlightingStateContext, useHighlight };