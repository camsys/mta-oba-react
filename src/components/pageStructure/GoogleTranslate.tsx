import React, { useState } from 'react';

export const GoogleTranslateButton = () => {
    const [showWarning, setShowWarning] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const loadGoogleTranslate = () => {
        if (scriptLoaded) return;

        const googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                { pageLanguage: "en", autoDisplay: false },
                "google-translate"
            );
        };

        const addScript = document.createElement("script");
        addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(addScript);
        window.googleTranslateElementInit = googleTranslateElementInit;

        setScriptLoaded(true);
    };

    const handleClick = () => {
        if (!scriptLoaded) {
            setShowWarning(true);
        } else {
            toggleMenu();
        }
    };

    const toggleMenu = () => {
        const menu = document.getElementById("google-translate-menu");
        if (menu) {
            const isOpen = menu.style.maxHeight !== '0px';
            menu.style.maxHeight = isOpen ? '0px' : '200px';
        }
    };

    const acceptRisk = () => {
        loadGoogleTranslate();
        setShowWarning(false);
        // auto-open menu after loading
        setTimeout(() => toggleMenu(), 500);
    };

    return (
        <>
            <button
                id="translate-menu-trigger"
                onClick={handleClick}
                className="sub-menu-trigger collapse-trigger"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label="Toggle Google Translate Menu"
            >
                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path className="blue" fillRule="evenodd" d="M10 0C6.434 0 3.313 1.955 1.606 4.875l3.27 2.616a5.91 5.91 0 0 1 9.127-2.036l2.815-2.989C15.188.93 12.901 0 10 0Zm0 20c2.585 0 4.682-.738 6.26-1.985l-3.437-2.687.023-.03A5.909 5.909 0 0 1 4.9 12.556l-3.314 2.535C3.29 18.03 6.42 20 10 20Zm7.27-2.927c1.65-1.81 2.503-4.31 2.503-7.073 0-.62-.043-1.228-.13-1.818H10v3.636h5.85a5.917 5.917 0 0 1-1.83 2.714l3.25 2.54ZM4.319 10c0 .41.042.807.12 1.192l-3.463 2.65A10.17 10.17 0 0 1 .227 10c0-1.373.271-2.682.76-3.874l3.438 2.75A5.95 5.95 0 0 0 4.318 10Z" clipRule="evenodd"/>
                        </svg>
                </span>
                <span className="label">Google Translate</span>
            </button>

            <div className="sub-menu collapse-content" id="google-translate-menu" style={{ maxHeight: '0px' }} role="menu">
                <div id="google-translate" tabIndex={-2}></div>
            </div>

            {showWarning && (
                <div className="google-warning-modal">
                    <div className="modal-content">
                        <h2>Warning: Enabling This Feature May Slow Your Browser</h2>
                        <p>
                            Google Translate can translate this page into another language.
                        </p>
                        <p>
                            However, even if no translation is selected, enabling it may gradually increase memory usage or reduce performance over time.
                        </p>
                        <p>
                            If the page becomes slow or unresponsive, closing and reopening the page will return it to normal.
                        </p>
                        <p>
                            Click “Continue” to enable Google Translate.
                        </p>
                        <div className="modal-buttons">
                            <button onClick={acceptRisk}>Continue</button>
                            <button onClick={() => setShowWarning(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};