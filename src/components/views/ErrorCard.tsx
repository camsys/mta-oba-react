import React, {useContext} from 'react';
export function ErrorCard({errorMessage}: { errorMessage: string }): JSX.Element {
    return (<React.Fragment>
                <h2 className={`error-header`}>Search could not be completed</h2>
                <p>
                    Please confirm that there were no typos in your search request.
                    Try the autosuggest feature in the search bar, or <a href="/?search=allRoutes">view all available routes here</a>.
                </p>
            </React.Fragment>
    );
}