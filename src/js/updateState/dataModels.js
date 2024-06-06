export class stopData {
    constructor(stopJson) {
        this.name = stopJson.name
        this.longLat = [stopJson.latitude,stopJson.longitude]
        this.id = stopJson.id
    }
}


export class serviceAlertData {
    constructor(serviceAlertJson) {
        this.name = stopJson.name
        this.longLat = [stopJson.latitude,stopJson.longitude]
        this.id = stopJson.id
    }
}


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


