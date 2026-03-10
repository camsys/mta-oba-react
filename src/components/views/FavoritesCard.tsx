import React, {useContext, useEffect, useState} from "react";
import Cookies from "js-cookie";
import {RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import {FavoritesCookieStateContext, useFavorite} from "../util/MiscStateComponent";
import {isRouteInterface, isStopInterface} from "../../js/updateState/DataModelsUtils";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import { OBA } from "../../js/oba";
import log from 'loglevel';
import stopPopupIcon from "../../img/icon/bus-stop.svg"

const star_blue_yellow = (<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_789_8625)">
<path d="M19.8453 7.21679C19.7488 6.96239 19.5775 6.74317 19.354 6.58796C19.1305 6.43275 18.8652 6.34882 18.5931 6.34722H13.1931L11.254 0.868934C11.1597 0.613957 10.9895 0.393989 10.7664 0.238635C10.5433 0.0832815 10.278 0 10.0061 0C9.73427 0 9.46894 0.0832815 9.24584 0.238635C9.02275 0.393989 8.8526 0.613957 8.7583 0.868934L6.82785 6.33852H1.42783C1.15193 6.33377 0.881384 6.41492 0.653647 6.57073C0.425911 6.72654 0.252256 6.94931 0.15673 7.20818C0.0612041 7.46706 0.0485339 7.74923 0.120474 8.01563C0.192415 8.28202 0.345406 8.51946 0.558261 8.69505L5.14089 12.4864L3.22784 18.2429C3.13695 18.5114 3.13417 18.8018 3.21989 19.072C3.30562 19.3421 3.47536 19.5778 3.70441 19.7447C3.93345 19.9117 4.20981 20.0011 4.49323 20C4.77664 19.9989 5.05229 19.9073 5.28002 19.7386L10.0105 16.2603L14.7409 19.7386C14.9687 19.9073 15.2443 19.9989 15.5277 20C15.8111 20.0011 16.0875 19.9117 16.3165 19.7447C16.5456 19.5778 16.7153 19.3421 16.8011 19.072C16.8868 18.8018 16.884 18.5114 16.7931 18.2429L14.8714 12.4864L19.4627 8.68636C19.6677 8.50894 19.8141 8.27346 19.8824 8.01105C19.9508 7.74864 19.9378 7.47168 19.8453 7.21679Z" fill="#0E61A9"/>
<path d="M13.1957 11.3595C13.0516 11.473 12.9471 11.6292 12.8971 11.8057C12.8471 11.9821 12.8542 12.1699 12.9174 12.3421L14.3174 16.5682C14.3339 16.613 14.3351 16.662 14.321 16.7075C14.3068 16.7531 14.2781 16.7928 14.2392 16.8204C14.2002 16.8493 14.1529 16.865 14.1044 16.865C14.0558 16.865 14.0086 16.8493 13.9696 16.8204L10.4913 14.2812C10.3335 14.1697 10.1454 14.109 9.95219 14.1073C9.75877 14.1079 9.57032 14.1687 9.41306 14.2812L5.96957 16.8291C5.93059 16.858 5.88333 16.8737 5.83478 16.8737C5.78623 16.8737 5.73898 16.858 5.7 16.8291C5.65919 16.801 5.62918 16.7599 5.61495 16.7124C5.60072 16.665 5.60311 16.6141 5.62174 16.5682L7.02174 12.3421C7.08493 12.1699 7.09204 11.9821 7.04206 11.8057C6.99208 11.6292 6.88757 11.473 6.74348 11.3595L3.26521 8.43775C3.22781 8.40896 3.2008 8.36879 3.18825 8.32329C3.1757 8.2778 3.17829 8.22946 3.19564 8.18557C3.20999 8.14112 3.23777 8.1022 3.27514 8.07418C3.31251 8.04615 3.35764 8.03038 3.40434 8.02905H7.43044C7.6197 8.0315 7.80503 7.97508 7.96082 7.86759C8.1166 7.7601 8.23513 7.60685 8.30001 7.42905L9.76089 3.27251C9.77851 3.22931 9.8086 3.19235 9.84731 3.16632C9.88603 3.1403 9.93163 3.1264 9.97828 3.1264C10.0249 3.1264 10.0705 3.1403 10.1092 3.16632C10.148 3.19235 10.178 3.22931 10.1957 3.27251L11.6565 7.42905C11.7214 7.60685 11.84 7.7601 11.9957 7.86759C12.1515 7.97508 12.3369 8.0315 12.5261 8.02905H16.587C16.6349 8.02986 16.6814 8.04529 16.7202 8.07327C16.7591 8.10124 16.7884 8.14043 16.8044 8.18557C16.8217 8.22946 16.8243 8.2778 16.8118 8.32329C16.7992 8.36879 16.7722 8.40896 16.7348 8.43775L13.1957 11.3595Z" fill="#F2A900"/>
</g>
<defs>
<clipPath id="clip0_789_8625">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>
)

