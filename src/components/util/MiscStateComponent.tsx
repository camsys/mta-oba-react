import React, {createContext, ReactNode, useContext, useState} from "react";
import {CardStateObject, FavoritesCookie, RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import Cookies from "js-cookie"
import {
    extractRouteInterface,
    extractStopInterface,
    isRouteInterface,
    isStopInterface
} from "../../js/updateState/DataModelsUtils";
import log from 'loglevel';

const FavoritesCookieStateContext = createContext<{
    favoritesState:FavoritesCookie,
    setFavoritesState: React.Dispatch<React.SetStateAction<FavoritesCookie>>;
}|undefined>(undefined)

const FavoritesCookieStateProvider = ({children} : {children:ReactNode}):JSX.Element =>{
    const [favoritesState,setFavoritesState] = useState<FavoritesCookie>(() => {
        let favorites = {favorites:[],favCount:0}
        const cookie = Cookies.get(favoritesIdentifier)

        log.info("got favorites",cookie)

        if (cookie) {
            try {
                let json = JSON.parse(cookie)
                log.info("favorites json", json, json?.favorites, typeof favorites?.favorites)
                if (json?.favorites) {
                    json?.favorites.forEach((fav) => {
                        log.info("received favorite", fav)
                        if (isStopInterface(fav) || isRouteInterface(fav)) {
                            favorites.favorites.push(fav)
                        }
                    })
                }
            } catch (e){
                log.info("cookies are broken.",cookie)
                setCookies(favorites)
            }
        }
        return favorites
    })

    return (<FavoritesCookieStateContext.Provider value={{favoritesState,setFavoritesState}}>
        {children}
    </FavoritesCookieStateContext.Provider>)
}

const setCookies =(cookie:FavoritesCookie)=>{
    log.info(cookie)
    Cookies.set(favoritesIdentifier,JSON.stringify(cookie),{ expires: 365*5 })
}

const isValidFavorite =(datum) =>{
    if(!(isStopInterface(datum) || isRouteInterface(datum))){return false}
    return true
}

const getId = (datum) =>{
    if(!isValidFavorite(datum)){return null}
    return (isRouteInterface(datum)? datum?.routeId : datum?.id)
}

const useFavorite = () =>{
    const {favoritesState,setFavoritesState} = useContext(FavoritesCookieStateContext)
    const removeFavorite = (datum:StopInterface | RouteInterface)=>{
        if(!isValidFavorite(datum)){return}
        let targetId = isRouteInterface(datum)? datum?.routeId : datum?.id
        let newFavorites = {favorites:[]}
        newFavorites["favorites"] = favoritesState.favorites.filter(d=> getId(d) !== targetId)
        setCookies(newFavorites)
        log.info("previous favorites state",favoritesState)
        setFavoritesState(newFavorites)
        log.info("new favorites state",favoritesState)
    }


    const addFavorite = (datum:StopInterface | RouteInterface)=>{
        log.info("add favorite requested",datum)
        if(!isValidFavorite(datum)){return}
        log.info("adding favorite",datum)
        datum = isRouteInterface(datum)? extractRouteInterface(datum):extractStopInterface(datum)
        let newFavorites = {favorites: favoritesState.favorites}
        if(newFavorites.favorites.some(f=>(getId(datum)===getId(f)))){return}
        newFavorites.favorites.push(datum)
        setCookies(newFavorites)
        setFavoritesState(newFavorites)
    }

    const isFavorite = (datum:StopInterface | RouteInterface) =>{
        if(!isValidFavorite(datum)){return false}
        if(favoritesState.favorites.some(f=>(getId(datum)===getId(f)))){return true}
        return false
    }

    return {addFavorite,removeFavorite,isFavorite}
}



const favoritesIdentifier = "favorites"

export {FavoritesCookieStateContext,FavoritesCookieStateProvider,favoritesIdentifier,useFavorite}