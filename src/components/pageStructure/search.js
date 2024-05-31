import React from 'react';
import {OBA} from "../../js/oba";
import ErrorBoundary from "../util/errorBoundary";
import searchWhite from "../../img/icon/search_white.svg";

function getSearch  () {

    const handleSearch = () => {
        const lineRef = document.getElementById('search-input').value;
        location.href = `?LineRef=${lineRef}`;
    };

    OBA.Util.log("adding search")
    return (
        <ErrorBoundary>
            <form id="search" method="get" role="search"
                  aria-label="Search an intersection, bus route or bus stop code">
                <div className="search-field-wrap">
                    <label htmlFor="search-field" className="visually-hidden">Search</label>
                    <div id="search-field">
                        <input type="text" name="LineRef" id="search-input" placeholder="Search" autoComplete="off" />
                    </div>
                    <button type="button" aria-label="Submit Search" id="submit-search"
                            onClick={handleSearch}>
                        <img src={searchWhite} alt="Search" />
                    </button>
                </div>
            </form>
        </ErrorBoundary>
    )
}

export default getSearch;