const star_blue_yellow_svg_element = (
    <svg className='icon' width="1.85rem" height="1.6rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        {star_blue_yellow}
    </svg>
)

export const FavoriteItem = ({datum}) =>{
   let {removeFavorite} = useFavorite();
    let {search} = useNavigation()


    if(isRouteInterface(datum)){
        let routeMatch = datum as RouteInterface
        return(<React.Fragment>
            <div className={`card route-card ${routeMatch.routeId}`} onClick={()=>search(routeMatch.routeId)}>
                <button
                    className="card-header link-header"
                    style={{ borderColor: "#" + routeMatch.color }}
                    tabIndex={0}
                >
                    <h3 className="card-title">
                        {star_blue_yellow_svg_element}
                        {OBA.Config.noWidows(routeMatch.routeTitle)}
                    </h3>
                </button>
            </div>
        </React.Fragment>)
    }
    if(isStopInterface(datum)){
        let stopDatum = datum as StopInterface
        return(<React.Fragment>
            <div className={`card route-card ${stopDatum.id.split("_")[1]}`} onClick={()=>search(stopDatum.id.split("_")[1])}>
                <button
                    className="card-header link-header border-color-mta-dark-blue"
                    tabIndex={0}
                >
                    <h3 className="card-title">
                        {star_blue_yellow_svg_element}
                        <img src={stopPopupIcon} alt="busstop icon" className="icon"/>
                        {OBA.Config.noWidows(stopDatum.name)}</h3>
                </button>
            </div>
        </React.Fragment>)
    }
}

export function FavoritesWrapper():JSX.Element{
    log.info("generating favorites card: ");
    
    const {favoritesState} = useContext(FavoritesCookieStateContext)
    const [, setForceUpdate] = useState(0);
    useEffect(() => {
        setForceUpdate(n => n + 1);
    }, [favoritesState]);


    // let {jsonCookie} = useJsonCookie("favorites")
    log.info("favorites cookie:")
    log.info("favorites cookie:", favoritesState)




    // const {state} = useContext(CardStateContext)
    // let routes = state.currentCard.searchMatches.map(match=>{
    //     return match.routeMatches.map(routeMatch=>{
    //         if(routeMatch.type === MatchType.RouteMatch){return routeMatch}
    //     })
    // }).flat().filter(x=>x!==null&&typeof x!=='undefined')


    return (<React.Fragment>
        <h2 className={`cards-header`}>Favorites:</h2>
        <div className="cards allroutes">
            {/* {routes.map((routeMatch,index) => {
                return <AbreviatedRouteCard item={routeMatch} key={index}/>
            })} */}
            {favoritesState.favorites.length == 0
                ?<div className="no-favorites"><em>No favorites found.</em> <br></br>Your favorite bus stops and bus routes will be listed&nbsp;here.</div>
                :favoritesState.favorites.map((datum,index)=>{return <FavoriteItem datum={datum} key = {index}/>})}
        </div>
    </React.Fragment>);
}