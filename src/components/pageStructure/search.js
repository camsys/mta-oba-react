// import React from 'react';
// import log from 'loglevel';
// import ErrorBoundary from "../util/errorBoundary";
// import queryString from "query-string";
// import searchWhite from "../../img/icon/search_white.svg";
//
//
// // THIS IS NOT BEING USED RIGHT NOW, BUT IT MIGHT BE USEFUL LATER
// function getSearch  () {
//
//     const search = queryString.parse(location.search).search;
//     var searchText = search?search:null
//
//     const handleSearch = () => {
//         const search = document.getElementById('search-input').value;
//         location.href = `?search=${search}`;
//     };
//
//     log.info("adding search")
//     return (
//         <ErrorBoundary>
//             <form id="search" method="get" role="search"
//                   aria-label="Search an intersection, bus route or bus stop code">
//                 <div className="search-field-wrap">
//                     <label htmlFor="search-field" className="visually-hidden">Search</label>
//                     <div id="search-field">
//                         <input type="text" name="search" id="search-input" placeholder="Search" autoComplete="off" defaultValue={searchText}/>
//                     </div>
//                     <button type="button" aria-label="Submit Search" id="submit-search"
//                             onClick={handleSearch}>
//                         <img src={searchWhite} alt="Search" />
//                     </button>
//                 </div>
//             </form>
//         </ErrorBoundary>
//     )
// }
//
// export default getSearch;