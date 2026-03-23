import React from 'react';
import log from 'loglevel';
import { FavoritesButton,NearMeButton } from '../shared/buttons';


function NearMeAndFavoritesComponent  () : JSX.Element {

    // TODO: get confirmation i can remove this
    // const nearMeText = (
    //     <>
    //         <span className='hidden min-[420px]:inline min-[600px]:hidden min-[900px]:inline'>Routes & Stops </span>
    //         <span className=''>Near Me</span>
    //     </>
    // )

    log.info("adding NearMeAndFavorites")
    return (<div className="max-[360px]:gap-2 items-stretch py-4 px-2 flex justify-center gap-4">
        <FavoritesButton className='flex max-w-[200px] justify-center py-[.66rem] basis-[0] flex-1' iconClassName='mb-1 w-5 h-5' textClassName='text-base truncate'/>
        <NearMeButton className='flex max-w-[200px] justify-center py-[.66rem] basis-[0] flex-1' iconClassName='mb-1 w-5 h-5' textClassName='text-base truncate' text="Nearby Buses"/>
        </div>);
}

export default NearMeAndFavoritesComponent;