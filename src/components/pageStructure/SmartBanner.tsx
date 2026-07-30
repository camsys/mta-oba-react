import React, {useContext, useEffect, useState} from 'react';
import log from 'loglevel';
import {CardStateContext} from "../util/CardStateComponent.tsx";
import {CardType} from "../../js/updateState/DataModels";
import mtaAppIcon from "../../img/mta-app-icon.svg";
import closeCircleIcon from "../../img/icon/close-circle.svg";

const IOS_UA_REGEX = /iPhone|iPad|iPod/i;
const ANDROID_UA_REGEX = /Android/i;

const IOS_APP_STORE_URL = "https://apps.apple.com/us/app/the-official-mta-app/id1297605670";
const GOOGLE_PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=info.mta.mymta&hl=en_US";

function SmartBanner(): JSX.Element {
    const { state } = useContext(CardStateContext);
    const [dismissed, setDismissed] = useState(false);
    const isHome = state.currentCard.type === CardType.HomeCard;
    const isIOS = IOS_UA_REGEX.test(navigator.userAgent);
    const isAndroid = ANDROID_UA_REGEX.test(navigator.userAgent);
    const shouldRender = isHome && (isIOS || isAndroid);
    const storeUrl = isIOS ? IOS_APP_STORE_URL : GOOGLE_PLAY_STORE_URL;

    useEffect(() => {
        document.body.classList.toggle('smart-banner-visible', shouldRender && !dismissed);
        return () => {
            document.body.classList.remove('smart-banner-visible');
        };
    }, [shouldRender, dismissed]);

    if (!shouldRender) {
        return <></>;
    }

    return (
        <div
            className={`fixed left-0 bottom-0 z-[100] w-full flex items-center gap-2
                bg-white text-mta-black border-t-4   border-mta-blue
                px-4 h-[5.125rem]
                transition-transform duration-500 ease-in-out
                ${dismissed ? "translate-y-full pointer-events-none" : "translate-y-0"}
                six:hidden`}
            role="region"
            aria-label="Get the MTA app"
            aria-hidden={dismissed}
        >
            <button
                className="relative shrink-0 w-6 h-6 rounded-sm bg-white p-0 border-none
                    focus-visible:outline-2 focus-visible:outline-mta-dark-blue focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-mta-dark-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff] bg-mta-blue"
                aria-label="Dismiss app download banner"
                tabIndex={dismissed ? -1 : 0}
                onClick={() => setDismissed(true)}
            >
                <img src={closeCircleIcon} alt="Dismiss app download banner" className="absolute inset-px w-[calc(100%-2px)] h-[calc(100%-2px)]" />
            </button>
            <img src={mtaAppIcon} alt="MTA App icon" className="w-12 h-12 rounded-lg shrink-0" />
            <div className="flex flex-col grow leading-tight">
                <span className="font-bold">Get The MTA App</span>
                <span className="text-sm">Real-time tracking and favorites</span>
            </div>
            <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-bold text-sm text-white bg-mta-dark-blue rounded-sm px-5 py-2.5 border-none
                    focus-visible:outline-2 focus-visible:outline-mta-dark-blue focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-mta-dark-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff] bg-mta-blue"
                tabIndex={dismissed ? -1 : 0}
            >
                Download
            </a>
        </div>
    );
}

export default SmartBanner;
