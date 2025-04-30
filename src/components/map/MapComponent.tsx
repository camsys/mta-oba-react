import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import {LayerGroup, MapContainer, Marker, useMap, useMapEvents} from "react-leaflet";
import React, {useContext, useEffect, useRef, useState} from "react";
import queryString from "query-string";
import {OBA} from "../../js/oba";
import log from 'loglevel';
import L, {LatLngBounds, layerGroup} from "leaflet";

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
import {useHighlight} from "Components/util/MapHighlightingStateComponent";
import {v4 as uuidv4} from "uuid";
import {useLongPressSearch} from "../../js/handlers/LongPressSearchHandler";
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";
import { createRoutePolyline } from "../../utils/RoutePolylineFactory";
import { createStopMarker } from "../../utils/StopMarkerFactory.ts";
import { createSearchedHereMarker } from "../../utils/SearchedHereFactory.ts";
import { createVehicleMarker } from "../../utils/VehicleMarkerFactory.ts";
import { MapVehicleElements } from "./MapVehcleElements.tsx";

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


const loadPopup = (datumId,leafletRefObjs) :void=>{
    try{
        if(leafletRefObjs && typeof leafletRefObjs.current.get(datumId)!=='undefined'
            && leafletRefObjs.current.get(datumId)!==null
            && leafletRefObjs.current.get(datumId).getPopup()
            && leafletRefObjs.current.get(datumId).getPopup()!==undefined){
            leafletRefObjs.current.get(datumId).openPopup()
        }
    } catch (e) {
        log.error("error in loadPopup",e)
    }

}

const SearchedHere = () :JSX.Element=>{
    log.info("generating searched here")
    const { state} = useContext(CardStateContext);
    const previousSearchedHereMarker = useRef<L.Marker|null>(null);
    const currentSearchedHereMarker = useRef<L.Marker|null>(null);
    let map = useMap()

    previousSearchedHereMarker.current = currentSearchedHereMarker.current
    state.currentCard.searchMatches.forEach(searchMatch=>{
        if(state.currentCard.type===CardType.GeocodeCard){
            currentSearchedHereMarker.current = createSearchedHereMarker([searchMatch.latitude,searchMatch.longitude])
            log.info("searched here marker created", currentSearchedHereMarker.current)
        }       
    })

    useEffect(() => {
        if(previousSearchedHereMarker.current){
            log.info("removing previous searched here marker from map", currentSearchedHereMarker.current)
            previousSearchedHereMarker.current.removeFrom(map)
        }
        if(currentSearchedHereMarker.current && state.currentCard.type===CardType.GeocodeCard){
            log.info("adding searched here marker to map", currentSearchedHereMarker.current)
            currentSearchedHereMarker.current.addTo(map)
            currentSearchedHereMarker.current.openPopup()
        }
        return () => {
            if(currentSearchedHereMarker.current){
                log.info("removing searched here marker from map", currentSearchedHereMarker.current)
                currentSearchedHereMarker.current.removeFrom(map)
            }
        }
    }, [state]);

    return (
        <React.Fragment>
        </React.Fragment>
    )
}


