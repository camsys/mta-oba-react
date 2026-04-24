import React, {useContext} from 'react';
import log from 'loglevel';
import ErrorBoundary from "../util/errorBoundary";
import bustimeLogo from '../../img/bustime-logo.svg';
import mtaLogo from '../../img/mta-logo.svg';
import favicon from '../../img/favicon.ico';
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";
import {UnderlineOnFocusElement} from "Components/shared/common";
import {CardStateContext} from "../util/CardStateComponent.tsx";
import {CardType} from "../../js/updateState/DataModels";



function Header  () {
    log.info("adding header")
    const { search } = useNavigation();
    const { state } = useContext(CardStateContext);
    let bannerText = process.env.BETA_BANNER_TEXT;
    let bannerLink = process.env.BETA_BANNER_LINK;
    return (
        <ErrorBoundary>
            {state.currentCard.type === CardType.HomeCard && (
                bannerText && bannerLink && (
                    <div className="beta-bar">
                        <UnderlineOnFocusElement href={bannerLink} variant="black">{bannerText}</UnderlineOnFocusElement>
                    </div>
                )
            )}
            <header className="header pt-2 pb-3" id="header">
                <div className="header-main text-[1.20em] ">
                    <a href="#" onClick={(e) => {e.preventDefault(); search("")}} aria-label="MTA Bus Time Home" className="logo-link group">
                        <img src={bustimeLogo} alt="MTA Bus Time" className="logo group-focus-visible:border-mta-yellow border-b-3 border-transparent" />
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