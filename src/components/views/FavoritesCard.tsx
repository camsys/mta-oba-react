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



export const FavoriteItem = ({datum, showSort} : {datum: RouteInterface | StopInterface, showSort: boolean}) =>{
   let {removeFavorite} = useFavorite();
    let {search} = useNavigation()

    if(isRouteInterface(datum)){
        return(<SelectableFavoriteRouteCard routeMatch={datum} showSort={showSort}/>)
    }
    if(isStopInterface(datum)){
        return(<SelectableFavoriteStopCard stopDatum={datum} showSort={showSort}/>)
    }
}

export function FavoritesWrapper():JSX.Element{
    log.info("generating favorites card: ");
    
    const {favoritesState} = useContext(FavoritesCookieStateContext)
    const [, setForceUpdate] = useState(0);
    const [showSort, setShowSort] = useState(false)
    useEffect(() => {
        setForceUpdate(n => n + 1);
    }, [favoritesState]);

    log.info("favorites cookie:")
    log.info("favorites cookie:", favoritesState)

    return (<React.Fragment>
        <button
            type="button"
            aria-label="Sort favorites"
            className="w-full flex items-center justify-center gap-1 mb-3 px-4 py-2 rounded-sm border-none bg-mta-green text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mta-dark-blue focus-visible:outline-offset-2"
            onClick={()=>setShowSort(!showSort)}
        >
            <svg className="flex-shrink-0 w-[1.233rem] h-[1.067rem]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 4V20M7 20L3 16M7 20L11 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 20V4M17 4L13 8M17 4L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-bold">Sort</span>
        </button>
        <h2 className={`cards-header`}>Favorites:</h2>
        <div className="cards allroutes">
            {favoritesState.favorites.length == 0
                ?<div className="pl-2 no-favorites"><em>No favorites found.</em> <br></br>Your favorite bus stops and bus routes will be listed&nbsp;here.</div>
                :favoritesState.favorites.map((datum,index)=>{return <FavoriteItem datum={datum} key = {index} showSort={showSort}/>})}
        </div>
    </React.Fragment>);
}