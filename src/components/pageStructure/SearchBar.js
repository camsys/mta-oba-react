import React, {useContext, useEffect, useState} from 'react';
import Autosuggest from 'react-autosuggest';
import ErrorBoundary from "../util/errorBoundary";
import {useNavigation} from "../../js/updateState/NavigationEffect.ts";
import {CardStateContext} from "../util/CardStateComponent.tsx";
import log from 'loglevel';
import { trackingHandler } from '../../js/updateState/handleTracking.ts';

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
    const [isFocused, setIsFocused] = useState(false);

    const { search } = useNavigation();
    const {state} = useContext(CardStateContext)
    const [searchTerm, setSearchTerm] = useState("Route, intersection, or stop code");
    log.info("Search",searchTerm)

    const onSuggestionsFetchRequested = async ({ value }) => {
        try{
            const suggestions = await getSuggestions(value);
            if(suggestions!=null){
                setSuggestions(suggestions);
            }
        } catch (error) {
            log.error('Error fetching suggestions:', error);
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


    const clearSearch = (event) => {
        setSearchTerm("Route, intersection, or stop code")
        setValue("")
    }

    const clearAndFocusSearch = (event) => {
        clearSearch()
        document.getElementById("search-input").focus();
    }


    useEffect(() => {
        let newSearchTerm = state?.currentCard?.searchTerm
        log.info("new Search",newSearchTerm,state,state?.currentCard,state?.currentCard?.searchTerm,searchTerm)
        let parts = newSearchTerm.split(':');
        log.info("search term changed");
        if(parts[1]&&parts[1].length>0 
            && 
            (parts[1].substring(0,9)==="MTA NYCT_" ||
            parts[1].substring(0,6)==='MTABC_')
        ){
            log.info("abbreviating search term",newSearchTerm,parts[0])
            newSearchTerm = parts[0]
        }
        if(newSearchTerm!==searchTerm){
            if(newSearchTerm===null || newSearchTerm==="" || typeof newSearchTerm ==="undefined"){
                clearSearch()
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
        onFocus: () => setIsFocused(true),
        onBlur: () => {
            // Allow suggestion click to register before blur ends focus
            setTimeout(() => setIsFocused(false), 100);
        },
    };



    return (
        <ErrorBoundary>
            <div id="search" onKeyDown={(event) => {
                if (event.key === "Enter") {
                    search(event.target?.value);
                }
            }}>
                <div className={`search-box${isFocused ? ' is-focused' : ''}`}>
                    <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                        onSuggestionSelected={onSuggestionSelected}
                        getSuggestionValue={(suggestion) => suggestion.label}
                        renderSuggestion={(suggestion) => <div>{suggestion.label}</div>}
                        inputProps={inputProps}
                    />
                    <button
                        type="button"
                        aria-label="clear search button"
                        id="clear-search"
                        className="clear-button button icon-only"
                        onClick={clearAndFocusSearch}
                        disabled={value.trim() === ''}
                    >
                        <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M20 10C20 15.5229 15.5228 20 10 20C4.47715 20 0 15.5229 0 10C0 4.47716 4.47715 0 10 0C15.5228 0 20 4.47716 20 10ZM5.67094 5.67096C6.08936 5.25254 6.76776 5.25254 7.18617 5.67096L10 8.48477L12.8138 5.67096C13.2322 5.25254 13.9106 5.25254 14.329 5.67096C14.7474 6.08937 14.7474 6.76777 14.329 7.18619L11.5152 10L14.329 12.8138C14.7474 13.2322 14.7474 13.9106 14.329 14.329C13.9106 14.7474 13.2322 14.7474 12.8138 14.329L10 11.5152L7.18617 14.329C6.76776 14.7474 6.08936 14.7474 5.67094 14.329C5.25253 13.9106 5.25253 13.2322 5.67094 12.8138L8.48476 10L5.67094 7.18619C5.25253 6.76777 5.25253 6.08937 5.67094 5.67096Z"/>
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default SearchBar;
