import React from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";


function Footer  () {
    OBA.Util.log("adding footer")
    return (
        <ErrorBoundary>
            <div className="footer" id="footer">
                <ul className="menu icon-menu" role="menu">
                    <li className="parent collapsible">
                        <button id="favorites-menu-trigger" className="sub-menu-trigger collapse-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Toggle Favorites Menu">
                                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path className="blue" d="M19.845 7.217a1.348 1.348 0 0 0-1.252-.87h-5.4L11.253.87a1.33 1.33 0 0 0-2.495 0l-1.93 5.47h-5.4a1.33 1.33 0 0 0-.87 2.356l4.583 3.791-1.913 5.757a1.33 1.33 0 0 0 2.052 1.496l4.73-3.479 4.73 3.479a1.33 1.33 0 0 0 2.053-1.496l-1.922-5.757 4.592-3.8a1.34 1.34 0 0 0 .382-1.47Z"/>
                                        <path className="yellow" d="M13.196 11.36a.87.87 0 0 0-.279.982l1.4 4.226a.217.217 0 0 1-.078.252.227.227 0 0 1-.27 0l-3.478-2.539a.948.948 0 0 0-.539-.174.93.93 0 0 0-.539.174L5.97 16.83a.226.226 0 0 1-.27 0 .218.218 0 0 1-.078-.26l1.4-4.227a.87.87 0 0 0-.279-.982L3.265 8.438a.217.217 0 0 1-.07-.252.226.226 0 0 1 .21-.157H7.43a.913.913 0 0 0 .87-.6l1.46-4.157a.235.235 0 0 1 .436 0l1.46 4.157a.914.914 0 0 0 .87.6h4.061a.235.235 0 0 1 .217.157.218.218 0 0 1-.07.252l-3.538 2.921Z"/>
                                    </svg>
                                </span>
                            <span className="label">Favorites</span>
                        </button>
                        <ul className="sub-menu menu collapse-content" id="favorites-menu" style={{ maxHeight: '0px' }} role="menu">
                            <li>
                                <a href="#" className="favorite-route route-border-left b38" tabIndex="-1">
                                        <span className="label" style={{ borderColor: '#33A8DC' }}>
                                            <strong>B38</strong> Ridgewood - Downtown Brooklyn
                                        </span>
                                </a>
                                <button className="remove-favorite small-link clear-button" tabIndex="-1">Remove Route From Favorites</button>
                            </li>
                            <li>
                                <a href="#" className="favorite-stop" tabIndex="-1">
                                    <span className="label"><strong>901070</strong> Cadman Plaza West / Tillary</span>
                                </a>
                                <button className="remove-favorite small-link clear-button" tabIndex="-1">Remove Stop From Favorites</button>
                            </li>
                            <li>
                                <a href="#" className="favorite-stop" tabIndex="-1">
                                    <span className="label"><strong>930058</strong> DeKalb Ave / Throop Ave</span>
                                </a>
                                <button className="remove-favorite small-link clear-button" tabIndex="-1">Remove Stop From Favorites</button>
                            </li>
                            <li>
                                <a href="#" className="favorite-route route-border-left b43" tabIndex="-1">
                                        <span className="label" style={{ borderColor: '#EE362E' }}>
                                            <strong>B43</strong> Greenpoint - Lefferts Gardens
                                        </span>
                                </a>
                                <button className="remove-favorite small-link clear-button" tabIndex="-1">Remove Route From Favorites</button>
                            </li>
                            <li>
                                <a href="#" className="favorite-stop" tabIndex="-1">
                                    <span className="label"><strong>302947</strong> Fulton St / Bond St</span>
                                </a>
                                <button className="remove-favorite small-link clear-button" tabIndex="-1">Remove Stop From Favorites</button>
                            </li>
                        </ul>
                    </li>
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
                        </ul>
                    </li>
                    <li className="parent collapsible">
                        <button id="translate-menu-trigger" className="sub-menu-trigger collapse-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Toggle Google Translate Menu">
                                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path className="blue" fillRule="evenodd" d="M10 0C6.434 0 3.313 1.955 1.606 4.875l3.27 2.616a5.91 5.91 0 0 1 9.127-2.036l2.815-2.989C15.188.93 12.901 0 10 0Zm0 20c2.585 0 4.682-.738 6.26-1.985l-3.437-2.687.023-.03A5.909 5.909 0 0 1 4.9 12.556l-3.314 2.535C3.29 18.03 6.42 20 10 20Zm7.27-2.927c1.65-1.81 2.503-4.31 2.503-7.073 0-.62-.043-1.228-.13-1.818H10v3.636h5.85a5.917 5.917 0 0 1-1.83 2.714l3.25 2.54ZM4.319 10c0 .41.042.807.12 1.192l-3.463 2.65A10.17 10.17 0 0 1 .227 10c0-1.373.271-2.682.76-3.874l3.438 2.75A5.95 5.95 0 0 0 4.318 10Z" clipRule="evenodd"/>
                                    </svg>
                                </span>
                            <span className="label">Google Translate</span>
                        </button>
                        <div className="sub-menu" id="google-translate-menu" style={{ maxHeight: '0px' }} role="menu">
                            <p>google translate stuff</p>
                        </div>
                    </li>
                </ul>
            </div>
        </ErrorBoundary>
    )
}

export default Footer;