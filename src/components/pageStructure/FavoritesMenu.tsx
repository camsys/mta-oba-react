import React, {useContext, useEffect, useState} from "react";
import Cookies from "js-cookie";
import {RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import {FavoritesCookieStateContext, useFavorite} from "../util/MiscStateComponent";
import {isRouteInterface, isStopInterface} from "../../js/updateState/DataModelsUtils";


export const FavoriteItem = ({datum}) =>{
    let {removeFavorite} = useFavorite();


    if(isRouteInterface(datum)){
        let routeDatum = datum as RouteInterface
        return(<li>
            <a href="#" className={`favorite-route route-border-left ${routeDatum.routeId.split("_")[1]}`} tabIndex="-1">
                                        <span className="label" style={{ borderColor: '#'+routeDatum.color }}>
                                            <strong>{routeDatum.routeId.split("_")[1]}</strong> {routeDatum.description}
                                        </span>
            </a>
            <button className="remove-favorite small-link clear-button" tabIndex="-1" onClick={()=>{removeFavorite(datum)}}>Remove Route From Favorites</button>
        </li>)
    }

    if(isStopInterface(datum)){
        let stopDatum = datum as StopInterface
        return(
            <li>
                <a href="#" className="favorite-stop" tabIndex="-1">
                    <span className="label"><strong>{stopDatum.name}</strong> {stopDatum.name}</span>
                </a>
                <button className="remove-favorite small-link clear-button" tabIndex="-1" onClick={()=>{removeFavorite(datum)}}>Remove Stop From Favorites</button>
            </li>
        )
    }
}

export const FavoritesMenu = () => {

    Cookies.set('favorites', "{\"favorites\":[{\"color\":\"00AEEF\",\"description\":\"via 86th St \\/ Ocean Pkwy\",\"routeId\":\"MTA NYCT_B1\",\"longName\":\"Bay Ridge - Manhattan Beach\",\"routeTitle\":\"B1\",\"textColor\":\"FFFFFF\",\"type\":3}]}")
    // Cookies.set('favorites', "{\"favorites\":[{\"name\":\"00AEEF\",\"longLat\":[100,94],\"id\":\"MTA NYCT_B1\",\"stopDirection\":\"Bay Ridge - Manhattan Beach\"")

    const {favoritesState} = useContext(FavoritesCookieStateContext)
    const [, setForceUpdate] = useState(0);
    useEffect(() => {
        setForceUpdate(n => n + 1);
    }, [favoritesState]);


    // let {jsonCookie} = useJsonCookie("favorites")
    console.log("favorites cookie:")
    console.log("favorites cookie:", favoritesState)

    return(<li className="parent collapsible">
        <button id="favorites-menu-trigger" className="sub-menu-trigger collapse-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Toggle Favorites Menu">
                                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path className="blue" d="M19.845 7.217a1.348 1.348 0 0 0-1.252-.87h-5.4L11.253.87a1.33 1.33 0 0 0-2.495 0l-1.93 5.47h-5.4a1.33 1.33 0 0 0-.87 2.356l4.583 3.791-1.913 5.757a1.33 1.33 0 0 0 2.052 1.496l4.73-3.479 4.73 3.479a1.33 1.33 0 0 0 2.053-1.496l-1.922-5.757 4.592-3.8a1.34 1.34 0 0 0 .382-1.47Z"/>
                                        <path className="yellow" d="M13.196 11.36a.87.87 0 0 0-.279.982l1.4 4.226a.217.217 0 0 1-.078.252.227.227 0 0 1-.27 0l-3.478-2.539a.948.948 0 0 0-.539-.174.93.93 0 0 0-.539.174L5.97 16.83a.226.226 0 0 1-.27 0 .218.218 0 0 1-.078-.26l1.4-4.227a.87.87 0 0 0-.279-.982L3.265 8.438a.217.217 0 0 1-.07-.252.226.226 0 0 1 .21-.157H7.43a.913.913 0 0 0 .87-.6l1.46-4.157a.235.235 0 0 1 .436 0l1.46 4.157a.914.914 0 0 0 .87.6h4.061a.235.235 0 0 1 .217.157.218.218 0 0 1-.07.252l-3.538 2.921Z"/>
                                    </svg>
                                </span>
            <span className="label">Favorites</span>
        </button>
        <ul className="sub-menu menu collapse-content" id="favorites-menu" style={{ maxHeight: '0px' }} role="menu">
            {favoritesState.favorites.map((datum,index)=>{return <FavoriteItem datum={datum} key = {index}/>})}
        </ul>
    </li>)
}