const RoutesAndStops = ()=>{
    log.info("generating RoutesAndStops")
    const stops = useContext(StopsContext);
    const routes = useContext(RoutesContext);
    const { state} = useContext(CardStateContext);

    let mapRouteMarkers: Map<string, L.Polyline> = new Map();
    const mapStopComponents = useRef(new Map());
    const lastUsedCard = useRef(state.currentCard);
    let stopsToDisplay: Map<string, L.Polyline> = new Map();
    let stopsToNonConditionallyDisplay: Map<string, L.Polyline> = new Map();
    const routeLayer = useRef<L.LayerGroup<L.Polyline>>(new L.LayerGroup());
    const stopLayer = useRef<L.LayerGroup<L.Marker>>(new L.LayerGroup());
    const selectedElementLayer = useRef<L.LayerGroup<L.Marker>>(new L.LayerGroup());
    routeLayer.current.id= "routeLayer";
    stopLayer.current.id = "stopLayer";
    selectedElementLayer.current.id = "selectedElementLayer";
    let {search} = useNavigation()
    let map = useMap()



    //methods

    const selectStop = (stop:StopInterface) =>{
        search(stop.id)
    }

    const processRoute = (route : RouteMatch)=> {
        log.info("processing route for map: ", route)

        route.directions.forEach(dir => {
            dir.mapRouteComponentData.forEach((datum:MapRouteComponentInterface) => {
                // log.info("requesting new MapRouteComponent from: ", datum)
                mapRouteMarkers.set(datum.id,createRoutePolyline(datum))
            })
        })
        route.directions.forEach(dir => {
            dir.mapStopComponentData.forEach((datum:StopInterface) => {
                let stopId = datum.id;
                let newStopMarker = createStopMarker(datum,selectStop,0)
                mapStopComponents.current.set(stopId, newStopMarker);
                stopsToDisplay.set(stopId, newStopMarker);                
            })
        })
    }

    const addStablePopups = () =>{
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

    function getRidOfThisMarker(marker: L.Marker,layerGroup: L.LayerGroup<L.Marker>) {
        if (!marker) return;
        
        marker.off(); // removes all event handlers
        marker.unbindPopup(); // unbinds popup
        const popup = marker.getPopup();
        popup?.removeFrom(map);
        popup?.remove();
        
        if (map.hasLayer(marker)) marker.removeFrom(map);
        layerGroup.current.removeLayer(marker);
        marker.remove();
    }

    const clearAllLayers = () => {
        log.info("clearing all layers from map", map);

        let layers: L.Layer[] = [];
        routeLayer.current.eachLayer((layer) => {
            layers.push(layer); // Add the layer to the array for logging purposes
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                layer.removeFrom(map);
            }
        });
        stopLayer.current.eachLayer((layer) => {
            layers.push(layer); // Add the layer to the array for logging purposes
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                getRidOfThisMarker(layer,stopLayer);
            }
        });
        selectedElementLayer.current.eachLayer((layer) => {
            layers.push(layer); // Add the layer to the array for logging purposes
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                getRidOfThisMarker(layer,selectedElementLayer);
            }
        });
        
        log.info("cleared layers from map", layers);
        mapRouteMarkers.clear();
        stopsToDisplay.clear();
        stopsToNonConditionallyDisplay.clear();
        mapStopComponents.current.clear();

        routeLayer.current.clearLayers();
        stopLayer.current.clearLayers();
        selectedElementLayer.current.clearLayers();
    }

    const checkForAndHandleCardChange = () => {
        if(lastUsedCard.current !== state.currentCard){
            log.info("card changed, updating map",lastUsedCard.current,state.currentCard)
            lastUsedCard.current = state.currentCard;


            clearAllLayers()

            // add card level data
            // todo: break this out into a function
            state.currentCard.searchMatches.forEach(searchMatch=>{
                log.info("adding routes for:",searchMatch)
                if(state.currentCard.type===CardType.RouteCard){
                    let route = searchMatch
                    processRoute(route)
                }
                else if(state.currentCard.type===CardType.VehicleCard){
                    log.info("vehicle route works here");
                    let route = searchMatch;
                    processRoute(route);
                }
                else if(state.currentCard.type===CardType.GeocodeCard) {
                    searchMatch.routeMatches.forEach(match => {
                        if(match.type === MatchType.RouteMatch){processRoute(match);}
                        if(match.type === MatchType.StopMatch){
                            match.routeMatches.forEach(route => {
                                processRoute(route);
                            })
                        }
                    })
                    let latlon = [searchMatch.latitude,searchMatch.longitude]
                    if(latlon !== null || latlon !== undefined){
                        let key = uuidv4()
                        // searchedHereComponent.current = <MapSearchedHereComponent latlon={latlon} key = {key} searchedHereMarker={searchedHereMarker}/>;
                        let searchedHereMarker = createSearchedHereMarker(latlon)
                        searchedHereMarker.addTo(selectedElementLayer.current)
                    }
                }
                else if(state.currentCard.type===CardType.StopCard) {
                    searchMatch.routeMatches.forEach(route => {
                        processRoute(route);
                    })
                    let stopId =state.currentCard.datumId;
                    stopsToNonConditionallyDisplay.set(stopId,mapStopComponents.current.get(stopId));
                    mapStopComponents.current.get(stopId).setZIndexOffset(20);
                    stopsToDisplay.delete(stopId)
                }
            })

            mapRouteMarkers.forEach((value, key) => {
                if (value !== null && value !== undefined) {
                    routeLayer.current.addLayer(value);
                }
            });
            stopsToDisplay.forEach((value, key) => {
                if (value !== null && value !== undefined) {
                    stopLayer.current.addLayer(value);
                }
            });
            stopsToNonConditionallyDisplay.forEach((value, key) => {
                if (value !== null && value !== undefined) {
                    selectedElementLayer.current.addLayer(value);
                    value.openPopup();
                }
            });
        }
    }


    



    log.info("map route components before", mapRouteMarkers);
    log.info("map stop components before", mapStopComponents.current);
    
    checkForAndHandleCardChange()

    useEffect(() => {
        routeLayer.current.addTo(map);
        selectedElementLayer.current.addTo(map);

        checkForAndHandleCardChange()
        addStablePopups();
        log.info("map route elements layer group ref",routeLayer,routeLayer.current.getLayers().length)
        log.info("map stop elements layer group ref",stopLayer.current.getLayers().length)
        return () => {
            clearAllLayers()
            routeLayer.current.removeFrom(map);
            selectedElementLayer.current.removeFrom(map);
            stopLayer.current.removeFrom(map);
        }
    },[state])

    const lastZoomWasBelowThreshold = useRef(map.getZoom());
    useMapEvents(
        {
            zoom() {
                if(routeLayer.current!==null){
                    routeLayer.current.removeFrom(map)
                }
                checkForAndHandleCardChange()

            },
            zoomend() {
                checkForAndHandleCardChange()
                if(routeLayer.current!==null) {
                    routeLayer.current.addTo(map)
                }
                if (map.getZoom()<15.1) {
                    stopLayer.current?.removeFrom(map);
                } else {
                    stopLayer.current?.addTo(map);
                }
    
                log.info("map route elements layer group ref",routeLayer.current,routeLayer.current.getLayers().length)
                log.info("map stop elements layer group ref",stopLayer.current.getLayers().length)
                let mapWidth=map.getBounds().getEast()-map.getBounds().getWest();
                let mapHeight=map.getBounds().getNorth()-map.getBounds().getSouth();
                log.info("map width and height",mapWidth,mapHeight)
            }
        }
    )
}

