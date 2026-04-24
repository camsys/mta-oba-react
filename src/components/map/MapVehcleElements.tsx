import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {LayerGroup, MapContainer, Marker, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useRef, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import log from 'loglevel';
import L, {LatLngBounds, LeafletEventHandlerFn} from "leaflet";

import {useCardState, useRoutes, useStops} from "../util/CardStateComponent";
import {vehicleDataIdentifier, useVehicleState, shortenRoute} from "../util/VehicleStateComponent";
import MapRouteComponent from "./MapRouteComponent";
import MapStopComponent from "./MapStopComponent";
import MapVehicleComponent from "./MapVehicleComponent";
import {
    AgencyAndId,
    CardType,
    MapRouteComponentInterface,
    MatchType,
    RouteMatch,
    StopInterface,
    StopMatch,
    VehicleRtInterface
} from "../../js/updateState/DataModels";

import { createVehicleMarker } from "../../utils/VehicleMarkerFactory";
import {useNavigation} from "../../js/updateState/NavigationEffect";

// this method is seperated because vehicleState updates often. that said i don't want it to trigger a rerender
export const MapVehicleElements = () =>{

    let {vehicleSearch} = useNavigation()
    const { state } = useCardState();
    const { vehicleState} = useVehicleState();
    const vehicleObjsRefs = useRef<Map<string, Map<string, L.Marker>>>(new Map());
    const showFocusVehicle = useRef(true)
    const lastCardWasNotVehicleView = useRef(state.currentCard.type !== CardType.VehicleCard)

    const vehicleLayer = useRef<L.LayerGroup<L.Marker>>(new L.LayerGroup());
    let map = useMap()
    const iconCache = useRef<Map<string, L.Icon>>(new Map());
    let shortenedRouteIds = new Set(Array.from(state.currentCard.routeIdList).map(shortenRoute));
    log.info("looking for vehicles from route ids: ",shortenedRouteIds)

    const popupOptions = useRef<L.PopupOptions>({
        className: "map-popup vehicle-popup",
        autoPan: false,
        keepInView: false,
        autoClose: false
    })

    const selectVehicle = (routeId:AgencyAndId,vehicleId:string,latlon:[number,number]) =>{
        // log.info("clicked on " + vehicleDatum.vehicleId)
        vehicleSearch(routeId,vehicleId)
    }

    const createVehicleIcon = (vehicleDatum):L.Icon => {
        let scheduled = vehicleDatum.hasRealtime?"":"scheduled/"
        let imgDegrees = vehicleDatum.bearing - vehicleDatum.bearing%5
        let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
        if(iconCache.current.has(vehicleImageUrl)){
            return iconCache.current.get(vehicleImageUrl) as L.Icon
        }
        let icon = L.icon({
            iconUrl: vehicleImageUrl,
            className: "svg-icon",
            iconSize: [51,51],
            iconAnchor: [25,25],
            popupAnchor: [0,0]
        })
        iconCache.current.set(vehicleImageUrl, icon)
        return icon
    }

    function handleVehicleForMap(vehicleDatum: VehicleRtInterface,vehicleMap: Map<string, L.Marker>) {
        // check if in map, if not add it, if so update it
        let vehicle = vehicleMap.get(vehicleDatum.vehicleId);
        if (vehicle) {
            if(vehicleDatum.longLat[0] !=vehicle.getLatLng().lat || vehicleDatum.longLat[1] != vehicle.getLatLng().lng){
                // update vehicle to be in new pos
                vehicle.setLatLng(vehicleDatum.longLat)
                vehicle.setIcon(createVehicleIcon(vehicleDatum))
                if(state.currentCard.type !== CardType.VehicleCard || vehicleDatum.vehicleId !== state.currentCard.datumId){
                    vehicle.closePopup()
                }
                log.trace("updated vehicle position",vehicleDatum.vehicleId,vehicleMap.get(vehicleDatum.vehicleId))
            }
        }
        else {
            log.info("adding vehicle to map",vehicleDatum.vehicleId,vehicleDatum)
            vehicle = createVehicleMarker(vehicleDatum,createVehicleIcon(vehicleDatum),popupOptions.current,3,map)
            vehicle.on("click", (e:L.LeafletMouseEvent) => {
                selectVehicle(AgencyAndId.get(vehicleDatum.routeId), vehicleDatum.vehicleId, [e.latlng.lat, e.latlng.lng]);
            });
            vehicle.on("keypress", (e:L.LeafletKeyboardEvent) => {
                if (e.originalEvent.key === 'Enter') {
                    selectVehicle(vehicleDatum.routeId, vehicleDatum.vehicleId, [vehicleDatum.longLat[0], vehicleDatum.longLat[1]]);
                }
            });
            vehicleMap.set(vehicleDatum.vehicleId, vehicle)
            vehicleLayer.current.addLayer(vehicle)
        }
    }

    function safeGetVehicle(routeId: string, vehicleId: string) {
        log.info("safeGetVehicle",routeId,vehicleId,vehicleObjsRefs.current)
        let out = vehicleObjsRefs.current.get(routeId)
        if (out && out!== undefined && out.has(vehicleId)) {
            let marker = out.get(vehicleId);
            if(marker && marker !== undefined){
                return marker;
            }
        }
        return null;
    }

    function openPopup(){
        // kept as an optional hook for future developement
    }

    useEffect(() => {
        // todo: if this was done just right it probably wouldn't hit the try catch
        try{
            if(shortenedRouteIds!=null){
                // clear out vehicles that are not in the routeIds
                vehicleObjsRefs.current.forEach((vehicleMap, routeId) => {
                    log.info("is routeId in vehicleMap", routeId, shortenedRouteIds, shortenedRouteIds.has(routeId));
                    if (shortenedRouteIds!==null && !shortenedRouteIds.has(routeId)) {
                        vehicleMap.forEach((vehicle, vehicleId) => {
                            log.info("removing vehicle from map", vehicleId, vehicleMap.get(vehicleId));
                            vehicleLayer.current.removeLayer(vehicle);
                            vehicle.removeFrom(map);
                        });
                        vehicleObjsRefs.current.delete(routeId);
                    } 
                });
                // handling vehicles on routes
                [...shortenedRouteIds].forEach(shortenedRouteId=>{
                    let vehicleDataForRoute = vehicleState[shortenedRouteId+vehicleDataIdentifier]
                    log.info("key:",shortenedRouteId+vehicleDataIdentifier,"vehicleState",vehicleState,"vehicleDataForRoute",vehicleDataForRoute)
                    if(vehicleDataForRoute!=null && vehicleObjsRefs.current!=undefined
                        && typeof vehicleObjsRefs.current === "object"
                        && typeof vehicleObjsRefs.current.get === 'function'){
                        log.info(`MapVehicleElements: processing vehicleDataForRoute`,vehicleDataForRoute,vehicleObjsRefs.current)
                        vehicleDataForRoute.forEach(vehicleDatum=>{
                            let vehicleRefForRoute = vehicleObjsRefs.current.get(shortenedRouteId)
                            if(vehicleRefForRoute == null || vehicleRefForRoute == undefined){
                                log.info("MapVehicleElements: creating new vehicle map for routeId",shortenedRouteId)
                                vehicleRefForRoute = new Map()
                                vehicleObjsRefs.current.set(shortenedRouteId, vehicleRefForRoute)
                            }
                            handleVehicleForMap(vehicleDatum, vehicleRefForRoute)
                        });


                        // remove vehicles that are no longer in the vehicle data for the route
                        const currentVehicleIds = new Set();
                        vehicleDataForRoute.forEach(v => currentVehicleIds.add(v.vehicleId));
                        const vehicleRefForRoute = vehicleObjsRefs.current.get(shortenedRouteId);

                        if (vehicleRefForRoute) {
                            vehicleRefForRoute.forEach((marker, vehicleId) => {
                                if (!currentVehicleIds.has(vehicleId)) {
                                    log.info("removing vehicle from map because it is no longer in vehicle data for route", 
                                        vehicleId, shortenedRouteId, vehicleRefForRoute.get(vehicleId), 
                                        vehicleDataForRoute, currentVehicleIds, vehicleRefForRoute);
                                    vehicleLayer.current.removeLayer(marker);
                                    marker.removeFrom(map);
                                    vehicleRefForRoute.delete(vehicleId);
                                }
                            });
                        }
                    }
                    log.info("MapVehicleElements: vehicleObjsRefs",vehicleObjsRefs.current)
                })
            }

            log.info("end of map vehicle elements creation, state, vehicleObjsRefs,lastCardWasNotVehicleView",state,vehicleObjsRefs.current,lastCardWasNotVehicleView)
            if(state.currentCard.type !== CardType.VehicleCard){
                lastCardWasNotVehicleView.current = true
            }
        }
        catch (e) {
            log.error("error in vehicle element creation",e)
        }
    }, [state.currentCard.routeIdList, vehicleState])



    useEffect(() => {
        log.info("map vehicle elements routeIds",shortenedRouteIds,vehicleObjsRefs.current)
        vehicleLayer.current.addTo(map)
        openPopup()
        log.info("map vehicle elements layer group ref",vehicleLayer.current,vehicleLayer.current.getLayers().length)
    }
    , [state])

    useMapEvents(
        {
            zoomend() {
                try {
                    openPopup()
                } catch (e) {
                    log.error("error in vehicle element creation", e)
                }
            }
        }
    )
}