import React from "react";
import L from "leaflet";
import {Marker, Popup} from "react-leaflet";
import {v4 as uuidv4} from 'uuid'
import log from 'loglevel';



function MapSearchedHereComponent({latlon, searchedHereMarker}: { latlon:[number, number],
    searchedHereMarker: React.MutableRefObject<L.Marker|null> }): JSX.Element | null {
    log.info('validating MapSearchedHereComponent vars: ', latlon)
    if(latlon == null || latlon == undefined){
        log.info('invalid latlon for MapSearchedHereComponent: ', latlon)
        return null}
    log.info('starting to generate MapSearchedHereComponent: ', latlon)


    let icon = L.icon({
        iconUrl: "img/search-location-map-pin.png",
        className: "svg-icon",
        iconSize: [24,20],
        iconAnchor: [12,10],
        popupAnchor: [0,0]
    })

    let popupOptions = {
        autoPan: false,
        keepInView: false
    }


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
      <Marker {...markerOptions}
          ref={r=>
              {
                  // log.info("ref for stop component",stopDatum,r);
                  searchedHereMarker.current=r
              }}
              tabIndex={-1}
        >
          <Popup key={uuidv4()} className="map-searched-location" tabIndex={-1} {...popupOptions}>
              <div className="popup-info">
                  <span className="searched-here-span">Searched Location</span>
              </div>
          </Popup>
      </Marker>
  );
}

export default MapSearchedHereComponent;