import React, {useContext} from 'react';
export function ErrorCard({errorMessage}: { errorMessage: string }): JSX.Element {
    return (<React.Fragment>
                <h2 className={`cards-header`}>Search could not be completed</h2>
                <div className="card error-card">
                    <p>
                        Please confirm that there were no typos in your search request.
                        Using the autosuggest feature can help avoid this.
                    </p>
                </div>
            </React.Fragment>
    );
}