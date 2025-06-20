import React, {useContext} from 'react';
export function LoadingCard(): JSX.Element {
    return (<React.Fragment>
                <h2 className={`loading-header`}>Loading...</h2>
                <p>
                    Please wait while we fetch the data for you.
                </p>
            </React.Fragment>
    );
}