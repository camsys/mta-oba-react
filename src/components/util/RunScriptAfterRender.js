import React, { useEffect } from 'react';
import log from 'loglevel';

export const RunScriptAfterRender = (WrappedComponent, scriptSrc) => {
    log.info("running RunScriptAfterRender",WrappedComponent,scriptSrc)
    return (props) => {
        useEffect(() => {
            log.info("RunScriptAfterRender starting attempt to run script")
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            log.info("RunScriptAfterRender attempting to load script",script)
            script.onload = () => {
                log.info(`RunScriptAfterRender script ${scriptSrc} loaded after render`,script);
            };
            document.body.appendChild(script);
            log.info("RunScriptAfterRender appended script to body",script)

            // Cleanup script on unmount
            return () => {
                log.info("RunScriptAfterRender removing script",script)
                document.body.removeChild(script);
                log.info("RunScriptAfterRender removed script",script)
            };
        });

        return <WrappedComponent {...props} />;
    };
};

export const ScriptForAfterCollapsible = "js/openCollapsibles.js"