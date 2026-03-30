import React from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import {FavoritesMenu} from "Components/pageStructure/FavoritesMenu";
import {GoogleTranslateButton} from "Components/pageStructure/GoogleTranslate";
import log from 'loglevel';
import {useNavigation} from "../../js/updateState/NavigationEffect";
import bus from "../../img/icon/bus.svg";
import {UnderlineOnFocusElement} from "Components/shared/common";


function Footer  () {
    log.info("adding footer")
    let enableGoogleTranslate = process.env.ENABLE_GOOGLE_TRANSLATE;
    return (
        <ErrorBoundary>
            <GoogleTranslateButton/>
            <div className="footer text-white bg-mta-black-2" id="footer">
                <h2 className='text-[1.35em] my-4 pt-[3px] font-bold'>MTA Bus Time</h2>
                <nav>
                    <ul className="menu my-1 text-[1em] font-[575]">
                        <li><UnderlineOnFocusElement href="//mta.info">MTA Homepage</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/about">Mobile Text Messages</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/about">About Bus Time</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/contact">Contact Us</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/developers">Developers</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="//www.mta.info/privacy-policy">Privacy Policy</UnderlineOnFocusElement></li>
                    </ul>
                </nav>
            </div>
        </ErrorBoundary>
    )
}


export default Footer;

