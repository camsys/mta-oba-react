import React, {useContext} from 'react';
import log from 'loglevel';
import {useNavigation} from "../../js/updateState/NavigationEffect";
import { FavoritesButton,NearMeButton,ShuttleButton,AllRoutesButton } from '../shared/buttons';


function HomeCard  () : JSX.Element {

    log.info("adding home card")
    const { search,allRoutesSearch } = useNavigation();
    log.info("functions for search",search,allRoutesSearch)
    return (<div>
<ul className='[&_li]:p-0 [&_li]:py-3 [&_li:first-child]:pt-[.4rem] [&_li]:my-0 [&_li]:before:content-none'>
    <li><NearMeButton/></li>
    <li><AllRoutesButton/></li>
    <li><ShuttleButton/></li>
    <li><FavoritesButton/></li>
</ul>
</div>);
}

export default HomeCard;