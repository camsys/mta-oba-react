import React from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import bustimeLogo from '../../img/bustime-logo.png';
import favicon from '../../img/favicon.ico';


function getHeader  () {
    OBA.Util.log("adding header")
    return (
        <ErrorBoundary>
            <link rel="shortcut icon" href={favicon} />
            <a href="/" aria-label="MTA Bus Time Home" id="logo-link">
                <img id="logo" style={{width: 100 + '%'}} src={bustimeLogo} alt="MTA Bus Time" className="logo" />
            </a>
            <nav>
                <ul className="menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="#">Text</a></li>
                    <li><a href="#">About</a></li>
                    <li><a href="#">Contact</a></li>
                    <li><a href="#">Developers</a></li>
                    <li><a href="#">Help</a></li>
                </ul>
            </nav>
        </ErrorBoundary>
    )
}

export default getHeader;