import React, {useContext, useEffect, useState} from 'react';
import Autosuggest from 'react-autosuggest';
import ErrorBoundary from "../util/errorBoundary";
import {useSearch} from "../../js/updateState/SearchEffect.tsx";
import {CardStateContext} from "../util/CardStateComponent.tsx";

// Function to fetch suggestions from an external API
const getSuggestions = async (value) => {
    console.log(`fetching autocomplete for ${value}: https://${process.env.ENV_ADDRESS}/api/autocomplete?term=${value}`)
    const response = await fetch(`https://${process.env.ENV_ADDRESS}/api/autocomplete?term=${value}`);
    const suggestions = await response.json();
    console.log("got suggestions!",suggestions)
    return suggestions;
};

const SearchBar = () => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const onSuggestionsFetchRequested = async ({ value }) => {
        const suggestions = await getSuggestions(value);
        setSuggestions(suggestions);
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };


    const onSuggestionSelected = (event, { suggestion }) => {
        console.log('Selected suggestion:', suggestion);
        const lineRef = suggestion.value
        const { search } = useSearch();

        search(lineRef);
    };


    const {state} = useContext(CardStateContext)
    const [searchTerm, setSearchTerm] = useState("Search");
    console.log("Search",searchTerm)
    useEffect(() => {
        let newSearchTerm = state?.currentCard?.searchTerm
        console.log("new Search",newSearchTerm,state,state?.currentCard,state?.currentCard?.searchTerm)
        if(newSearchTerm!==searchTerm){
            if(newSearchTerm===null || newSearchTerm==="" || typeof newSearchTerm ==="undefined"){
                if(searchTerm!=="Search")
                {setSearchTerm("Search")}
            }
            else {
                setSearchTerm(newSearchTerm)
            }
        }
    }, [state]);
    console.log("Search",searchTerm)
    const inputProps = {
        placeholder: searchTerm,
        value,
        onChange: (event, { newValue }) => setValue(newValue),
    };

    return (
        <ErrorBoundary>
            <div id="search">
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
