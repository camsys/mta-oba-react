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
            <div className="footer" id="footer">
                <ul className="menu icon-menu" role="menu">
                    <FavoritesMenu/>
                    <li className="parent collapsible">
                        <button id="mta-menu-trigger" className="sub-menu-trigger collapse-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Toggle MTA Menu">
                            <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path className="blue" d="M12.643 8.393 11.566 8.3v5.717l-1.606.284-.004-6.143-1.364-.12V5.786l4.05.708v1.898Zm3.057 4.902-.953.165-.11-.833-.929.12-.116.917-1.227.218 1.215-7.21 1.153.2.967 6.423Zm-1.234-2.077-.255-2.201h-.056l-.258 2.235.57-.034ZM9.16 20c5.492 0 9.943-4.477 9.943-10S14.652 0 9.16 0C5.716 0 2.683 1.76.898 4.436l2.755.486.759 5.804c.002-.01.055-.004.055-.004l.831-5.512 2.758.483v8.946l-1.74.305V11.1s.064-1.656.026-1.94c0 0-.076.003-.077-.004L5.226 15.14l-1.729.305L2.227 9l-.077-.006c-.027.233.093 2.256.093 2.256v4.415l-1.136.2C2.914 18.37 5.847 20 9.159 20Z"/>
                                </svg>
                            </span>
                            <span className="label">Menu</span>
                        </button>
                        <ul className="sub-menu menu collapse-content" id="mta-menu" style={{ maxHeight: '0px' }} role="menu">
                            <li><a href="//mta.info" tabIndex="-1" target="_blank"><span className="label">MTA Home</span></a></li>
                            <li><a href="//mta.info/agency/new-york-city-transit" tabIndex="-1" target="_blank"><span className="label">NYC Subways and Buses</span></a></li>
                            <li><a href="//mta.info/schedules" tabIndex="-1" target="_blank"><span className="label">Schedules</span></a></li>
                            <li><a href="//mta.info/fares" tabIndex="-1" target="_blank"><span className="label">Fares &amp; Tolls</span></a></li>
                            <li><a href="//mta.info/maps" tabIndex="-1" target="_blank"><span className="label">Maps</span></a></li>
                            <li><a href="//mta.info/alerts" tabIndex="-1" target="_blank"><span className="label">Planned Service Changes</span></a></li>
                            <li><a href="//mta.info/privacy-policy" tabIndex="-1" target="_blank"><span className="label">Privacy Policy</span></a></li>
                        </ul>
                    </li>
                    {enableGoogleTranslate ? <li className="parent collapsible">
                        <GoogleTranslateButton/>
                    </li> : null}
                </ul>
            </div>
        </ErrorBoundary>
    )
}

export default Footer;