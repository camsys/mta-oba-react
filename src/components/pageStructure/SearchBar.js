import React, {useContext, useEffect, useState} from 'react';
import Autosuggest from 'react-autosuggest';
import ErrorBoundary from "../util/errorBoundary";
import {useSearch} from "../../js/updateState/SearchEffect.ts";
import {CardStateContext} from "../util/CardStateComponent.tsx";
import log from 'loglevel';

// Function to fetch suggestions from an external API
const getSuggestions = async (value) => {
    log.info(`fetching autocomplete for ${value}: https://${process.env.ENV_ADDRESS}/api/autocomplete?term=${value}`)
    const response = await fetch(`https://${process.env.ENV_ADDRESS}/api/autocomplete?term=${value}`);
    const suggestions = await response.json();
    log.info("got suggestions!",suggestions)
    return suggestions;
};

const SearchBar = () => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const onSuggestionsFetchRequested = async ({ value }) => {
        const suggestions = await getSuggestions(value);
        if(suggestions!=null){
            setSuggestions(suggestions);
        }
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };


    const onSuggestionSelected = (event, { suggestion }) => {
        log.info('Selected suggestion:', suggestion);
        const lineRef = suggestion.value
        search(lineRef);
    };

    const { search } = useSearch();
    const {state} = useContext(CardStateContext)
    const [searchTerm, setSearchTerm] = useState("Search");
    log.info("Search",searchTerm)
    useEffect(() => {
        let newSearchTerm = state?.currentCard?.searchTerm
        log.info("new Search",newSearchTerm,state,state?.currentCard,state?.currentCard?.searchTerm,searchTerm)
        if(newSearchTerm!==searchTerm){
            if(newSearchTerm===null || newSearchTerm==="" || typeof newSearchTerm ==="undefined"){
                setSearchTerm("Search")
                setValue("")
            }
            else {
                setValue(newSearchTerm)
            }
        }
    }, [state]);
    log.info("Search",searchTerm)
    const inputProps = {
        placeholder: searchTerm,
        id: "search-input",
        value,
        onChange: (event, { newValue }) => setValue(newValue),
    };

    return (
        <ErrorBoundary>
            <div id="search" onKeyDown={(event)=>{if(event.key=="Enter"){search(event.target?.value)}}}>
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    onSuggestionSelected={onSuggestionSelected}
                    getSuggestionValue={(suggestion) => suggestion.label}
                    renderSuggestion={(suggestion) => <div>{suggestion.label}</div>}
                    inputProps={inputProps}
                />
                <div className="search-instructions">
                    <p>Enter an intersection, bus route or bus stop code.</p>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default SearchBar;
