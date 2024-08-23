import React, { useEffect } from 'react';

export const RunScriptAfterRender = (WrappedComponent, scriptSrc) => {
    //console.log("running RunScriptAfterRender",WrappedComponent,scriptSrc)
    return (props) => {
        useEffect(() => {
            //console.log("RunScriptAfterRender starting attempt to run script")
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            //console.log("RunScriptAfterRender attempting to load script",script)
            script.onload = () => {
                //console.log(`RunScriptAfterRender script ${scriptSrc} loaded after render`,script);
            };
            document.body.appendChild(script);
            //console.log("RunScriptAfterRender appended script to body",script)

            // Cleanup script on unmount
            return () => {
                //console.log("RunScriptAfterRender removing script",script)
                document.body.removeChild(script);
                //console.log("RunScriptAfterRender removed script",script)
            };
        });

        return <WrappedComponent {...props} />;
    };
};

export const ScriptForAfterCollapsible = "js/openCollapsibles.js"