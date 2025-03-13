import React, { useState } from 'react';
import log from 'loglevel';
import {MapComponent} from './MapComponent';
import ErrorBoundary from "../util/errorBoundary";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import RefreshComponent from "../views/RefreshComponent";
import {useContext} from "react";
import {CardStateContext} from "../util/CardStateComponent.tsx";
import {Card, CardType} from "../../js/updateState/DataModels";





export function MapWrapper  () : JSX.Element {


    const [mapVisible,setMapVisible] = useState(false)

    function mapToggle():null{
        setMapVisible(!mapVisible)
    }

    const ariaLabel = () : string =>{
            return mapVisible ? 'Toggle Map Visibility (currently visible)' : 'Toggle Map Visibility (currently hidden)'
    }

    const { state } = useContext(CardStateContext);


    log.info("adding map-wrapper")
    return(
        <ErrorBoundary>
            <div id="map-wrap" className={state.currentCard.type === CardType.HomeCard ? "home" : ""}>
                <div className="bottom-buttons" id="map-trigger-wrap">
                    {state.currentCard.type === CardType.HomeCard ? null : <RefreshComponent extraClasses={" button"}/>}
                    <button id="map-toggle" className="button" aria-controls="map" aria-expanded={mapVisible} aria-pressed={mapVisible}
                            aria-label={ariaLabel} onClick={mapToggle}><span className="label"><span className="hide-label">Hide </span>Map</span>
                    </button>
                </div>
                <MapComponent/>
            </div>
        </ErrorBoundary>
)
}