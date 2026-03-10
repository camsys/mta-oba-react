import React from 'react';
import log from 'loglevel';
import { FavoritesButton,NearMeButton } from '../shared/buttons';


function NearMeAndFavoritesComponent  () : JSX.Element {

    const nearMeText = (
        <>
            <span className='hidden min-[420px]:inline min-[600px]:hidden min-[900px]:inline'>Routes & Stops </span>
            <span className=''>Near Me</span>
        </>
    )

    log.info("adding NearMeAndFavorites")
    return (<div className="py-3 px-2 flex justify-center gap-4">
        <FavoritesButton className='py-[.66rem] basis-[0] ' iconClassName='w-5 h-5' textClassName='text-base truncate'/>
        <NearMeButton className='py-[.66rem] basis-[0] ' iconClassName='w-5 h-5' textClassName='text-base truncate' text="Nearby Buses"/>
        </div>);
}

export default NearMeAndFavoritesComponent;