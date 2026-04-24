import React, { useEffect, useState } from 'react';
import { UnderlineOnFocusElement } from "../shared/common";


const GoogleTranslateLoadButton = ({ handleClick }: { handleClick: () => void }) => {
    return (
        
        <UnderlineOnFocusElement
                as="button"
                id="translate-menu-trigger"
                onClick={handleClick}
                className="py-3 bg-[#e8e8e8] w-[100%] text-mta-blue focus-visible:decoration-mta-blue"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label="Toggle Google Translate Menu"
            >
                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                    <svg className="fill-none" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9.96826" cy="9.96826" r="9.31569" stroke="currentColor" strokeWidth="1.30514"/>
                        <path d="M9.96729 0.652344C11.0878 0.652344 12.2522 1.50975 13.1743 3.22852C14.0818 4.92013 14.6636 7.30224 14.6636 9.96875C14.6635 12.6351 14.0818 15.0165 13.1743 16.708C12.2522 18.4268 11.0878 19.2842 9.96729 19.2842C8.8469 19.2839 7.68325 18.4265 6.76123 16.708C5.85377 15.0165 5.27204 12.6351 5.27197 9.96875C5.27197 7.30222 5.85371 4.92014 6.76123 3.22852C7.68325 1.50998 8.8469 0.652574 9.96729 0.652344Z" stroke="currentColor" strokeWidth="1.30514"/>
                        <path d="M18.9252 7.50287L1.26712 7.50287" stroke="currentColor" strokeWidth="1.30514"/>
                        <line x1="9.90602" y1="19.3052" x2="9.90602" y2="0.905695" stroke="currentColor" strokeWidth="1.30514"/>
                        <path d="M18.573 13.1398L1.17937 13.1398" stroke="currentColor" strokeWidth="1.30514"/>
                    </svg>
                </span>
                <span className="px-1 label text-sm font-semibold">TRANSLATE</span>

                
            </UnderlineOnFocusElement>
    )
}

const GoogleTranslateMenu = () => {
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const loadGoogleTranslate = () => {
        if (scriptLoaded) return;

        const googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                { pageLanguage: "en", autoDisplay: false },
                "google-translate"
            );
        };

        let addScript = document.createElement("script");
        addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(addScript);

        window.googleTranslateElementInit = googleTranslateElementInit;

        setScriptLoaded(true);
    };

    const acceptRisk = () => {
        loadGoogleTranslate();
    };

    useEffect(() => {
            acceptRisk();
        }, []);
    return (<div className="py-3 bg-[#e8e8e8] w-[100%]" id="google-translate"></div>);
}


export const GoogleTranslateButton = () => {
    const [showWarning, setShowWarning] = useState(true);


    const handleClick = () => {
        setShowWarning(false);
    };
    return (
        <>
            {showWarning ? 
                <GoogleTranslateLoadButton handleClick={handleClick}/> :
                <GoogleTranslateMenu />}
            
        </>
    );
};


            // <div className="sub-menu collapse-content" id="google-translate-menu" role="menu" style={{ maxHeight: '0px' }}>
            //     <div id="google-translate" tabIndex={-1}>
            //     {showWarning && (
            //         <div className="google-translate-warning">
            //             <p><strong>Warning: Enabling This Feature May Slow Your Browser</strong></p>
            //             <p>Google Translate can translate this page into another language. Even if no translation is selected, enabling it may gradually increase memory usage or reduce performance.</p>
            //             <p>If the page becomes slow or unresponsive, reloading it will restore normal performance.</p>
            //             <button onClick={acceptRisk} aria-label='Enable Google Translate and Continue' className='button' tabIndex={-1}>Continue and Enable Google Translate</button>
            //         </div>
            //     )}
            //     </div>
            // </div>