import log from 'loglevel';
import React, {useContext} from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import stopPopupIcon from "../../img/icon/bus-stop.svg"
import {useNavigation} from "../../js/updateState/NavigationEffect";
import {CardType, StopInterface} from "../../js/updateState/DataModels";
import {useCardState} from "../util/CardStateComponent";
import {useVehicleApproachingStops, stopSortedFutureVehicleDataIdentifier, updatedTimeIdentifier} from "../util/VehicleStateComponent";
import {VehicleRtInterface, RouteMatchDirectionInterface} from "../../js/updateState/DataModels";
import {VehicleComponentWithoutSearchSpecified} from "../views/VehicleComponent";
import { StopMatch } from '../../js/updateState/DataModels';
import { JSX } from 'react/jsx-runtime';
import { useServiceAlert } from '../views/ServiceAlertContainerComponent';
import { ServiceAlertSvg } from '../views/ServiceAlertContainerComponent';
import { LeftExpands } from '../shared/common';

const COMPONENT_IDENTIFIER = "mapStopComponent"
const MAX_VEHICLES_PER_DESTINATION = 2;

function SelectedStopComponent({selectedElementLocation}: {selectedElementLocation: React.MutableRefObject<{lat:number, lng:number}|null>}): JSX.Element {
    const { state } = useCardState();
    const { vehiclesApproachingStopsState } = useVehicleApproachingStops()
    const { vehicleSearch } = useNavigation()
    let {getServiceAlert} = useServiceAlert();
    
    const popupOptions: L.PopupOptions = {
        autoPan: false,
        keepInView: false,
        autoClose: false
    }

    if (state.currentCard.type !== CardType.StopCard) {
        return <></>
    }

    const StopDirectionData = ({
        routeDirectionDatum,
        stopId
    }: { routeDirectionDatum: RouteMatchDirectionInterface; stopId: string }): JSX.Element | null => {
        const routeAndDir = routeDirectionDatum.datumId.toString() + "_" + routeDirectionDatum.directionId;
        const routeId = routeDirectionDatum.datumId.id;

        let stopCardVehicleData = vehiclesApproachingStopsState[routeAndDir + stopSortedFutureVehicleDataIdentifier];

        // todo: should map with datumId instead of string keys
        stopCardVehicleData = typeof stopCardVehicleData !== 'undefined' && stopCardVehicleData.has(stopId.toString())
            ? stopCardVehicleData.get(stopId.toString())
            : null;

        log.trace("StopDirectionData for stopId: ", stopId.toString(), " routeAndDir: ", routeAndDir, " has vehicle data? ", stopCardVehicleData, vehiclesApproachingStopsState[routeAndDir + stopSortedFutureVehicleDataIdentifier])

        
        let id = routeDirectionDatum.datumId.id;
        let serviceAlertIdentifier = routeDirectionDatum.datumId.toString();
        let hasServiceAlert = getServiceAlert({abbreviatedRouteId: id, routeAgencyAndId: routeDirectionDatum.routeId.toString(), routeAndDirection: routeAndDir})!==null 
        if (stopCardVehicleData === null) {
            return (
                <></>
            )
        }

        // Group vehicles by destination
        const vehicleDataByDestination = new Map<string, Array<VehicleRtInterface>>();
        stopCardVehicleData.forEach((vehicleDatum: VehicleRtInterface) => {
            const destination = vehicleDatum.destination;
            if (vehicleDataByDestination.has(destination)) {
                vehicleDataByDestination.get(destination)!.push(vehicleDatum);
            } else {
                vehicleDataByDestination.set(destination, [vehicleDatum]);
            }
        });

        return (
            <div className={`map-popup-content`}>
                <div>
                    {Array.from(vehicleDataByDestination.entries()).map(([destination, vehicles]) => (
                        <div key={destination}>
                            <LeftExpands>
                                <LeftExpands.Main>
                                    <span className="label" style={{ borderColor: '#' + routeDirectionDatum.color }}>
                                        <strong>{routeId}</strong> {destination}
                                    </span>
                                </LeftExpands.Main>
                                <LeftExpands.Side className='gap-1'>
                                    {hasServiceAlert &&
                                            (<>
                                                <ServiceAlertSvg className='w-4 h-4'/> 
                                                <span className='text-[#D91A1A]'>Alert</span>
                                            </>)
                                    }
                                </LeftExpands.Side>
                            </LeftExpands>
                            <ul className="approaching-buses">
                                {vehicles.slice(0, MAX_VEHICLES_PER_DESTINATION).map((vehicle) => (
                                    <VehicleComponentWithoutSearchSpecified
                                        key={vehicle.vehicleId}
                                        vehicleDatum={vehicle}
                                        tabbable={true}
                                        vehicleSearchFunction={vehicleSearch}
                                    />
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const stopMarkers: JSX.Element[] = [];

    state.currentCard.searchMatches.forEach(searchMatch => {
        if (searchMatch instanceof StopMatch) {
            const stopId = searchMatch.datumId;
            const stopDatum = searchMatch as StopInterface;
            const direction = stopDatum?.stopDirection ?? "unknown";
            const stopImageUrl = `img/stop/stop-${direction}-active.png`;

            const icon = L.icon({
                iconUrl: stopImageUrl,
                className: "svg-icon",
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, 0]
            });

            const markerOptions = {
                position: stopDatum.longLat,
                icon: icon,
                zIndexOffset: 1000,
                title: stopDatum.name,
                stopId: stopDatum.id,
                key: `${COMPONENT_IDENTIFIER}_${stopDatum.id}`,
                id: `${COMPONENT_IDENTIFIER}_${stopDatum.id}`,
                keyboard: true
            };

            stopMarkers.push(
                <Marker key={markerOptions.key} {...markerOptions} eventHandlers={{
                    add: (e) => e.target.openPopup(),
                }}>
                    <Popup className="map-popup stop-popup"  {...popupOptions}>
                        <div className="popup-header">
                            <div className="popup-header-info">
                                <img src={stopPopupIcon} alt="busstop icon" className="icon" />
                                <div className="popup-info">
                                    <span className="name">{stopDatum.name}</span>
                                    <span className="stop-code">{"Stopcode " + stopDatum.id.id}</span>
                                </div>
                            </div>
                            <strong className="buses-en-route">Buses en-route:</strong>
                        </div>
                        <div className='route-directions'>
                            {searchMatch.routeMatches.some(route => 
                                route.directions.some(dir => {
                                    const routeAndDir = dir.routeId + "_" + dir.directionId;
                                    const stopCardVehicleData = vehiclesApproachingStopsState[routeAndDir + stopSortedFutureVehicleDataIdentifier];
                                    return stopCardVehicleData?.has(stopId);
                                })
                            ) ? (
                                searchMatch.routeMatches.map((route, routeIdx) =>
                                    route.directions.map((dir, dirIdx) => (
                                        <StopDirectionData
                                            key={`${routeIdx}-${dirIdx}`}
                                            stopId={stopId}
                                            routeDirectionDatum={dir}
                                        />
                                    ))
                                )
                            ) : (
                                <div className="no-vehicles">No approaching vehicles</div>
                            )}
                        </div>
                        <button className="view-full close-map" aria-label="view full stop details">
                            View Stop Details
                        </button>
                    </Popup>
                </Marker>
            );
        }
    });

    log.info("SelectedStopComponent generated stop markers: ", stopMarkers, "selectedElement: ", selectedElementLocation);
    selectedElementLocation.current = stopMarkers.length > 0 ? {lat: stopMarkers[0].props.position[0], lng: stopMarkers[0].props.position[1]} : null;
    log.info("SelectedStopComponent updated selectedElementLocation to: ", selectedElementLocation.current);

    return stopMarkers.length > 0 ? <>{stopMarkers}</> : <></>;
}

export { SelectedStopComponent };

