import React from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import {FavoritesMenu} from "Components/pageStructure/FavoritesMenu";
import {GoogleTranslateButton} from "Components/pageStructure/GoogleTranslate";
import log from 'loglevel';
import {useNavigation} from "../../js/updateState/NavigationEffect";
import bus from "../../img/icon/bus.svg";

function Footer  () {
    log.info("adding footer")
    const { search,allRoutesSearch } = useNavigation();
    let enableGoogleTranslate = process.env.ENABLE_GOOGLE_TRANSLATE;
    return (
        <ErrorBoundary>
            <ul className="menu ml-6 my-3" role="menu">
                <FavoritesMenu/>
            </ul>
            <div className="footer bg-mta-black-3" id="footer">
            
            </div>
        </ErrorBoundary>
    )
}


export default Footer;

// }{enableGoogleTranslate ? <li className="parent collapsible">
//                         <GoogleTranslateButton/>
//                     </li> : null}
