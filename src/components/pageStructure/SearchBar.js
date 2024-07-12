import React, {useContext, useState} from 'react';
import Autosuggest from 'react-autosuggest';
import ErrorBoundary from "../util/errorBoundary";
import {fetchSearchData, generateInitialCard, updateCard} from "../../js/updateState/searchEffect";
import {CardStateContext} from "../util/CardStateComponent";

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


    const { state, setState } = useContext(CardStateContext);

    const onSuggestionSelected = (event, { suggestion }) => {
        console.log('Selected suggestion:', suggestion);
        const lineRef = suggestion.value
        // location.href = `?LineRef=${lineRef}`;

        let url = new URL(window.location.href);
        url.searchParams.set('LineRef', lineRef);
        window.history.pushState({}, '', url);
        console.log('updated url with suggestion')



        console.log("requesting search")
        fetchSearchData(state,setState,lineRef);
    };

    const inputProps = {
        placeholder: 'Search...',
        value,
        onChange: (event, { newValue }) => setValue(newValue),
    };

    return (
        <ErrorBoundary>
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                onSuggestionSelected={onSuggestionSelected}
                getSuggestionValue={(suggestion) => suggestion.label}
                renderSuggestion={(suggestion) => <div>{suggestion.label}</div>}
                inputProps={inputProps}
            />
        </ErrorBoundary>
    );
};

export default SearchBar;
