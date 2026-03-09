import React from 'react';
import log from 'loglevel';
import { FavoritesButton,NearMeButton } from '../shared/buttons';


function NearMeAndFavoritesComponent  () : JSX.Element {

    log.info("adding NearMeAndFavorites")
    return (<div className="py-3 px-2 grid grid-cols-3 gap-1">
        <FavoritesButton className='truncate' textClassName='text-base'/>
        <NearMeButton className='col-span-2 truncate' textClassName='text-base' text="Near Me"/>
        </div>);
}

export default NearMeAndFavoritesComponent;