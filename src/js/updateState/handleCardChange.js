import { useContext, useEffect } from 'react';
import { GlobalStateContext } from '../../components/util/globalState';
import {OBA} from "../oba";
import queryString from "query-string";

const handleCardChange = () => {
    const { state, setState } = useContext(GlobalStateContext);

    const getCurrentCard = () => {
        OBA.Util.log("determining current card")
        // const query = queryString
        // OBA.Util.log("query:")
        // OBA.Util.log(query)
        let locationSearch = queryString.parse(location.search)
        OBA.Util.log("query: location.search")
        OBA.Util.log(locationSearch)
        if(locationSearch[OBA.Config.cards.routeCard.queryIdentifier]!=null){
            return OBA.Config.cards.routeCard
        }
        return OBA.Config.cards.homeCard
    };

        OBA.Util.log("determining card method called")
        // OBA.Util.log("current card:")
        // OBA.Util.log(state.currentCard)
        // OBA.Util.log("current stack:")
        // OBA.Util.log(state.cardStack)
        let currentCard = getCurrentCard()
        OBA.Util.log("current card assessed results:")
        OBA.Util.log(currentCard)
        let cardStack = state.cardStack
        let mostRecent = cardStack.pop()
        OBA.Util.log("most recent card before current card:")
        OBA.Util.log(mostRecent)
        if(mostRecent==null || currentCard.name!==mostRecent.name || currentCard.identifier!==mostRecent.identifier) {
            OBA.Util.log("current state is not most recent state. updating cards")
            OBA.Util.log("current stack target:")
            OBA.Util.log(cardStack)
            cardStack.push(currentCard)
            setState((prevState) => ({
                ...prevState,
                currentCard: currentCard,
                cardStack: cardStack
            }));
            OBA.Util.log("***updated state***")
            OBA.Util.log("current card:")
            OBA.Util.log(state.currentCard)
            OBA.Util.log("current stack:")
            OBA.Util.log(state.cardStack)
        }
        return currentCard

};

export default handleCardChange;