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


export class VehicleArrivalDatum{
    constructor(mc) {
        let distances = mc?.Extensions?.Distances
        this.prettyDistance = distances?.PresentableDistance
        this.rawDistanceInfo = distances?.DistanceFromCall
        this.stopsFromCall = distances?.StopsFromCall
        this.rawDistanceOnRoute = distances?.CallDistanceAlongRoute
        this.stopId = mc?.StopPointRef
        this.stopName = mc?.StopPointName
    }
}

export class vehicleData {
    constructor(mvj) {
        console.log("vehicle data",mvj)
        this.longLat = []
        this.longLat.push(mvj.VehicleLocation.Latitude)
        this.longLat.push(mvj.VehicleLocation.Longitude)
        this.destination = mvj.DestinationName
        this.hasRealtime = mvj.Monitored;
        this.vehicleArrivalData = []
        if(typeof this.hasRealtime !='undefined' && this.hasRealtime!=null) {
            let mc = mvj.MonitoredCall
            this.strollerVehicle = mc.Extensions.VehicleFeatures.StrollerVehicle
            this.passengerCount = mc?.Extensions?.Capacities?.EstimatedPassengerCount
            this.passengerCapacity = mc?.Extensions?.Capacities?.EstimatedPassengerCapacity
            if (this.passengerCount != null) {
                console.log("found passenger count", this)
            }
            this.vehicleArrivalData.push(new VehicleArrivalDatum(mc))
            // let distances = mc?.Extensions?.Distances
            // this.prettyDistance = distances?.PresentableDistance
            // this.rawDistanceInfo = distances?.DistanceFromCall
            // this.stopsTillReached = distances?.StopsFromCall
            // this.rawDistanceOnRoute = distances?.CallDistanceAlongRoute
            // this.stopId = mc?.StopPointRef
            // this.stopName = mc?.StopPointName
            if(mvj?.OnwardCalls!=null && typeof this?.OnwardCalls !='undefined'){
                mvj.OnwardCalls.OnwardCall.forEach((mc,index)=>
                    index!=0?this.vehicleArrivalData.push(new VehicleArrivalDatum(mc)):
                        console.log("skipping first monitored call ",mvj))
            }
        }
        this.vehicleId = mvj.VehicleRef
        this.direction = mvj?.Bearing
        this.routeId = mvj.LineRef
    }
}

export class MapRouteComponentDatum{
    constructor(routeId,componentId, points, color) {
        this.routeId = routeId
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
            let polylineId = routeId + "_dir_" + directionJson.directionId + "_polyLineNum_" + String(j)
            let mapRouteComponentDatum = new MapRouteComponentDatum(routeId,polylineId, decodedPolyline, color)
            this.mapRouteComponentData.push(mapRouteComponentDatum)
        }
        if(stops != null) {
            stops.forEach(stop => {
                this.mapStopComponentData.push(new StopData(stop))
            })
        }
    }
}
export class searchMatch{
    constructor(type) {
        this.type = type
    }
}

//todo split routematch into a wraper that matches the other match types and a route obj they all contain
//and have card have a single searchMatches obj and make the routes field they all contain into a map w/
// routeId:currentRouteMatch && then remove the routeIds obj in card
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
    }
}

export class stopMatch extends searchMatch{
    constructor(data) {
        super("stopMatch");
        let latitude
        let longitude
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
        vehicleCard:"vehicleCard",
        errorCard:"errorCard"
    }
    constructor(searchTerm) {
        this.searchTerm = searchTerm
        this.searchResultType = null
        this.name = "homeCard"
        this.searchMatches = []
        this.routeIdList = []
        //this will almost always be null
        this.vehicleId = null
    }

    setType(cardType){
        if(Card.cardTypes[cardType]!==cardType){
            console.error("failed to set card type",this)
            return}
        this.type = cardType
        this.name = this.type
    }

    // This method is outside of the normal card setting pattern because our search tool
    // doesn't support vehicle searches
    setToVehicle(vehicleId,searchMatches,routeIdList){
        this.setType(Card.cardTypes.vehicleCard)
        this.vehicleId=vehicleId
        this.searchMatches=searchMatches
        this.routeIdList=routeIdList
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


