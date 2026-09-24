import React, {useState} from 'react';
import log from 'loglevel';
import ErrorBoundary from "../util/errorBoundary";
import bustimeLogo from '../../img/bustime-logo.svg';
import mtaLogo from '../../img/mta-logo.svg';
import favicon from '../../img/favicon.ico';
import closeCircleIcon from '../../img/icon/close-circle.svg';
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";
import {setCookie, getCookie} from "../util/appCookies.js";

const SURVEY_BANNER_DISMISSED_COOKIE = "surveyBannerDismissed";
const SURVEY_BANNER_DISMISS_DAYS = 1;

// BETA_BANNER_TEXT may mark a portion to underline by wrapping it in double underscores

function renderBannerText(text) {
    const parts = text.split(/__(.+?)__/g);
    return parts.map((part, i) =>
        i % 2 === 1 ? <span className="beta-bar-underline" key={i}>{part}</span> : part
    );
}

function Header  () {
    log.info("adding header")
    const { search } = useNavigation();
    const [bannerDismissed, setBannerDismissed] = useState(() => !!getCookie(SURVEY_BANNER_DISMISSED_COOKIE));
    let bannerChip = process.env.BETA_BANNER_CHIP;
    let bannerText = process.env.BETA_BANNER_TEXT;
    let bannerLink = process.env.BETA_BANNER_LINK;

    const dismissBanner = () => {
        setCookie(SURVEY_BANNER_DISMISSED_COOKIE, "true", SURVEY_BANNER_DISMISS_DAYS);
        setBannerDismissed(true);
    };

    return (
        <ErrorBoundary>
            {bannerText && bannerLink && !bannerDismissed && (
                <div className="beta-bar">
                    <button
                        className="beta-bar-dismiss"
                        aria-label="Dismiss announcement"
                        onClick={dismissBanner}
                    >
                        <img src={closeCircleIcon} alt="" aria-hidden="true" />
                    </button>
                    <a href={bannerLink} className="beta-bar-link">
                        <span className="beta-bar-text">
                            {bannerChip && <span className="beta-bar-chip">{bannerChip}</span>}
                            <span className="beta-bar-detail">{renderBannerText(bannerText)}</span>
                        </span>
                        <svg className="beta-bar-chevron" width="32" height="32" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M7.5 4.5L13 10L7.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>
            )}
            <header className="header pt-2 pb-3" id="header">
                <div className="header-main text-[1.20em] ">
                    <a href="#" onClick={(e) => {e.preventDefault(); search("")}} aria-label="MTA Bus Time Home" className="logo-link group">
                        <img src={bustimeLogo} alt="MTA Bus Time" className="logo group-focus-visible:border-mta-yellow border-b-3 border-transparent
                         h-[48.3px]  nine:h-[48.3px]" />
                    </a>
                    
                </div>

                <div className="w-px h-3/4 bg-mta-black-4 self-end"></div>

                <a href="https://www.mta.info/" target="_blank" aria-label="MTA Home" className=" bottom flex mta-logo-link justify-end items-end focus-visible:border-mta-yellow border-b-3 border-transparent">
                    <img src={mtaLogo} alt="MTA" className="mta-logo bottom" />
                </a>
            </header>
        </ErrorBoundary>
    )
}

export default Header;