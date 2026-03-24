import log from 'loglevel';
import React, {useContext} from "react";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import stopPopupIcon from "../../img/icon/bus-stop.svg"
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";
import {CardType, StopInterface} from "../../js/updateState/DataModels.ts";
import {CardStateContext} from "../util/CardStateComponent.tsx";
import {VehiclesApproachingStopsContext, stopSortedFutureVehicleDataIdentifier, updatedTimeIdentifier} from "../util/VehicleStateComponent.js";
import {VehicleRtInterface, RouteMatchDirectionInterface} from "../../js/updateState/DataModels.ts";
import {VehicleComponentWithoutSearchSpecified} from "../views/VehicleComponent.tsx";
import { StopMatch } from '../../js/updateState/DataModels.ts';
import { OBA } from '../../js/oba.js';
import { JSX } from 'react/jsx-runtime';

const COMPONENT_IDENTIFIER = "mapStopComponent"
const MAX_DESTINATIONS = 1;
const MAX_VEHICLES_PER_DESTINATION = 2;

function SelectedStopComponent(): JSX.Element {
    const { state } = useContext(CardStateContext);
    const { vehiclesApproachingStopsState } = useContext(VehiclesApproachingStopsContext)
    const { vehicleSearch } = useNavigation()

    const popupOptions: L.PopupOptions = {
        className: "map-popup vehicle-popup",
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
        const routeAndDir = routeDirectionDatum.routeId + "_" + routeDirectionDatum.directionId;
        const routeId = routeDirectionDatum.routeId.split("_")[1];

        let stopCardVehicleData = vehiclesApproachingStopsState[routeAndDir + stopSortedFutureVehicleDataIdentifier];

        stopCardVehicleData = typeof stopCardVehicleData !== 'undefined' && stopCardVehicleData.has(stopId)
            ? stopCardVehicleData.get(stopId)
            : null;

        if (stopCardVehicleData === null) {
            return (
                <div className="map-popup-content">
                    <div style={{ borderColor: '#' + routeDirectionDatum.color }}>
                        <strong>{routeId}</strong>
                        <div>No approaching vehicles</div>
                    </div>
                </div>
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
            <div className="map-popup-content">
                <div style={{ borderColor: '#' + routeDirectionDatum.color }}>
                    <strong>{routeId}</strong>
                    {Array.from(vehicleDataByDestination.entries()).slice(0, MAX_DESTINATIONS).map(([destination, vehicles]) => (
                        <div key={destination}>
                            <div>{destination}</div>
                            {vehicles.slice(0, MAX_VEHICLES_PER_DESTINATION).map((vehicle) => (
                                <VehicleComponentWithoutSearchSpecified
                                    key={vehicle.vehicleId}
                                    vehicleDatum={vehicle}
                                    tabbable={0}
                                    vehicleSearchFunction={vehicleSearch}
                                />
                            ))}
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
                keyboard: false
            };

            stopMarkers.push(
                <Marker key={markerOptions.key} {...markerOptions} eventHandlers={{
                    add: (e) => e.target.openPopup(),
                }}>
                    <Popup className="map-popup stop-popup" tabIndex={-1} {...popupOptions}>
                        <img src={stopPopupIcon} alt="busstop icon" className="icon" />
                        <div className="popup-info">
                            <span className="name">{stopDatum.name}</span>
                            <span className="stop-code">{"Stopcode " + stopDatum.id.split("_")[1]}</span>
                            <div className='route-directions'>
                                {searchMatch.routeMatches.map((route, routeIdx) =>
                                    route.directions.map((dir, dirIdx) => (
                                        <StopDirectionData
                                            key={`${routeIdx}-${dirIdx}`}
                                            stopId={stopId}
                                            routeDirectionDatum={dir}
                                        />
                                    ))
                                )}
                            </div>
                            <button className="view-full close-map" aria-label="view full stop details">
                                View Stop Details
                            </button>
                        </div>
                    </Popup>
                </Marker>
            );
        }
    });

    return stopMarkers.length > 0 ? <>{stopMarkers}</> : <></>;
}

export { SelectedStopComponent };

