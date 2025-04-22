import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {LayerGroup, MapContainer, Marker, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useRef, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import log from 'loglevel';
import L, {LatLngBounds} from "leaflet";

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
import MapSearchedHereComponent from "./MapSearchedHereComponent";
import {v4 as uuidv4} from "uuid";
import { createRoutePolyline } from "../../utils/RoutePolylineFactory";
import { createStopMarker } from "../../utils/StopMarkerFactory.ts";
import { createSearchedHereMarker } from "../../utils/SearchedHereFactory.ts";
import { createVehicleMarker } from "../../utils/VehicleMarkerFactory.ts";
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";

console.log("createRoutePolyline:", createRoutePolyline);
console.log("createStopMarker:", createStopMarker);
console.log("createSearchedHereMarker:", createSearchedHereMarker);
console.log("createVehicleMarker:", createVehicleMarker);

const createVehicleIcon = (vehicleDatum):L.Icon => {
    let scheduled = vehicleDatum.hasRealtime?"":"scheduled/"
    let imgDegrees = vehicleDatum.bearing - vehicleDatum.bearing%5
    let vehicleImageUrl = "img/vehicle/"+scheduled+"vehicle-"+imgDegrees+".png"
    let icon = L.icon({
        iconUrl: vehicleImageUrl,
        className: "svg-icon",
        iconSize: [51,51],
        iconAnchor: [25,25],
        popupAnchor: [0,0]
    })
    return icon
}

// this method is seperated because vehicleState updates often. that said i don't want it to trigger a rerender
export const MapVehicleElements = () =>{

    let {vehicleSearch} = useNavigation()
    const selectVehicle = (vehicleDatum :VehicleRtInterface) =>{
        // log.info("clicked on " + vehicleDatum.vehicleId)
        vehicleSearch(vehicleDatum)
    }

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

    let routeIds = state.currentCard.routeIdList
    log.info("looking for vehicles from route ids: ",routeIds)


    function shortenRoute(routeId: string) {
        let routeIdParts = routeId.split("_");
        let routeIdWithoutAgency = routeIdParts[1];
        return routeIdWithoutAgency;
    }

    function handleVehicleForMap(vehicleDatum: VehicleRtInterface,vehicleMap: Map<string, L.Marker>) {
        // check if in map, if not add it, if so update it
        if (vehicleMap.has(vehicleDatum.vehicleId)) {
            // update vehicle to be in new pos
            let vehicle = vehicleMap.get(vehicleDatum.vehicleId);
            vehicle.setLatLng(vehicleDatum.longLat)
            vehicle.setIcon(createVehicleIcon(vehicleDatum))
            vehicle.closePopup()
            log.info("updated vehicle position",vehicleDatum.vehicleId,vehicleMap.get(vehicleDatum.vehicleId))
        }
        else {
            vehicleMap.set(vehicleDatum.vehicleId,
                createVehicleMarker(vehicleDatum,selectVehicle))
            vehicleLayer.current.addLayer(vehicleMap.get(vehicleDatum.vehicleId))
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
            state.currentCard.routeIdList.forEach(routeId => {
                let vehicle = safeGetVehicle(shortenRoute(routeId), state.currentCard.datumId)
                if(vehicle){
                    log.info("open popup for vehicle",vehicle,vehicle.getLatLng())
                    vehicle?.openPopup()
                }
            })
        }
    }

    // todo: if this was done just right it probably wouldn't hit the try catch
    try{
        if(routeIds!=null){
            vehicleObjsRefs.current.forEach((vehicleMap, routeId) => {
                log.info("is routeId in vehicleMap", routeId, routeIds.has(routeId));
                if (routeIds!==null && !routeIds.has(routeId)) {
                    vehicleMap.forEach((vehicle, vehicleId) => {
                        log.info("removing vehicle from map", vehicleId, vehicleMap.get(vehicleId));
                        vehicleLayer.current.removeLayer(vehicle);
                        vehicle.removeFrom(map);
                    });
                    vehicleObjsRefs.current.delete(routeId);
                }
            });
            [...routeIds].forEach(route=>{
                let routeId = shortenRoute(route)
                let vehicleDataForRoute = vehicleState[routeId+vehicleDataIdentifier]
                log.info("key:",routeId+vehicleDataIdentifier,"vehicleState",vehicleState,"vehicleDataForRoute",vehicleDataForRoute)
                if(vehicleDataForRoute!=null && vehicleObjsRefs.current!=undefined
                    && typeof vehicleObjsRefs.current === "object"
                    && typeof vehicleObjsRefs.current.get === 'function'){
                    log.info(`MapVehicleElements: processing vehicleDataForRoute`,vehicleDataForRoute)
                    log.info("MapVehicleElements: vehicle object refs",vehicleObjsRefs.current)
                    vehicleDataForRoute.forEach(vehicleDatum=>{
                        vehicleDataForRoute = vehicleObjsRefs.current.get(routeId)
                        if(vehicleDataForRoute == null || vehicleDataForRoute == undefined){
                            log.info("MapVehicleElements: creating new vehicle map for routeId",routeId)
                            vehicleDataForRoute = new Map()
                            vehicleObjsRefs.current.set(routeId, vehicleDataForRoute)
                        }
                        handleVehicleForMap(vehicleDatum, vehicleDataForRoute)
                    });
                }
                log.info("vehicleObjsRefs",vehicleObjsRefs.current)
            })
        }
        openPopup()

        useEffect(() => {
            log.info("map vehicle elements routeIds",routeIds,vehicleObjsRefs.current)
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

        log.info("end of map vehicle elements creation, state, vehicleObjsRefs,lastCardWasNotVehicleView",state,vehicleObjsRefs.current,lastCardWasNotVehicleView)
        if(state.currentCard.type !== CardType.VehicleCard){
            lastCardWasNotVehicleView.current = true
        }
    }
    catch (e) {
        log.error("error in vehicle element creation",e)
    }
}