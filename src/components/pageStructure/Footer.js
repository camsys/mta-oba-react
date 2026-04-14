import React from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import {FavoritesMenu} from "Components/pageStructure/FavoritesMenu";
import {GoogleTranslateButton} from "Components/pageStructure/GoogleTranslate";
import log from 'loglevel';
import {useNavigation} from "../../js/updateState/NavigationEffect";
import bus from "../../img/icon/bus.svg";
import { UnderlineOnFocusElement } from "../shared/common";


function Footer  () {
    log.info("adding footer")
    let enableGoogleTranslate = process.env.ENABLE_GOOGLE_TRANSLATE;
    let classicSiteAddress = process.env.CLASSIC_SITE_ADDRESS;
    return (
        <ErrorBoundary>
            <GoogleTranslateButton/>
            <div className="footer text-white bg-mta-black-2" id="footer">
                <h2 className='text-[1.35em] mt-4 mb-2 pt-[3px] font-bold'>MTA Bus Time</h2>
                <section className="my-2">
                    <div className="relative inline-block py-1 ">
                        <div className="absolute top-0 left-1/8 w-3/4 border-t border-white/40 text-center"></div>
                        <UnderlineOnFocusElement href={classicSiteAddress} className="text-4 font-[575] my-1">
                            Bus Time Classic
                        </UnderlineOnFocusElement>
                        <div className="absolute bottom-0 left-1/8 w-3/4 border-t border-white/40 text-center"></div>
                    </div>
                </section>
                <nav>
                    <ul className="menu my-1 text-4 font-[575]">
                        <li><UnderlineOnFocusElement href="//mta.info">MTA Homepage</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/about">Mobile Text Messages</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/about">About Bus Time</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/contact">Contact Us</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/developers">Developers</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/help">Help</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="//www.mta.info/privacy-policy">Privacy Policy</UnderlineOnFocusElement></li>
                    </ul>
                </nav>
            </div>
        </ErrorBoundary>
    )
}


export default Footer;

