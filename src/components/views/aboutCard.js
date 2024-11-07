import React from 'react';
import log from 'loglevel';


function getAboutCard  () {
    log.info("adding about card")
    return (<div class="wiki_content" id="content">
        <div id="text">
            <h2 id="HAbout" style="color: rgb(13, 81, 117);">
                <span><strong>About</strong></span>
            </h2>
            <hr>
            <p>MTA Bus Time uses Global Positioning System (GPS) hardware and wireless communications technology to track the real-time location of buses. 
                This innovation lets you use your computer, cell phone, smartphone or other tech device to get information about when the next bus will arrive at your stop, 
                even if you are still at home, the office, shopping, or dining.
            </p>
            <div class="wikimodel-emptyline" />
            <p>MTA Bus Time is available using a desktop website, a mobile website (which can also be used as an accessibility-friendly text-only desktop website) on iPhone, 
                Android, BlackBerry, or other smartphones, and using SMS text messaging on any mobile phone. 
                &nbsp;For instructions on how to use each version of MTA Bus Time visit the 
                <span class="wikilink"><a href="/developers/doc:Help/Index">Help Pages</a></span>.
            </p>
            <div class="wikimodel-emptyline" />
            <p>For more information about the technology behind MTA Bus Time please visit the 
                <span class="wikilink"><a href="/developers/doc:Main/Technology">Technology</a></span> page.</p><p class="meta">
            </p>
        </div>
    </div>);
}

export default getAboutCard;