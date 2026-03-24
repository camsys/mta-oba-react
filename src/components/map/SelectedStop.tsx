import React, { useContext, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import log from 'loglevel';
import { CardStateContext} from "../util/CardStateComponent";
import { RouteMatchDirectionInterface, VehicleRtInterface } from "../../js/updateState/DataModels";
import { renderToString } from 'react-dom/server';
import { StopMatch, CardType } from "../../js/updateState/DataModels";
import {VehicleComponentWithoutSearchSpecified} from "../views/VehicleComponent";
import { OBA } from "../../js/oba";
import { createStopMarker } from "../../utils/StopMarkerFactory.ts";
import {stopSortedFutureVehicleDataIdentifier, updatedTimeIdentifier,
    vehicleDataIdentifier, shortenRoute, VehicleStateContext, 
    VehiclesApproachingStopsContext} from "../util/VehicleStateComponent";
import {useNavigation} from "../../js/updateState/NavigationEffect";

// this componenet is hot garbage and duplicates a lot of code but there is strong time pressure rn




export const SelectedStop = () : JSX.Element =>{
    const { state} = useContext(CardStateContext);
    const {vehiclesApproachingStopsState} = useContext(VehiclesApproachingStopsContext)
    let {vehicleSearch} = useNavigation()

    const selectedElementLayer = useRef<L.LayerGroup<L.Marker>>(new L.LayerGroup());
    selectedElementLayer.current.id = "selectedElementLayer";
    const selectedStops = useRef<L.Marker[]>([]);
    const selectedStopPopupRef = useRef<JSX.Element|null>(null);
    let map = useMap()






    const popupOptions = useRef<L.PopupOptions>({
        className: "map-popup vehicle-popup",
        autoPan: false,
        keepInView: false,
        autoClose: false
    })

    const iconCache = useRef<Map<string, L.Icon>>(new Map());

    const createStopIcon = (stopDatum):L.Icon => {
        const directionKey = stopDatum?.stopDirection || "unknown";
        const stopImageUrl = `img/stop/stop-${directionKey}.png`;
        if(iconCache.current.has(stopImageUrl)){
            return iconCache.current.get(stopImageUrl) as L.Icon
        }
        const icon = L.icon({
            iconUrl: stopImageUrl,
            className: "svg-icon",
            iconSize: [27, 27],
            iconAnchor: [13, 13],
            popupAnchor: [0, 0],
        });
        iconCache.current.set(stopImageUrl, icon)
        return icon
    }

    interface SelectedStopPopupContentProps {
        routeDirectionDatum: RouteMatchDirectionInterface;
        stopCardVehicleData: Map<string, VehicleRtInterface> | null;
        routeId: string;
    }


    const SelectedStopPopupContent = ({
        routeDirectionDatum,
        stopCardVehicleData,
        routeId
    }: SelectedStopPopupContentProps): JSX.Element | null => {

        // adding logging

        log.info("SelectedStopPopupContent rendering", { routeDirectionDatum, stopCardVehicleData, routeId });
        // Group vehicles by destination
        const vehicleDataByDestination = new Map<string, Array<VehicleRtInterface>>();
        if (stopCardVehicleData !== null) {
            stopCardVehicleData.forEach((vehicleDatum: VehicleRtInterface) => {
                if (vehicleDataByDestination.has(vehicleDatum.destination)) {
                    vehicleDataByDestination.get(vehicleDatum.destination)!.push(vehicleDatum);
                } else {
                    vehicleDataByDestination.set(vehicleDatum.destination, [vehicleDatum]);
                }
            });
        }

        log.info("SelectedStopPopupContent vehicleDataByDestination", Array.from(vehicleDataByDestination.entries()));
        // If no vehicle data, show minimal info
        if (stopCardVehicleData === null) {
            return null;
        }

        return(
            <div className="map-popup-content" >
                <div style={{ borderColor: '#' + routeDirectionDatum.color, paddingLeft: '8px', borderLeft: '4px solid' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        {/* {hasServiceAlert && <ServiceAlertSvg />} */}
                        <strong>{routeId}</strong>
                    </div>
                    {Array.from(vehicleDataByDestination.entries()).slice(0, 1).map(([destination, vehicles]) => (
                        <div key={destination} style={{ fontSize: '0.9em', marginBottom: '8px' }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>{destination}</div>
                            {vehicles.slice(0, 2).map((vehicle) => (
                                <VehicleComponentWithoutSearchSpecified key={vehicle.vehicleId} vehicleDatum={vehicle} tabbable={0} vehicleSearchFunction={vehicleSearch}  />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };




    const updateStopCardStopMarkerPopup = () =>{
        if(state.currentCard.type===CardType.StopCard) {
            selectedStops.current.forEach((value, key) => {
                let lastRouteDirectionDatum = null;
                if (value !== null && value !== undefined) {
                    //fill in the rest of routeDirection info
                    // SelectedStop()
                    state.currentCard.searchMatches.forEach(searchMatch => {
                        let dirs = []
                        if (searchMatch instanceof StopMatch){
                            let stopId = searchMatch.datumId;
                            searchMatch.routeMatches.map(
                                route=>route.directions.map(
                                    dir => {
                                        // adding logging to this section to debug popup content updates
                                        let routeDirectionDatum = dir.routeDirectionComponentData

                                        const routeAndDir = routeDirectionDatum.routeId + "_" + routeDirectionDatum.directionId;
                                        const routeId = routeDirectionDatum.routeId.split("_")[1];
                                        
                                        let stopCardVehicleData = vehiclesApproachingStopsState[routeAndDir + stopSortedFutureVehicleDataIdentifier];
                                        
                                        stopCardVehicleData = typeof stopCardVehicleData !== 'undefined' && stopCardVehicleData.has(stopId)
                                            ? stopCardVehicleData.get(stopId)
                                            : null;

                                        log.info("SelectedStopPopupContent: stopCardVehicleData for popup", { stopId, routeAndDir, stopCardVehicleData });

                                        const updateTimeStr = vehiclesApproachingStopsState[routeAndDir + updatedTimeIdentifier] as any;
                                        const lastUpdateTime = stopCardVehicleData !== null && updateTimeStr
                                            ? OBA.Util.ISO8601StringToDate(updateTimeStr)?.getTime?.()
                                            : null;
                                        dirs.push(<SelectedStopPopupContent 
                                            stopCardVehicleData={stopCardVehicleData}
                                            routeId={routeId}
                                            routeDirectionDatum={routeDirectionDatum}/>)
                                    }
                                )
                            )
                            log.info("SelectedStopPopupContent: dirs for popup", { stopId, dirs });
                            value.setPopupContent(
                                renderToString(<div>{dirs}</div>)
                                );
                            value.openPopup();
                        }
                    })

                    selectedStops.current.forEach((value, key) => {
                        if (value !== null && value !== undefined) {
                            selectedElementLayer.current.addLayer(value);
                            value.openPopup();
                        }
                    });
                }
            });
        }
    }

    const openPopup = () =>{
        try{
            log.info("opening popups for selected elements")
            selectedElementLayer.current.eachLayer((layer) => {
                if(layer instanceof L.Marker) {
                    layer.openPopup();
                }
            });
        } catch (e) {
            log.error("error adding stable popups",e)
        }
    }

    const clearStopLayer = () =>{
        selectedElementLayer.current.eachLayer((layer) => {
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                layer.removeFrom(map);
            }
        });
        selectedStops.current.forEach((value, key) => {value.removeFrom(map)});
        selectedStops.current = [];
        selectedElementLayer.current.clearLayers();
    }

    const handleCardChange =() =>{
        clearStopLayer()
        if(state.currentCard.type===CardType.StopCard) {
            state.currentCard.searchMatches.forEach(searchMatch => {
                if (searchMatch instanceof StopMatch){
                    selectedStops.current.push(
                        createStopMarker(
                            searchMatch,
                            function(){},
                            popupOptions.current,
                            createStopIcon(searchMatch),
                            0
                        )
                    )
                }
            })
            selectedStops.current.forEach(stop => {
                selectedElementLayer.current.addLayer(stop);
            });
            updateStopCardStopMarkerPopup()
            selectedElementLayer.current.addTo(map);
            openPopup();
        }
    }

    useEffect(() => {
        log.info("selected stop component updating stop marker popup content",state.currentCard,vehiclesApproachingStopsState)
        updateStopCardStopMarkerPopup()
    }, [vehiclesApproachingStopsState])

    useEffect(() => {
        log.info("selected stop component updating map layers",state.renderCounter)
        handleCardChange()
    }, [state.renderCounter])

    return <></>
    
}

