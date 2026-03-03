import React, {useContext} from 'react';
import log from 'loglevel';
import {useNavigation} from "../../js/updateState/NavigationEffect";
import { FavoritesButton,NearMeButton,ShuttleButton,AllRoutesButton } from '../shared/buttons';


function NearMeAndFavoritesComponent  () : JSX.Element {

    log.info("adding NearMeAndFavorites")
    return (<div className="py-6">
        <NearMeButton/>
        </div>);
}

export default NearMeAndFavoritesComponent;