import React, {useContext} from 'react';
import log from 'loglevel';
import ErrorBoundary from "../util/errorBoundary";
import bustimeLogo from '../../img/bustime-logo.png';
import favicon from '../../img/favicon.ico';
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";



function Header  () {
    log.info("adding header")
    const { search } = useNavigation();
    return (
        <ErrorBoundary>
            <header className="header" id="header">
                <a href="#" onClick={() => search("")} aria-label="MTA Bus Time Home" id="logo-link">
                    <img id="logo" style={{width: 100 + '%'}} src={bustimeLogo} alt="MTA Bus Time" className="logo" />
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
            </header>
        </ErrorBoundary>
    )
}

export default Header;