const Highlighted = () =>{
    let {getHighlightedId} = useHighlight()
    let highlightedId = getHighlightedId()
    let {state} = useContext(CardStateContext);
    let highlightedComponents = useRef(new Map());

    const stops = useContext(StopsContext)
    const routes = useContext(RoutesContext)
    const map = useMap()

    log.info("highlight component loaded",highlightedId,routes.current,stops.current)



    useEffect(() => {
        log.info("clearing previous highlighted components from map",highlightedComponents.current)
        highlightedComponents.current.forEach((value, key) => {
            if (value !== null && value !== undefined) {
                value.removeFrom(map);
            }
        });
        highlightedComponents.current.clear();
        log.info("cleared previous highlighted components from map",highlightedComponents.current)


        log.info("generating highlighted component",highlightedId,routes.current,stops.current)

        let stopDatum = stops.current[highlightedId]
        if(stopDatum!==null && typeof stopDatum !=='undefined'){
            highlightedComponents.current.set(stopDatum.id,createStopMarker(stopDatum,()=>{},20))
        }
        let routeDatum = routes.current[highlightedId]
        if(routeDatum!==null && typeof routeDatum !=='undefined'){
            routeDatum.directions.forEach(dir => {
                dir.mapRouteComponentData.forEach((datum:MapRouteComponentInterface) => {
                    highlightedComponents.current.set(datum.id,createRoutePolyline(datum,true))
                })
            })
        }

        log.info("adding highlighted components to map",highlightedComponents.current)
        highlightedComponents.current.forEach((value, key) => {
            if (value !== null && value !== undefined) {
                value.addTo(map);
            }
        });

        return () => {
            log.info("removing highlighted components from map",highlightedComponents.current)
            highlightedComponents.current.forEach((value, key) => {
                if (value !== null && value !== undefined) {
                    value.removeFrom(map);
                }
            });
            highlightedComponents.current.clear();
        }
    }
    , [state,highlightedId])


    useMapEvents(
        {
            zoom() {
                highlightedComponents.current.forEach((value, key) => {
                    if (value !== null && value !== undefined) {
                        value.removeFrom(map);
                    }
                });
            },
            zoomend() {
                highlightedComponents.current.forEach((value, key) => {
                    if (value !== null && value !== undefined) {
                        value.addTo(map);
                    }
                }
                );
            }
        }
    )
        

}

