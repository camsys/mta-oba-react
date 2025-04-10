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
                    <li className="parent collapsible">
                        <a href="#" onClick={() => search('near me')}>
                            <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path className='blue' d="m18.879 8.648-.684-5.79c-.106-.69-.548-1.3-1.203-1.655C15.942.636 13.626 0 10 0 6.373 0 4.057.636 3.007 1.203c-.655.354-1.097.965-1.203 1.656l-.684 5.79c-.05.327-.076.657-.076.988v7.413c0 .155.137.28.306.28h1.124v1.517c0 .637.563 1.153 1.257 1.153h.011C4.436 20 5 19.484 5 18.847V17.33h10.002v1.517c0 .637.562 1.153 1.256 1.153h.012c.694 0 1.257-.516 1.257-1.153V17.33h1.124c.169 0 .306-.125.306-.28V9.637c0-.331-.026-.661-.076-.989h-.001ZM6.381 1.735h7.237a.57.57 0 1 1 0 1.14H6.381a.57.57 0 1 1 0-1.14ZM3.736 14.79a1.274 1.274 0 1 1 0-2.548 1.274 1.274 0 0 1 0 2.548Zm-.633-5.15a.572.572 0 0 1-.567-.647l.01-.07.002-.02.49-4.519a.572.572 0 0 1 .568-.51h12.788c.292 0 .537.22.568.51l.49 4.52.002.018.01.071a.573.573 0 0 1-.567.646H3.103Zm13.16 5.15a1.274 1.274 0 1 1 0-2.548 1.274 1.274 0 0 1 0 2.548Z"/>
                            </svg>
                            </span>
                            <span className="label">Stops & Routes Near Me</span>
                        </a>
                    </li>
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
                            <li><a href="//new.mta.info" tabIndex="-1"><span className="label">MTA Home</span></a></li>
                            <li><a href="//new.mta.info/agency/new-york-city-transit" tabIndex="-1"><span className="label">NYC Subways and Buses</span></a></li>
                            <li><a href="//new.mta.info/agency/long-island-rail-road" tabIndex="-1"><span className="label">Long Island Rail Road</span></a></li>
                            <li><a href="//new.mta.info/agency/metro-north-railroad" tabIndex="-1"><span className="label">Metro-North Railroad</span></a></li>
                            <li><a href="//new.mta.info/agency/bridges-and-tunnels" tabIndex="-1"><span className="label">Bridges and Tunnels</span></a></li>
                            <li><a href="//new.mta.info/agency/construction-and-development" tabIndex="-1"><span className="label">MTA Capital Program</span></a></li>
                            <li><a href="//new.mta.info/schedules" tabIndex="-1"><span className="label">Schedules</span></a></li>
                            <li><a href="//new.mta.info/fares" tabIndex="-1"><span className="label">Fares &amp; Tolls</span></a></li>
                            <li><a href="//new.mta.info/maps" tabIndex="-1"><span className="label">Maps</span></a></li>
                            <li><a href="//new.mta.info/alerts" tabIndex="-1"><span className="label">Planned Service Changes</span></a></li>
                            <li><a href="//new.mta.info/about-us" tabIndex="-1"><span className="label">MTA Info</span></a></li>
                            <li><a href="//new.mta.info/doing-business-with-us" tabIndex="-1"><span className="label">Doing Business With Us</span></a></li>
                            <li><a href="//new.mta.info/transparency" tabIndex="-1"><span className="label">Transparency</span></a></li>
                            <li><a href="//www.mta.info/privacy-policy" tabIndex="-1"><span className="label">Privacy Policy</span></a></li>
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