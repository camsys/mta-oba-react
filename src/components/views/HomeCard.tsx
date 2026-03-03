import React, {useContext} from 'react';
import log from 'loglevel';
import {useNavigation} from "../../js/updateState/NavigationEffect";
import { FavoritesButton,NearMeButton,ShuttleButton,AllRoutesButton } from '../shared/buttons';


function HomeCard  () : JSX.Element {

    log.info("adding home card")
    const { search,allRoutesSearch } = useNavigation();
    log.info("functions for search",search,allRoutesSearch)
    return (<div>
        <div className="example-searches">
        <ul className=' [&_li]:p-0 [&_li]:py-3 [&_li]:my-0 [&_li]:before:content-none'>
            <li ><NearMeButton/></li>
            <li><AllRoutesButton/></li>
            <li><FavoritesButton/></li>
            <li><ShuttleButton/></li>
        </ul>
</div>
         
                </div>);
}

export default HomeCard;