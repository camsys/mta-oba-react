import React, {useContext} from 'react';
import log from 'loglevel';
import ErrorBoundary from "../util/errorBoundary";
import bustimeLogo from '../../img/bustime-logo.svg';
import mtaLogo from '../../img/mta-logo.svg';
import favicon from '../../img/favicon.ico';
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";



function Header  () {
    log.info("adding header")
    const { search } = useNavigation();
    return (
        <ErrorBoundary>
            <div className="beta-bar">
                <strong>BETA</strong>
                <a href="/about-beta">Learn More and Provide Feedback</a>
            </div>
            <header className="header" id="header">
                <div className="header-main">
                    <a href="#" onClick={() => search("")} aria-label="MTA Bus Time Home" className="logo-link">
                        <img src={bustimeLogo} alt="MTA Bus Time" className="logo" />
                    </a>
                    <nav>
                        <ul className="menu">
                            <li><a href="#" onClick={() => search("")}>Home</a></li>
                            <li><a href="/help/text">Text</a></li>
                            <li><a href="/about">About</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li><a href="/developers">Developers</a></li>
                            <li><a href="/help">Help</a></li>
                        </ul>
                    </nav>
                </div>
                <a href="https://www.mta.info/" target="_blank" aria-label="MTA Home" className="mta-logo-link">
                    <img src={mtaLogo} alt="MTA" className="mta-logo" />
                </a>
            </header>
        </ErrorBoundary>
    )
}

export default Header;