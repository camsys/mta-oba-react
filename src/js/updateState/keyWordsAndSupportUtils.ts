import { Card } from "./DataModels";
import log from "loglevel";

export function getSearchTermAdditions(currentCard:Card){
    log.info("getSearchTermAdditions called, currentCard: ", currentCard);
    if (currentCard==null || currentCard==undefined){
        log.error("getSearchTermAdditions called with null or undefined currentCard");
        return "";
    }
    let url = "&key="+process.env.API_KEY+"&newUI=true&sessionId=" + currentCard.sessionUuid

    return url;
}