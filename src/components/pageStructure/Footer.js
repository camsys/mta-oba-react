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
                <section className="my-4">
                    <div className="relative inline-block py-1 ">
                        <div className="absolute top-0 left-1/8 w-3/4 border-white/40 text-center"></div>
                        <UnderlineOnFocusElement href={classicSiteAddress} className="text-4 font-[575] my-1">
                            Bus Time Classic
                        </UnderlineOnFocusElement>
                        <div className="absolute bottom-0 left-1/8 w-3/4 border-t border-white/40 text-center"></div>
                    </div>
                </section>
                <nav>
                    <ul className="menu my-1 text-4 font-[575]">
                        <li><UnderlineOnFocusElement href="//mta.info">MTA Website</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/help/text">Mobile Text Messages</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="//cloud.info.mta.org/create-mta-service-alerts?utm_source=MTA_Bus_Time&utm_medium=referral&utm_campaign=MTA_Service_Alerts">Sign Up For Service Alerts</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/about">About Bus Time</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="/contact">Contact Us</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="//www.mta.info/privacy-policy">Privacy Policy</UnderlineOnFocusElement></li>
                        <li><UnderlineOnFocusElement href="//www.mta.info/terms-and-conditions">Terms & Conditions</UnderlineOnFocusElement></li>
                    </ul>
                </nav>
            </div>
        </ErrorBoundary>
    )
}


export default Footer;

