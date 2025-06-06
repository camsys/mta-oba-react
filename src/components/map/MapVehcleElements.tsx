import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {LayerGroup, MapContainer, Marker, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useRef, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import log from 'loglevel';
import L, {LatLngBounds, LeafletEventHandlerFn} from "leaflet";

import {CardStateContext, RoutesContext, StopsContext} from "../util/CardStateComponent.tsx";
import {vehicleDataIdentifier, VehicleStateContext} from "../util/VehicleStateComponent";
import MapRouteComponent from "./MapRouteComponent";
import MapStopComponent from "./MapStopComponent";
import MapVehicleComponent from "./MapVehicleComponent";
import {
    CardType,
    MapRouteComponentInterface,
    MatchType,
    RouteMatch,
    StopInterface,
    StopMatch,
    VehicleRtInterface
} from "../../js/updateState/DataModels";
import { createRoutePolyline } from "../../utils/RoutePolylineFactory";
import { createStopMarker } from "../../utils/StopMarkerFactory.ts";
import { createSearchedHereMarker } from "../../utils/SearchedHereFactory.ts";
import { createVehicleMarker } from "../../utils/VehicleMarkerFactory.ts";
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";

log.info("createRoutePolyline:", createRoutePolyline);
log.info("createStopMarker:", createStopMarker);
log.info("createSearchedHereMarker:", createSearchedHereMarker);
log.info("createVehicleMarker:", createVehicleMarker);

// this method is seperated because vehicleState updates often. that said i don't want it to trigger a rerender
export const MapVehicleElements = () =>{

    let {vehicleSearch} = useNavigation()
    const cardStateContext = useContext(CardStateContext);
    if (!cardStateContext) {
        throw new Error("CardStateContext is undefined. Ensure the provider is correctly set up.");
    }
    const { state } = cardStateContext;
    const { vehicleState} = useContext(VehicleStateContext);
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

    const selectVehicle = (routeId:string,vehicleId:string,latlon:[number,number]) =>{
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

    function shortenRoute(routeId: string) {
        let routeIdParts = routeId.split("_");
        let routeIdWithoutAgency = routeIdParts[1];
        return routeIdWithoutAgency;
    }

    function handleVehicleForMap(vehicleDatum: VehicleRtInterface,vehicleMap: Map<string, L.Marker>) {
        // check if in map, if not add it, if so update it
        let vehicle = vehicleMap.get(vehicleDatum.vehicleId);
        if (vehicle) {
            if(vehicleDatum.longLat[0] !=vehicle.getLatLng().lat, vehicleDatum.longLat[1] != vehicle.getLatLng().lng){
                // update vehicle to be in new pos
                vehicle.setLatLng(vehicleDatum.longLat)
                vehicle.setIcon(createVehicleIcon(vehicleDatum))
                if(state.currentCard.type !== CardType.VehicleCard || vehicleDatum.vehicleId !== state.currentCard.datumId){
                    vehicle.closePopup()
                }
                log.info("updated vehicle position",vehicleDatum.vehicleId,vehicleMap.get(vehicleDatum.vehicleId))
            }
        }
        else {
            log.info("adding vehicle to map",vehicleDatum.vehicleId,vehicleDatum)
            vehicle = createVehicleMarker(vehicleDatum,createVehicleIcon(vehicleDatum),popupOptions.current)
            vehicle.on("click", (e:L.LeafletMouseEvent) => {
                selectVehicle(vehicleDatum.routeId, vehicleDatum.vehicleId, [e.latlng.lat, e.latlng.lng]);
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
        if (state.currentCard.type === CardType.VehicleCard)
        {
            shortenedRouteIds.forEach(routeId => {
                let vehicle = safeGetVehicle(routeId, state.currentCard.datumId)
                if(vehicle){
                    log.info("open popup for vehicle",vehicle,vehicle.getLatLng())
                    vehicle?.openPopup()
                }
            })
        }
    }

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