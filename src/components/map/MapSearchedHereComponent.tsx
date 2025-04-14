import React from "react";
import L from "leaflet";
import {Marker} from "react-leaflet";
import {v4 as uuidv4} from 'uuid'
import log from 'loglevel';



function MapSearchedHereComponent(latlon:[number,number]): JSX.Element | null {
    log.info('validating MapSearchedHereComponent vars: ', latlon)
    if(latlon == null || latlon == undefined){
        log.info('invalid latlon for MapSearchedHereComponent: ', latlon)
        return null}
    log.info('starting to generate MapSearchedHereComponent: ', latlon)

    // let icon = L.icon({
    //     iconUrl: "img/search-location-map-pin.png",
    //     className: "svg-icon",
    //     iconSize: [100, 100],
    //     iconAnchor: [13, 13],
    //     popupAnchor: [0,0]
    // })


    let icon = L.icon({
        iconUrl: "img/search-location-map-pin.png",
        className: "svg-icon",
        iconSize: [150,150],
        iconAnchor: [25,25],
        popupAnchor: [0,0]
    })


    var markerOptions = {
        position: latlon,
        icon: icon,
        zIndexOffset: 700,
        title: "searched here icon",
        keyboard:false,
        key: uuidv4()
    };

    log.info('generating MapSearchedHereComponent: ', latlon,markerOptions)
  return (
      <Marker {...markerOptions}/>
  );
}

export default MapSearchedHereComponent;