const setMapLatLngAndZoom = (lat : number, lon :number,zoom:number,override:boolean) :void =>{
    let duration = .85
    log.info("Assessing zoom. based on requested values:",lat,lon,zoom)
    if(lat===null|lon===null|zoom===null){return}
    let map = useMap()
    let mapWidth=map.getBounds().getEast()-map.getBounds().getWest();
    let mapHeight=map.getBounds().getNorth()-map.getBounds().getSouth();
    let [currentLat, currentLong,currentZoom] = [map.getCenter().lat,map.getCenter().lng,map.getZoom()]
    let latsMatch = currentLat+mapHeight/3>lat && currentLat-mapHeight/3<lat
    let latsOnScreen = currentLat+mapHeight>lat && currentLat-mapHeight<lat
    let lonsMatch = currentLong+mapWidth/3>lon && currentLong-mapWidth/3<lon
    let lonsOnScreen = currentLong+mapWidth>lon && currentLong-mapWidth<lon
    let zoomsMatch =  zoom-.3<currentZoom && zoom+.3>currentZoom
    let zoomSeemsIntentional = currentZoom>16

    let performZoom = override
    
    if(override){
        log.info("Assessing zoom. override requested, performing zoom")
    }

    if(zoomSeemsIntentional){
        log.info("Assessing zoom. zoom seems intentional, checking if new selection is on screen ",currentLat,currentLong,currentZoom,"new: ",lat,lon,zoom, "matches",lonsOnScreen,latsOnScreen)
        if(!(lonsOnScreen && latsOnScreen)){
            performZoom = true
        }
    } else {
        log.info("Assessing zoom. update map bounds and zoom? current: ",currentLat,currentLong,currentZoom,"new: ",lat,lon,zoom, "matches",latsMatch,lonsMatch,zoomsMatch)
        if(!(latsMatch&&lonsMatch&&zoomsMatch)){ performZoom = true }
    }
    if(performZoom){
        log.info("Assessing zoom. updating map bounds and zoom")
        map.flyTo([lat, lon], zoom, {
            animate: true,
            duration: duration
        });
    }
}

const setMapBounds = (bounds: LatLngBounds):void =>{
    let map = useMap()
    map.flyToBounds(bounds)
}

const HandleMapForVehiclesBoundsAndZoom = () :void=>{
    // todo: later have it just confirm it's in the bounding box
    const { vehicleState} = useContext(VehicleStateContext);
    const { state} = useContext(CardStateContext);
    if(state.currentCard.type!==CardType.VehicleCard){
        return
    }
    let duration = .85
    let zoom = 16;
    let [lat, long] = vehicleState[state.currentCard.routeIdList.values().next().value.split("_")[1]
    +vehicleDataIdentifier].get(state.currentCard.vehicleId).longLat;
    setMapLatLngAndZoom(duration,lat,long,zoom)
}

const getBoundsForRoute = (route:RouteMatch)=> {
    let collectedPoints = []
    route.directions.forEach(dir=> {
        dir.mapRouteComponentData.forEach(routeDir=>{
            if (typeof routeDir.points !== 'undefined') {
                let coordinates = routeDir.points;
                for (let k=0; k < coordinates.length; k++) {
                    let coordinate = coordinates[k];
                    collectedPoints.push(coordinate);
                }
            }
        })
    });
    let newBounds = L.latLngBounds(collectedPoints);
    log.info("made newbounds",newBounds)
    return newBounds
}

const HandleMapBoundsAndZoom = () : void=>{
    const { state} = useContext(CardStateContext);
    let [lat, long] = [null,null]
    let zoom = null
    let override = false


    state.currentCard.searchMatches.forEach(searchMatch=>{
        if(state.currentCard.type===CardType.RouteCard){
            setMapBounds(getBoundsForRoute(searchMatch))
            return
        }
        else if(state.currentCard.type===CardType.GeocodeCard) {
            [lat, long] = [searchMatch.latitude,searchMatch.longitude];
            zoom = 16;

        }
        else if(state.currentCard.type===CardType.StopCard) {
            [lat, long] = [searchMatch.latitude, searchMatch.longitude];
            zoom = 16;
        }
        else if(state.currentCard.type===CardType.VehicleCard) {
            let vehicleId = state.currentCard.vehicleId;
            [lat, long] = state.currentCard.longlat;
            zoom = 16;
            console.log("vehicle card zoom requested",state.currentCard, lat, long, zoom)
        }
    })
    if(state.currentCard.type===CardType.HomeCard)
        {
            [lat, long] = OBA.Config.defaultMapCenter;
            zoom = 11;
            override = true;
        }

    setMapLatLngAndZoom(lat,long,zoom,override)
}

