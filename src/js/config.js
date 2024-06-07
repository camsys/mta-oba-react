/*
 * Copyright (c) 2011 Metropolitan Transportation Authority
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var _gaq = _gaq || [];
var OBA = window.OBA || {};

// This is mostly for IE7, to make sure AJAX/JSON calls are not cached.
// $.ajaxSetup({ cache: false });

OBA.Config = {
    autocompleteUrl: "api/autocomplete",
    searchUrl: "api/search",
    configUrl: "api/config",
    stopsWithinBoundsUrl: "api/stops-within-bounds",
    stopsOnRouteForDirection: "api/stops-on-route-for-direction",
    stopForId: "api/stop-for-id",
    debug: true,
    trace: false,
    defaultMapCenter: [40.675417,-73.981129],
    envAddress: process.env.ENV_ADDRESS,


    // siriSMUrl and siriVMUrl now moved to config.jspx

    refreshInterval: 15000,

    // This variable is overwritten by the configuration service--the JS found at configUrl (above)
    staleTimeout: 120,

    cards : {
        homeCard: {
            name : 'homeCard',
            identifier: null,
            queryIdentifier: null
        },
        routeCard: {
            name : 'routeCard',
            identifier : null,
            queryIdentifier: 'LineRef'
        },
    },

    cardQueryIdentifiers : {
        homeCard: null,
        routeCard: "LineRef"
    },

    // This method is called by the JS found at configUrl (above) when the configuration has finished loading.
    configurationHasLoaded: function() {
        _gaq.push(['_setAccount', OBA.Config.googleAnalyticsSiteId]);
        _gaq.push(['_setDomainName', 'none']);
        _gaq.push(['_setAllowLinker', true]);
        _gaq.push(['_trackPageview']);
        (function() {var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);})();
    },

    // For debugging: set to an ISO time string to make UI request from another time
    time: null,

    // Called by UI functions that want to send events to GA
    analyticsFunction: function(type, value) {
        _gaq.push(['_trackEvent', "Desktop Web", type, value]);
    },

    loadLocationIcons: function() {
        var locationIcons = [], activeLocationIcons = [];
        var size = [24, 32],
            o_point = [0,0],
            mid_point = [12, 32];

        var normalLocationIcon = new L.Icon({iconUrl:"img/location/location.png",
            iconSize: size, iconAnchor: o_point, popupAnchor: mid_point});
        var activeLocationIcon = new L.Icon({iconUrl:"img/location/location_active.png",
            iconSize: size, iconAnchor: o_point, popupAnchor: mid_point});

        locationIcons[0] = normalLocationIcon;
        activeLocationIcons[0] = activeLocationIcon;

        for (var i=1; i < 10; i++) {
            var numberedLocationIcon = new L.Icon({iconUrl:"img/location/location_" + i + ".png",
                iconSize: size, iconAnchor: o_point, popupAnchor: mid_point});
            var activeNumberedLocationIcon = new L.Icon({iconUrl:"img/location/location_active_" + i + ".png",
                iconSize: size, iconAnchor: o_point, popupAnchor: mid_point});

            locationIcons[i] = numberedLocationIcon;
            activeLocationIcons[i] = activeNumberedLocationIcon;
        }
        var shadowImage = new L.Icon({iconUrl: 'img/location/shadow.png', iconSize: size, iconAnchor: o_point, popupAnchor: mid_point});

        return [locationIcons, activeLocationIcons, shadowImage];
    },


    mutedTransitStylesArray :
        [{
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [
                    { saturation: -80 },
                    { lightness: 60 },
                    { visibility: "on" },
                    { hue: "#0011FF" }
                ]
            },{
                featureType: "road.arterial",
                elementType: "labels",
                stylers: [
                    { saturation: -80 },
                    { lightness: 40 },
                    { visibility: "on" },
                    { hue: "#0011FF" }
                ]
            },{
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [
                    { saturation: -80 },
                    { lightness: 60 },
                    { visibility: "on" },
                    { hue: "#0011FF" }
                ]
            },{
                featureType: "road.highway",
                elementType: "labels",
                stylers: [
                    { lightness: 60 },
                    { saturation: -70 },
                    { hue: "#0011FF" },
                    { visibility: "on" }
                ]
            },{
                featureType: "road.local",
                elementType: "all",
                stylers: [
                    { saturation: -100 },
                    { lightness: 32 }
                ]
            },{
                featureType: "administrative.locality",
                elementyType: "labels",
                stylers: [ { visibility: "on" },
                    { lightness: 50 },
                    { saturation: -80 },
                    { hue: "#ffff00" } ]
            },{
                featureType: "administrative.neighborhood",
                elementyType: "labels",
                stylers: [ { visibility: "on" },
                    { lightness: 50 },
                    { saturation: -80 },
                    { hue: "#ffffff" } ]
            },{
                featureType: 'landscape',
                elementType: 'labels',
                stylers: [ {'visibility': 'on'},
                    { lightness: 50 },
                    { saturation: -80 },
                    { hue: "#0099ff" }
                ]
            },{
                featureType: 'poi',
                elementType: 'labels',
                stylers: [ {'visibility': 'on'},
                    { lightness: 50 },
                    { saturation: -80 },
                    { hue: "#0099ff" }
                ]
            },{
                featureType: 'water',
                elementType: 'labels',
                stylers: [ {'visibility': 'off'}
                ]
            },{
                featureType: 'transit.station.bus',
                elementType: 'labels',
                stylers: [ {'visibility': 'off'}
            ]
        }
    ]
};

export default OBA.Config;
