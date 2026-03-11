import React, {useContext, useEffect, useState} from "react";
import Cookies from "js-cookie";
import {RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import {FavoritesCookieStateContext, useFavorite} from "../util/MiscStateComponent";
import {isRouteInterface, isStopInterface} from "../../js/updateState/DataModelsUtils";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import { OBA } from "../../js/oba";
import log from 'loglevel';
import stopPopupIcon from "../../img/icon/bus-stop.svg"
import {StarBorderIcon, BusStopIcon, VehicleIcon} from "../shared/icons";




export const FavoriteItem = ({datum}) =>{
   let {removeFavorite} = useFavorite();
    let {search} = useNavigation()


    if(isRouteInterface(datum)){
        let routeMatch = datum as RouteInterface
        return(<React.Fragment>
            <div className={`card route-card ${routeMatch.routeId}`} onClick={()=>search(routeMatch.routeId)}>
                <button
                    className="card-header link-header"
                    style={{ borderColor: "#" + routeMatch.color }}
                    tabIndex={0}
                >
                    <h3 className="card-title flex items-center">
                        <StarBorderIcon className="icon w-5 h-5 mb-[0.385rem]"/>
                        <VehicleIcon className="icon w-[1.125rem] h-[1.125rem] mb-1 fill-mta-dark-blue"/>
                        {OBA.Config.noWidows(routeMatch.routeTitle)}
                    </h3>
                </button>
            </div>  
        </React.Fragment>)
    }
    if(isStopInterface(datum)){
        let stopDatum = datum as StopInterface
        return(<React.Fragment>
            <div className={`card route-card ${stopDatum.id.split("_")[1]}`} onClick={()=>search(stopDatum.id.split("_")[1])}>
                <button
                    className="card-header link-header border-color-mta-dark-blue"
                    tabIndex={0}
                >
                    <h3 className="card-title flex items-center">
                        <StarBorderIcon className="icon w-5 h-5 mb-[0.4rem]"/>
                        <BusStopIcon className="icon w-5 h-6 mb-1"/>
                        {OBA.Config.noWidows(stopDatum.name)}</h3>
                </button>
            </div>
        </React.Fragment>)
    }
}

export function FavoritesWrapper():JSX.Element{
    log.info("generating favorites card: ");
    
    const {favoritesState} = useContext(FavoritesCookieStateContext)
    const [, setForceUpdate] = useState(0);
    useEffect(() => {
        setForceUpdate(n => n + 1);
    }, [favoritesState]);

    log.info("favorites cookie:")
    log.info("favorites cookie:", favoritesState)

    return (<React.Fragment>
        <h2 className={`cards-header`}>Favorites:</h2>
        <div className="cards allroutes">
            {favoritesState.favorites.length == 0
                ?<div className="pl-2 no-favorites"><em>No favorites found.</em> <br></br>Your favorite bus stops and bus routes will be listed&nbsp;here.</div>
                :favoritesState.favorites.map((datum,index)=>{return <FavoriteItem datum={datum} key = {index}/>})}
        </div>
    </React.Fragment>);
}