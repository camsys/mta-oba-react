import React, {createContext, ReactNode, useContext, useState} from "react";
import {CardStateObject, FavoritesCookie, RouteInterface, StopInterface, AgencyAndId} from "../../js/updateState/DataModels";
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
        let favorites: FavoritesCookie = {favorites:[]}
        const cookie = Cookies.get(favoritesIdentifier)

        log.info("got favorites",cookie)

        if (cookie) {
            try {
                let json = JSON.parse(cookie)
                log.info("favorites json", json, json?.favorites, typeof favorites?.favorites)
                if (json?.favorites) {
                    json?.favorites.forEach((fav: StopInterface | RouteInterface) => {
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

const setCookies = (cookie: FavoritesCookie): void => {
    log.info(cookie)
    Cookies.set(favoritesIdentifier,JSON.stringify(cookie),{ expires: 365*5 })
}

const isValidFavorite = (datum: unknown): boolean => {
    if(!(isStopInterface(datum) || isRouteInterface(datum))){
        log.warn("invalid favorite item, must be either stop or route interface",datum)
        return false}
    return true
}

const getId = (datum: StopInterface | RouteInterface): AgencyAndId | null => {
    if(!isValidFavorite(datum)){return null}
    return (isRouteInterface(datum)? datum?.routeId : datum?.id)
}

const useFavorite = (): { addFavorite: (datum: StopInterface | RouteInterface) => void; removeFavorite: (datum: StopInterface | RouteInterface) => void; isFavorite: (datum: StopInterface | RouteInterface) => boolean } => {
    const {favoritesState,setFavoritesState} = useContext(FavoritesCookieStateContext)!
    const removeFavorite = (datum:StopInterface | RouteInterface): void =>{
        if(!isValidFavorite(datum)){return}
        let targetId = isRouteInterface(datum)? datum?.routeId : datum?.id
        let newFavorites: FavoritesCookie = {favorites: [...favoritesState.favorites]}
        newFavorites["favorites"] = newFavorites.favorites.filter(d=> getId(d)?.toString() !== targetId?.toString()) as any
        setCookies(newFavorites)
        log.info("previous favorites state",favoritesState)
        setFavoritesState(newFavorites)
        log.info("new favorites state",favoritesState)
    }


    const addFavorite = (datum:StopInterface | RouteInterface): void =>{
        log.info("add favorite requested",datum)
        if(!isValidFavorite(datum)){return}
        log.info("adding favorite",datum)
        const extracted = isRouteInterface(datum)? extractRouteInterface(datum):extractStopInterface(datum)
        if(!extracted) return
        let newFavorites: FavoritesCookie = {favorites: [...favoritesState.favorites]}
        if(newFavorites.favorites.some(f=>(getId(extracted)?.toString()===getId(f)?.toString()))){return}
        newFavorites.favorites.push(extracted)
        setCookies(newFavorites)
        setFavoritesState(newFavorites)
    }

    const isFavorite = (datum:StopInterface | RouteInterface): boolean =>{
        if(!isValidFavorite(datum)){return false}
        if(favoritesState.favorites.some(f=>(getId(datum)?.toString()===getId(f)?.toString()))){return true}
        return false
    }

    return {addFavorite,removeFavorite,isFavorite}
}



const favoritesIdentifier = "favorites"

export {FavoritesCookieStateContext,FavoritesCookieStateProvider,favoritesIdentifier,useFavorite}