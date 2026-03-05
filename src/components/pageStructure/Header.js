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
            <header className="header pb-5" id="header">
                <div className="header-main text-[1.20em] ">
                    <a href="#" onClick={(e) => {e.preventDefault(); search("")}} aria-label="MTA Bus Time Home" className="logo-link">
                        <img src={bustimeLogo} alt="MTA Bus Time" className="logo" />
                    </a>
                    
                </div>

                <div className="w-px h-3/4 bg-mta-black-4"></div>

                <a href="https://www.mta.info/" target="_blank" aria-label="MTA Home" className="mta-logo-link">
                    <img src={mtaLogo} alt="MTA" className="mta-logo" />
                </a>
            </header>
        </ErrorBoundary>
    )
}

export default Header;