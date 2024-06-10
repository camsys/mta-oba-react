import {OBA} from "../oba";
import {LatLngBoundsExpression, MapOptions} from "leaflet";

export class stopData {
    constructor(stopJson) {
        this.name = stopJson.name
        this.longLat = [stopJson.latitude,stopJson.longitude]
        this.id = stopJson.id
    }
}


export class serviceAlertData {
    constructor(serviceAlertJson) {
        this.json = serviceAlertJson
    }
}

// export class routeDirectionData{
//     constructor(routeDirectionJson) {
//         let polylines = []
//         for (let i = 0; i < route?.directions.length; i++) {
//             let dir = route?.directions[i];
//             routeDestinations.push(dir.destination)
//             for (let j = 0; j < dir.polylines.length; j++) {
//                 let encodedPolyline = dir.polylines[j]
//                 let decodedPolyline = OBA.Util.decodePolyline(encodedPolyline)
//                 let polylineId = routeId + "_dir_" + i + "_lineNum_" + j
//                 let routeComponent = generateRouteComponent(polylineId, decodedPolyline, color)
//                 routeComponents.push(routeComponent)
//             }
//         }
//     }
// }
//
// export class routeData {
//     constructor(routeJson) {
//         let color = route?.color
//         let routeId = route?.id
//         let routeTitle = route?.shortName + " " + route?.longName
//         let description = route?.description
//
//     }
// }


export class vehicleData {
    constructor(mvj) {
        this.longLat = []
        this.longLat.push(mvj.VehicleLocation.Latitude)
        this.longLat.push(mvj.VehicleLocation.Longitude)
        this.destination = mvj.DestinationName
        this.strollerVehicle = mvj.MonitoredCall.Extensions.VehicleFeatures.StrollerVehicle
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
    constructor(directionId, routeDestination) {
        console.log("generating routeDirectionComponentDatum for: ",directionId,routeDestination)
        this.directionId = directionId
        this.routeDestination = routeDestination
        this.routeStopComponents = []
    }
}

export class routeMatchDirectionDatum {
    constructor(directionJson,routeId,color) {
        this.routeId = directionJson.routeId
        this.color = color
        this.directionId = directionJson.directionId
        this.destination = directionJson.destination
        this.mapRouteComponentData = []
        this.routeDirectionComponentData = new RouteDirectionComponentDatum(directionJson.directionId,
            directionJson.destination)
        console.log("routeDirectionComponentDatum generated : ",this.routeDirectionComponentData)
        for (let j = 0; j < directionJson.polylines.length; j++) {
            console.log("decoding route polylines ", directionJson, this)
            let encodedPolyline = directionJson.polylines[j]
            let decodedPolyline = OBA.Util.decodePolyline(encodedPolyline)
            let polylineId = routeId + "_dir_" + directionJson.directionId + "_lineNum_" + j
            let mapRouteComponentDatum = new MapRouteComponentDatum(polylineId, decodedPolyline, color)
            this.mapRouteComponentData.push(mapRouteComponentDatum)
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


