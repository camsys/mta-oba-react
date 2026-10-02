import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {CardStateObject, FavoritesCookies, RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import Cookies from "js-cookie"
import {
    extractRouteInterface,
    extractStopInterface,
    isRouteInterface,
    isStopInterface
} from "../../js/updateState/DataModelsUtils";
import {
    favoritesIdsCookieIdentifier,
    favoritesStorageKey,
    getBrowserStorage,
    loadFavorites,
    oldFavoritesCookieIdentifier,
    saveFavorites
} from "../../js/updateState/favoritesStorage.mjs";
import log from 'loglevel';

const FavoritesCookieStateContext = createContext<{
    favoritesState:FavoritesCookies,
    setFavoritesState: React.Dispatch<React.SetStateAction<FavoritesCookies>>;
}|undefined>(undefined)

const FavoritesCookieStateProvider = ({children} : {children:ReactNode}):JSX.Element =>{
    const [favoritesState,setFavoritesState] = useState<FavoritesCookies>(() => {
        const favorites = loadFavorites(getBrowserStorage(), Cookies, isValidFavorite)
        log.info("got favorites",favorites)
        return favorites as FavoritesCookies
    })

    // Another tab changed favorites: pick them up, so this tab's next save doesn't overwrite them.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === favoritesStorageKey || e.key === null) {
                setFavoritesState(loadFavorites(getBrowserStorage(), Cookies, isValidFavorite) as FavoritesCookies)
            }
        }
        window.addEventListener("storage", onStorage)
        return () => window.removeEventListener("storage", onStorage)
    }, [])

    return (<FavoritesCookieStateContext.Provider value={{favoritesState,setFavoritesState}}>
        {children}
    </FavoritesCookieStateContext.Provider>)
}

const storeFavorites =(newFavorites:FavoritesCookies)=>{
    if (!saveFavorites(getBrowserStorage(), newFavorites.favorites)) {
        log.info("could not save favorites")
    }
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
        newFavorites.favoritesIds = favoritesState.favoritesIds.filter(id=> id !== targetId)
        storeFavorites(newFavorites)
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
        storeFavorites(newFavorites)
        setFavoritesState(newFavorites)
    }

    const isFavorite = (datum:StopInterface | RouteInterface) =>{
        if(!isValidFavorite(datum)){return false}
        if(favoritesState.favorites.length > 0) {
            if (favoritesState.favorites?.some(f => (getId(datum) === getId(f)))) {return true}
        }
        return false
    }

    const reorderFavorite = (favoritesId : string, indexChange : number) => {
        let newFavorites = {favorites: favoritesState.favorites, favoritesIds: favoritesState.favoritesIds}
        let favoriteIndex = newFavorites.favoritesIds.indexOf(favoritesId)
        if ((indexChange < 0 && favoriteIndex > 0) || (indexChange > 0 && favoriteIndex < newFavorites.favoritesIds.length - 1)) {
            newFavorites.favoritesIds.splice(favoriteIndex, 1)
            let deletedFavorite = newFavorites.favorites.splice(favoriteIndex, 1)
            log.info(`removed favorite ${favoritesId} from initial position`)
            newFavorites.favoritesIds.splice(favoriteIndex + indexChange, 0, favoritesId)
            newFavorites.favorites.splice(favoriteIndex + indexChange, 0, deletedFavorite[0])
            log.info(`reinserted favorite ${favoritesId} at position ${favoriteIndex + indexChange} (${indexChange})`)
            storeFavorites(newFavorites)
            setFavoritesState(newFavorites)
            log.info("updated favorites state",favoritesState)
        }
    }

    return {addFavorite,removeFavorite,isFavorite, reorderFavorite}
}


export {FavoritesCookieStateContext,FavoritesCookieStateProvider,oldFavoritesCookieIdentifier,favoritesIdsCookieIdentifier,useFavorite}