import React, {createContext, useContext, useState, ReactNode} from 'react';
import log from 'loglevel';

interface MapHighlightingState {
    highlightedComponentId: string;
}

const MapHighlightingStateContext = createContext<{
    mapHighlightingState: MapHighlightingState;
    setHighlightingState: React.Dispatch<React.SetStateAction<MapHighlightingState>>;
} | undefined>(undefined);

const MapHighlightingStateProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const [mapHighlightingState, setHighlightingState] = useState<MapHighlightingState>({
        highlightedComponentId: ""
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
    
    const highlightId = (id: string): void => {
        log.info("highlighting: ", id);
        if (mapHighlightingState.highlightedComponentId !== id) {
            setHighlightingState((prevState) => ({
                highlightedComponentId: id,
            }));
        }
    };

    const getHighlightedId = (): string => {
        return mapHighlightingState.highlightedComponentId;
    };
    
    return { highlightId, getHighlightedId };
};

export { MapHighlightingStateProvider, MapHighlightingStateContext, useHighlight };