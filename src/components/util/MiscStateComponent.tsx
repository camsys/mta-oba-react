import React, {createContext, ReactNode, useContext, useState} from "react";
import {CardStateObject, FavoritesCookies, RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import Cookies from "js-cookie"
import {
    extractRouteInterface,
    extractStopInterface,
    isRouteInterface,
    isStopInterface
} from "../../js/updateState/DataModelsUtils";
import log from 'loglevel';

const FavoritesCookieStateContext = createContext<{
    favoritesState:FavoritesCookies,
    setFavoritesState: React.Dispatch<React.SetStateAction<FavoritesCookies>>;
}|undefined>(undefined)

const FavoritesCookieStateProvider = ({children} : {children:ReactNode}):JSX.Element =>{
    const [favoritesState,setFavoritesState] = useState<FavoritesCookies>(() => {
        let favorites = {favorites:[],favoritesIds:[]}
        const idsCookie = Cookies.get(favoritesIdsCookieIdentifier)
        let favoritesObjectCookies = []
        idsCookie?.split(",")?.forEach((id) => {
            favoritesObjectCookies.push(Cookies.get(id))
        })

        log.info("got favorites",favoritesObjectCookies)

        favoritesObjectCookies?.forEach((cookie) => {
            try {
                let json = JSON.parse(cookie)
                log.info("favorites json", json, typeof favorites?.favorites)
                if (json) {
                    log.info("received favorite", json)
                    if (isStopInterface(json) || isRouteInterface(json)) {
                        favorites?.favorites.push(json)
                        let targetId = isRouteInterface(json)? json?.routeId : json?.id
                        if (idsCookie?.split(",")?.includes(targetId.split("_")[1])) {
                            favorites?.favoritesIds?.push(targetId)
                        }
                    }
                }
            } catch (e){
                log.info("cookies are broken.",favoritesObjectCookies)
                setFavoritesCookies(favorites)
            }
        })
        return favorites
    })

    return (<FavoritesCookieStateContext.Provider value={{favoritesState,setFavoritesState}}>
        {children}
    </FavoritesCookieStateContext.Provider>)
}

const setFavoritesCookies =(cookies:FavoritesCookies)=>{
    cookies.favorites.forEach((f) => {
        log.info(f)
        let targetId = isRouteInterface(f)? f?.routeId : f?.id
        Cookies.set(targetId.split("_")[1],JSON.stringify(f),{ expires: 365*5 })
    })
    Cookies.set(favoritesIdsCookieIdentifier, cookies.favoritesIds.map(id => id.split("_")[1]).join(","),{ expires: 365*5 })
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
        let newFavorites = {favorites:[], favoritesIds: []}
        newFavorites.favorites = favoritesState.favorites.filter(d=> getId(d) !== targetId)
        newFavorites[favoritesIdsCookieIdentifier] = favoritesState.favoritesIds.filter(id=> id !== targetId)
        setFavoritesCookies(newFavorites)
        log.info("previous favorites state",favoritesState)
        setFavoritesState(newFavorites)
        log.info("new favorites state",favoritesState)
    }


    const addFavorite = (datum:StopInterface | RouteInterface)=>{
        log.info("add favorite requested",datum)
        if(!isValidFavorite(datum)){return}
        log.info("adding favorite",datum)
        datum = isRouteInterface(datum)? extractRouteInterface(datum):extractStopInterface(datum)
        let newFavorites = {favorites: favoritesState.favorites, favoritesIds: favoritesState.favoritesIds}
        if(newFavorites.favorites.length > 0) {
            if (newFavorites.favorites.some(f=>(getId(datum)===getId(f)))){return}
        }
        let targetId = isRouteInterface(datum)? datum?.routeId : datum?.id
        newFavorites.favorites.push(datum)
        newFavorites.favoritesIds.push(targetId)
        setFavoritesCookies(newFavorites)
        setFavoritesState(newFavorites)
    }

    const isFavorite = (datum:StopInterface | RouteInterface) =>{
        if(!isValidFavorite(datum)){return false}
        if(favoritesState.favorites.length > 0) {
            if (favoritesState.favorites?.some(f => (getId(datum) === getId(f)))) {return true}
        }
        return false
    }

    return {addFavorite,removeFavorite,isFavorite}
}



const favoritesCookieIdentifier = "favorite"
const favoritesIdsCookieIdentifier = "favoritesIds"

export {FavoritesCookieStateContext,FavoritesCookieStateProvider,favoritesCookieIdentifier,favoritesIdsCookieIdentifier,useFavorite}