import {stopData} from "./dataModels";
import RouteStopComponent from "../../components/views/RouteStopComponent";


export class classWrap{
    constructor(targetClass,identifier,container=[]) {
        this.targetClass = targetClass
        this.identifier = identifier
        this.container = container

    }
}

export class classList {
    constructor(dataClass,otherClasses,dataContainer=[]) {
        this.dataClass = dataClass
        this.otherClasses = otherClasses
        this.dataContainer = dataContainer
    }
}

export class pathRouting {
    constructor(pathToList,pathToIndividual){
        this.pathToList = pathToList
        this.pathToIndividual = pathToIndividual
    }
}


export class dataSpecifiers {
    constructor(keyword, classList, pathRouting) {
        this.keyword = keyword
        this.classList = classList
        this.pathRouting = pathRouting
    }

}