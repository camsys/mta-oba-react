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
    let enableGoogleTranslate = process.env.ENABLE_GOOGLE_TRANSLATE;
    return (
        <ErrorBoundary>
            <ul className="menu ml-6 my-3" role="menu">
                <FavoritesMenu/>
            </ul>
            <GoogleTranslateButton/>
            <div className="footer text-white bg-mta-black-2" id="footer">
                <h2 className='text-[1.35em] my-4 pt-[3px] font-bold'>MTA Bus Time</h2>
                <nav>
                    <ul className="menu my-1 text-[1em] font-[575]">
                        <li><a href="#" onClick={(e) => {e.preventDefault();search("")}}>MTA Homepage</a></li>
                        <li><a href="/about">Mobile Text Messages</a></li>
                        <li><a href="/about">About Bus Time</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/developers">Developers</a></li>
                        <li><a href="/help">Help</a></li>
                    </ul>
                </nav>
            </div>
        </ErrorBoundary>
    )
}


export default Footer;

