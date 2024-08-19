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
        let favorites = {favorites:[]}
        const cookie = Cookies.get(favoritesIdentifier)

        console.log("got favorites",cookie)

        if (cookie) {
            let json = JSON.parse(cookie)
            console.log("favorites json",json,json?.favorites, typeof favorites?.favorites)
            if(json?.favorites) {
                json?.favorites.forEach((fav)=>{
                    console.log("received favorite",fav)
                    if(isStopInterface(fav) || isRouteInterface(fav)){
                        favorites.favorites.push(fav)
                    }
                })
            }
        }
        return favorites
    })

    const removeFavorite = (datum:RouteInterface|StopInterface)=>{
        let targetId = isRouteInterface(datum)? datum?.routeId : datum?.id
        favoritesState.favorites = favoritesState.favorites.filter((d)=>{return (isRouteInterface(d)? d?.routeId : d?.id) !== targetId})
        setFavoritesState(favoritesState)
    }

    return (<FavoritesCookieStateContext.Provider value={{favoritesState,setFavoritesState,removeFavorite}}>
        {children}
    </FavoritesCookieStateContext.Provider>)
}



const favoritesIdentifier = "favorites"

export {FavoritesCookieStateContext,FavoritesCookieStateProvider,favoritesIdentifier}