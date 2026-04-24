import React, { useState } from 'react';
import log from 'loglevel';
import {MapComponent} from './MapComponent';
import ErrorBoundary from "../util/errorBoundary";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import RefreshComponent from "../views/RefreshComponent";
import {useContext} from "react";
import {useCardState} from "../util/CardStateComponent";
import {Card, CardType} from "../../js/updateState/DataModels";
import {useMapDisplayState} from "../util/MapDisplayStateComponent";
import {useSiri} from "../../js/updateState/getSiri.tx";
import {noMapNeededCardTypes} from "../../js/updateState/NavigationEffect";
import { useNavigation } from 'react-router';



export function MapWrapper  () : JSX.Element {

    const { mapIsOpen, setMapIsOpen } = useMapDisplayState()
    const { updateSiriRouteEffect } = useSiri()

    function mapToggle():null{
        const newMapOpenState = !mapIsOpen
        setMapIsOpen(newMapOpenState)
        // If opening the map, kick off updateSiriRouteEffect
        if (newMapOpenState) {
            updateSiriRouteEffect()
        }
        return null
    }

    const ariaLabel = () : string =>{
            return mapIsOpen ? 'Toggle Map Visibility (currently visible)' : 'Toggle Map Visibility (currently hidden)'
    }

    const { state } = useCardState();


    log.info("adding map-wrapper")
    return(
        <ErrorBoundary>
            <div id="map-wrap" className={noMapNeededCardTypes.includes(state.currentCard.type) ? "home" : ""}>
                <div className="bottom-buttons" id="map-trigger-wrap">
                    {noMapNeededCardTypes.includes(state.currentCard.type) ? null : <RefreshComponent extraClasses={" button"}/>}
                    <button id="map-toggle" className="button" aria-controls="map" aria-expanded={mapIsOpen} aria-pressed={mapIsOpen}
                            aria-label={ariaLabel()} onClick={mapToggle}><span className="label flex gap-1"><span className="hide-label">Hide </span>Map</span>
                    </button>
                </div>
                <ul className="map-legend">
                    <li className="real-time">Real Time</li>
                    <li className="scheduled">Estimated</li>
                </ul>
                <MapComponent/>
            </div>
        </ErrorBoundary>
)
}