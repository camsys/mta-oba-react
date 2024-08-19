import React, {createContext, ReactNode, useContext, useState} from "react";
import {CardStateObject, FavoritesCookie, RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import Cookies from "js-cookie"
import {isRouteInterface, isStopInterface} from "../../js/updateState/DataModelsUtils";

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
    Cookies.set(favoritesIdentifier,JSON.stringify(cookie))
}

const useFavorite = () =>{
    const {favoritesState,setFavoritesState} = useContext(FavoritesCookieStateContext)
    const removeFavorite = (datum:StopInterface | RouteInterface)=>{
        let targetId = isRouteInterface(datum)? datum?.routeId : datum?.id
        let newFavorites = {} as FavoritesCookie
        newFavorites["favorites"] = favoritesState.favorites.filter((d)=>{return (isRouteInterface(d)? d?.routeId : d?.id) !== targetId})
        setCookies(newFavorites)
        console.log("previous favorites state",favoritesState)
        setFavoritesState(newFavorites)
        console.log("new favorites state",favoritesState)
    }


    const addFavorite = (datum:StopInterface | RouteInterface)=>{
        let newFavorites = {} as FavoritesCookie
        newFavorites.favorites.push(datum)
        setCookies(newFavorites)
        setFavoritesState(newFavorites)
    }

    return {addFavorite,removeFavorite}
}



const favoritesIdentifier = "favorites"

export {FavoritesCookieStateContext,FavoritesCookieStateProvider,favoritesIdentifier,useFavorite}