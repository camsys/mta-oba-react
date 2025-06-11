import log from 'loglevel';
import {v4 as uuidv4} from 'uuid';

const STORAGE_KEY = "__click_log";
const MAX_EVENTS = 200;


// This object can be used to map event IDs to more readable names
// desired format is: <ts>-timestamp_<section>_<subsection>_<button>_<id>-id
const allowedClasses = new Set(["card", "vehicle-card", "stop-card", "search-bar", 
    "sidebar-button", "map-button", "favorite-button","favorite-stop","favorite-route", 
    "near-me-button", "refresh-button", "menu-button","bus",
    "route-direction","header", "footer", "search-result",
    "search-box","example-searches","beta-bar","header","sidebar-content",
    "leaflet-container","clear-button"
]);

const useTitleInsteadOfInnerText = new Set([
    "Marker"
]);


const getSessionUuid = () => {
  log.info("Retrieving session UUID");
  let sessionUuid = sessionStorage.getItem("uuid") 
  if(!sessionUuid) {
    log.info("No session UUID found in sessionStorage, checking URL parameters");
    sessionUuid = new URLSearchParams(window.location.search).get("uuid");
    sessionStorage.setItem("uuid", sessionUuid);
  }
  if (!sessionUuid) {
    sessionUuid = uuidv4();
    log.info("No session UUID found, generating new one:", sessionUuid);
    sessionStorage.setItem("uuid", sessionUuid);
  }
  return sessionUuid;
}

const clickHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    trackingHandler(target);
  };

  const keypressHandler = (e: KeyboardEvent) => {
    // Only handle Enter key
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      trackingHandler(target);
    }
  };

const trackingHandler = (target:HTMLElement) => {
  log.info("trackingHandler called with target:", target);
  const context:string[] = []
  let el: HTMLElement | null = target;
  if(el?.innerText && el.innerText.length < 45 && el.innerText.length > 0) {
      context.push(el.innerText)
  } else if(el.hasAttribute("alt")){
      context.push(el.title);
  } else {
    log.warn("tracking cannot work with element:", el);
    context.push(el.getAttribute("value")||"")
  }
  while (el && el !== document.body) {
      for (const className of el.classList) {
          if (allowedClasses.has(className)) {
              context.push(className);
          }
      }
      el = el.parentElement;
  }
  let clickLocation = Date.now().toString() + ","+ getSessionUuid() + ","+ formatContext(context)
  log.info("tracking click context:", clickLocation);
  logClick(clickLocation)
  log.info("tracking getClickLog:", getClickLog());
};

function formatContext (context: string[]): string {
    return context.slice().reverse().map((part, index) => {
        if (!part) return `part-${index}`;
        const out = part.split(/,|---/)[0].trim()
            .replace(/\s+|-|\//g, "_")
            .replace(/_+/g,"_")

        return out || `part-${index}`;
    }).join("-");
}

function logClick(clickLog:string) {
    if (!clickLog) return;
    const raw = sessionStorage.getItem(STORAGE_KEY) || "";
    const parts = raw.split("|").filter(Boolean);

    parts.push(clickLog);

    // Trim oldest if too long
    if (parts.length > MAX_EVENTS) {
    parts.splice(0, parts.length - MAX_EVENTS);
    }

    sessionStorage.setItem(STORAGE_KEY, parts.join("|"));
}

function getClickLog() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? raw.split("|").filter(Boolean) : [];
}

function countItemsWithinCharLimit(items, maxChars) {
  let totalChars = 0;
  let count = 0;

  for (const item of items) {
    const length = item.length;
    if (totalChars + length > maxChars) break;
    totalChars += length;
    count++;
  }

  return count;
}


function drainClickLog(n:number) {
  const events = getClickLog();
  countItemsWithinCharLimit(events, n);
  sessionStorage.removeItem(STORAGE_KEY);
  let eventsUpdate = events.splice(0, countItemsWithinCharLimit(events, n));
  sessionStorage.setItem(STORAGE_KEY, events.join("|"));
  return eventsUpdate;
}

function drainClickLogAsSearchField(url:string) {
    let maxChars = 2000-url.length-250;
    if(maxChars>1000) maxChars = 1000;
    const events = drainClickLog(maxChars);
    return STORAGE_KEY+"=" + events.join("|");
}

const postClickLog = async ()=>{
  try {
    log.info("Posting click log to analytics endpoint");
    let events = drainClickLog(10000)
    log.info("Posting click log events:", events);
    await fetch(process.env.TRACKING_HOST_ADDRESS+"/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(events)
    });
  }
  catch (error) {
    log.error("Error posting click log:", error);
  }
};

export {trackingHandler,logClick, getClickLog, postClickLog, drainClickLogAsSearchField, clickHandler, keypressHandler,getSessionUuid};
