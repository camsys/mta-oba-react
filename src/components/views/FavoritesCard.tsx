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
import { SelectableFavoriteRouteCard, SelectableFavoriteStopCard } from "./CardHeaderComponents";



export const FavoriteItem = ({datum} : {datum: RouteInterface | StopInterface}) =>{
   let {removeFavorite} = useFavorite();
    let {search} = useNavigation()

    if(isRouteInterface(datum)){
        return(<SelectableFavoriteRouteCard routeMatch={datum}/>)
    }
    if(isStopInterface(datum)){
        return(<SelectableFavoriteStopCard stopDatum={datum}/>)
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