const MapEvents = () :boolean=> {
    log.info("generating map events")
    const openPopups = useRef<L.Popup[]>([]);



    useMapEvents({
        popupopen(e) {
            log.info("popup opened", e.popup);

            const popupContent = e.popup.getElement();
            log.info("popup opened", popupContent);
            popupContent.addEventListener('click', function (event) {
                if (event.target.matches('.close-map')) {
                    // console.log('boop popup button clicked');
                    var mapWrap = document.querySelector('#map-wrap');
                    var mapToggle = document.querySelector('#map-toggle');
                    if (mapWrap) {
                    // window.console.log('boop map close');
                    mapWrap.classList.remove('open');
                    mapToggle.setAttribute('aria-expanded', 'false');
                    mapToggle.setAttribute('aria-label', 'Toggle Map Visibility (currently hidden)');
                    mapToggle.setAttribute('aria-pressed', 'false');
                    }
                } 
            });

            const contentEl = e.popup.getContent();
            const isSearchHere = contentEl instanceof HTMLElement && contentEl.classList.contains("search-here-div");
            log.info("popup opened", e.popup,"is search here popup", isSearchHere,contentEl);
            if(!isSearchHere){
                openPopups.current.forEach((popup) => {
                    if (popup !== e.popup) {
                        popup.close();
                    }
                });
            } 
            openPopups.current.push(e.popup);
        }

        // popupclose(e) {}
        
        // click() {},
        // zoomend() {}
    });

    let map = useMap()
    useEffect(() => {
        log.info("map loaded")
        
        map.options.closePopupOnClick = false;
    }, []);

    useEffect(() => {
        if (!map) return;
      
        map.whenReady(() => {
            map.invalidateSize();
        });
      }, [map]);

    return false;
};


export function RightClickSearchButton() {
    const map = useMap();
    const { search } = useNavigation();
    const popupRef = useRef<Popup | null>(null);
  
    const handleContextMenu = (e: LeafletMouseEvent) => {
        e.originalEvent.preventDefault();

        const latlng = e.latlng;

        const div = document.createElement("div");
        div.className = "search-here-div"
        div.innerHTML = `
        <button class="button search-here">Search Here</button>
        `;

        div.querySelector("button")?.addEventListener("click", () => {
        search(latlng.lat.toFixed(6) + "," + latlng.lng.toFixed(6));
        popupRef.current?.remove();
        });

        // Clean up any existing popup
        popupRef.current?.remove();

        const popup = L.popup({closeButton: false})
        .setLatLng(latlng)
        .setContent(div)
        .openOn(map);
        


        popupRef.current = popup;
    };

    useLongPressSearch({onLongPress : handleContextMenu});
  
    useEffect(() => {
        const events: Partial<LeafletEventHandlerFnMap> = {
            mousedown: closePopup,
            touchstart: closePopup,
        };
        map.on(events);
        map.on("contextmenu", handleContextMenu);

        return () => {
            map.off(events);
            map.off("contextmenu", handleContextMenu);
            popupRef.current?.remove();
        };
    }, [map]);

    const closePopup = () => {
        popupRef.current?.remove();
    }

    const events: Partial<LeafletEventHandlerFnMap> = {
        mousedown: closePopup,
        touchstart: closePopup,
    };
  
    return null;
  }


export const MapComponent = () :JSX.Element => {
    log.info("generating map")

    let startingMapCenter = OBA.Config.defaultMapCenter;
    let startingZoom = 11;

    return (
        <React.Fragment>
            <MapContainer
                center={startingMapCenter}
                zoom={startingZoom}
                scrollWheelZoom={true}
                tabIndex={-1}
                id="map"
            >
                <ReactLeafletGoogleLayer
                    apiKey='AIzaSyA-PBbsL_sXOTfo2KbkVx8XkEfcIe48xzw'
                    type={'roadmap'}
                    styles={OBA.Config.mutedTransitStylesArray}
                />
                <MapEvents />
                <RoutesAndStops/>
                <Highlighted/>
                <MapVehicleElements/>
                <HandleMapBoundsAndZoom />
                <SearchedHere/>
                <RightClickSearchButton/>
                {/*<HandleMapForVehiclesBoundsAndZoom/>*/}
            </MapContainer>
        </React.Fragment>
    );
};

// export default MapComponent;