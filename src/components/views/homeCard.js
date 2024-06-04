import React from 'react';
import {OBA} from "../../js/oba";


function getHomeCard  () {
    OBA.Util.log("adding home card")
    return (<div><h2>Try these example searches:</h2>
    <ul>
        <li>Route:
            <ul className="links">
                <li><a href="?LineRef=B63">B63</a></li>
                <li><a href="?LineRef=M5">M5</a></li>
                <li><a href="?LineRef=Bx1">Bx1</a></li>
            </ul>
        </li>
        <li>Intersection:
            <ul className="links">
                <li><a href="#">Main st and Kissena Bl</a></li>
            </ul>
        </li>
        <li>Stop Code:
            <ul className="links">
                <li><a href="#">200884</a></li>
            </ul>
        </li>
    </ul>
    <ul className="menu icon-menu" role="menu">
        <li>
            <a href="#">
                    <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
                        <path className="blue" d="M0 3.333a2.083 2.083 0 1 0 4.167 0 2.083 2.083 0 0 0-4.167 0ZM7.083 4.167h12.084a.833.833 0 0 0 0-1.667H7.083a.833.833 0 0 0 0 1.667ZM0 10a2.083 2.083 0 1 0 4.167 0A2.083 2.083 0 0 0 0 10ZM19.167 9.167H7.083a.833.833 0 0 0 0 1.666h12.084a.834.834 0 0 0 0-1.666ZM0 16.667a2.083 2.083 0 1 0 4.167 0 2.083 2.083 0 0 0-4.167 0ZM19.167 15.833H7.083a.833.833 0 1 0 0 1.667h12.084a.833.833 0 0 0 0-1.667Z"/>
                      </svg>
                    </span>
                <span className="label">Available Routes</span>
            </a>
        </li>
    </ul></div>);
}

export default getHomeCard;