import React from 'react';
import log from 'loglevel';
import { FavoritesButton,NearMeButton } from '../shared/buttons';


function NearMeAndFavoritesComponent  () : JSX.Element {

    log.info("adding NearMeAndFavorites")
    return (<div className="py-6">
        <NearMeButton/>
        </div>);
}

export default NearMeAndFavoritesComponent;