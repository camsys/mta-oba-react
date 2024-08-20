import React, {createContext, ReactNode, useContext, useState} from "react";
import {CardStateObject, FavoritesCookie, RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import Cookies from "js-cookie"
import {
    extractRouteInterface,
    extractStopInterface,
    isRouteInterface,
    isStopInterface
} from "../../js/updateState/DataModelsUtils";

const FavoritesCookieStateContext = createContext<{
    favoritesState:FavoritesCookie,
    setFavoritesState: React.Dispatch<React.SetStateAction<FavoritesCookie>>;
}|undefined>(undefined)

const FavoritesCookieStateProvider = ({children} : {children:ReactNode}):JSX.Element =>{
    const [favoritesState,setFavoritesState] = useState<FavoritesCookie>(() => {
        let favorites = {favorites:[],favCount:0}
        const cookie = Cookies.get(favoritesIdentifier)

        console.log("got favorites",cookie)

        if (cookie) {
            try {
                let json = JSON.parse(cookie)
                console.log("favorites json", json, json?.favorites, typeof favorites?.favorites)
                if (json?.favorites) {
                    json?.favorites.forEach((fav) => {
                        console.log("received favorite", fav)
                        if (isStopInterface(fav) || isRouteInterface(fav)) {
                            favorites.favorites.push(fav)
                        }
                    })
                }
            } catch (e){
                console.log("cookies are broken.",cookie)
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
    console.log(cookie)
    Cookies.set(favoritesIdentifier,JSON.stringify(cookie))
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
        console.log("previous favorites state",favoritesState)
        setFavoritesState(newFavorites)
        console.log("new favorites state",favoritesState)
    }


    const addFavorite = (datum:StopInterface | RouteInterface)=>{
        if(!isValidFavorite(datum)){return}
        datum = isRouteInterface(datum)? extractRouteInterface(datum):extractStopInterface(datum)
        let newFavorites = {favorites: favoritesState.favorites}
        if(newFavorites.favorites.some(f=>(getId(datum)===getId(f)))){return}
        newFavorites.favorites.push(datum)
        setCookies(newFavorites)
        setFavoritesState(newFavorites)
    }

    return {addFavorite,removeFavorite}
}



const favoritesIdentifier = "favorites"

export {FavoritesCookieStateContext,FavoritesCookieStateProvider,favoritesIdentifier,useFavorite}