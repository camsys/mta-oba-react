import {OBA} from "../oba";

export class StopData {
    constructor(stopJson) {
        this.name = stopJson.name
        this.longLat = [stopJson.latitude,stopJson.longitude]
        this.id = stopJson.id
        this.stopDirection = stopJson.stopDirection
    }
}


export class serviceAlertData {
    constructor(serviceAlertJson) {
        this.json = serviceAlertJson
    }
}


export class vehicleData {
    constructor(mvj) {
        this.longLat = []
        this.longLat.push(mvj.VehicleLocation.Latitude)
        this.longLat.push(mvj.VehicleLocation.Longitude)
        this.destination = mvj.DestinationName
        if(typeof mvj.MonitoredCall !='undefined'){
            this.strollerVehicle = mvj.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle
        }else{
            this.strollerVehicle = false
        }
        this.hasRealtime = mvj.Monitored;
        this.vehicleId = mvj.VehicleRef
        this.direction = mvj?.Bearing
    }
}

export class searchMatch{
    constructor(type) {
        this.type = type
    }
}

export class MapRouteComponentDatum{
    constructor(componentId, points, color) {
        this.id = componentId
        this.points = points
        this.color = color
    }
}

export class RouteDirectionComponentDatum{
    constructor(routeId, directionId, routeDestination,stops) {
        console.log("generating routeDirectionComponentDatum for: ",routeId,directionId,routeDestination,stops)
        this.routeId = routeId
        this.directionId = directionId
        this.routeDestination = routeDestination
        console.log("RouteDirectionComponentDatum received stops: ",stops)
        this.routeStopComponentsData = []
        if(stops != null){
            stops.forEach(stop=>{this.routeStopComponentsData.push(new StopData(stop))})
        }
        console.log("RouteDirectionComponentDatum stopsComponents data: ",this.routeStopComponentsData)
    }
}

export class routeMatchDirectionDatum {
    constructor(directionJson,routeId,color) {
        this.routeId = routeId
        this.color = color
        this.directionId = directionJson.directionId
        this.destination = directionJson.destination
        this.mapRouteComponentData = []
        this.mapStopComponentData = []
        let stops = directionJson?.stops
        this.routeDirectionComponentData = new RouteDirectionComponentDatum(routeId,directionJson.directionId,
            directionJson.destination, stops)
        console.log("routeDirectionComponentDatum generated : ",this.routeDirectionComponentData)
        for (let j = 0; j < directionJson.polylines.length; j++) {
            console.log("decoding route polylines ", directionJson, this)
            let encodedPolyline = directionJson.polylines[j]
            let decodedPolyline = OBA.Util.decodePolyline(encodedPolyline)
            let polylineId = routeId + "_dir_" + directionJson.directionId + "_polyLineNum_" + j
            let mapRouteComponentDatum = new MapRouteComponentDatum(polylineId, decodedPolyline, color)
            this.mapRouteComponentData.push(mapRouteComponentDatum)
        }
        if(stops != null) {
            stops.forEach(stop => {
                this.mapStopComponentData.push(new StopData(stop))
            })
        }
    }
}

export class routeMatch extends searchMatch{
    constructor(data) {
        super("routeMatch");
        let color
        let routeId
        let routeTitle
        let description
        let directions = [] // should only be routeMatchDirectionDatum
    }
}

export class geocodeMatch extends searchMatch{
    constructor(data) {
        super("geocodeMatch");
        let latitude
        let longitude
        let nearbyRoutes = []
    }
}

export class stopMatch extends searchMatch{
    constructor(data) {
        super("stopMatch");
        let latitude
        let longitude
        let routesAvailable = []
    }
}

export class Card {
    static ROUTECARDIDENTIFIER = "RouteResult";
    static GEOCARDIDENTIFIER = "GeocodeResult";
    static STOPCARDIDENTIFIER = "StopResult";
    static cardTypes = {
        routeCard:"routeCard",
        geocodeCard:"geocodeCard",
        stopCard:"stopCard",
        errorCard:"errorCard"
    }
    constructor(searchTerm) {
        this.searchTerm = searchTerm
        this.searchResultType = null
        this.name = "homeCard"
        this.searchMatches = []
    }

    setSearchResultType(searchResultType){
        this.searchResultType = searchResultType
        if(searchResultType==Card.STOPCARDIDENTIFIER){
            this.type = Card.cardTypes.stopCard
        }
        if(searchResultType==Card.GEOCARDIDENTIFIER){
            this.type = Card.cardTypes.geocodeCard

        }
        if(searchResultType==Card.ROUTECARDIDENTIFIER){
            this.type = Card.cardTypes.routeCard
        }
        if(searchResultType==null){
            this.type = Card.cardTypes.errorCard
        }
        this.name = this.type
    }

    equals(that){
        if(this.searchTerm == that?.searchTerm
        && this.searchResultType == that?.searchResultType){
            return true
        }
        return false
    }
}


