import { useContext, useEffect } from 'react';
import { CardStateContext } from 'Components/util/CardStateComponent';
import {OBA} from "../oba";
import queryString from "query-string";

const handleCardChange = () => {
    const { state, setState } = useContext(CardStateContext);

    const getCurrentCard = () => {
        log.info("determining current card")
        // const query = queryString
        // log.info("query:")
        // log.info(query)
        log.info("parsing location.search to generate card")
        let locationSearch = queryString.parse(location.search)
        log.info("query: location.search")
        log.info(locationSearch)
        if(locationSearch[OBA.Config.cards.routeCard.queryIdentifier]!=null){
            return OBA.Config.cards.routeCard
        }
        return OBA.Config.cards.homeCard
    };

        log.info("determining card method called")
        // log.info("current card:")
        // log.info(state.currentCard)
        // log.info("current stack:")
        // log.info(state.cardStack)
        let currentCard = getCurrentCard()
        log.info("current card assessed results:")
        log.info(currentCard)
        let cardStack = state.cardStack
        let mostRecent = cardStack.pop()
        log.info("most recent card before current card:")
        log.info(mostRecent)
        // useEffect(()=>{
        //     if(mostRecent==null || currentCard.name!==mostRecent.name || currentCard.identifier!==mostRecent.identifier) {
        //         log.info("current state is not most recent state. updating cards")
        //         log.info("current stack target:")
        //         log.info(cardStack)
        //         cardStack.push(currentCard)
        //             setState((prevState) => ({
        //             ...prevState,
        //             currentCard: currentCard,
        //             cardStack: cardStack
        //             }))
        //
        //
        //         log.info("***updated state***")
        //         log.info("current card:")
        //         log.info(state.currentCard)
        //         log.info("current stack:")
        //         log.info(state.cardStack)
        //     }
        // }, [setState]);
        return currentCard

};

export default handleCardChange;