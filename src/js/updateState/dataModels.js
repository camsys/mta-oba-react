export class stopData {
    constructor(stopJson) {
        this.name = stopJson.name
        this.longLat = [stopJson.longitude,stopJson.latitude]
        this.id = stopJson.id
    }
}