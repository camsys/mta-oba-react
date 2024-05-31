import React from 'react';
import {OBA} from "../js/oba";


function getRouteCard  () {
    OBA.Util.log("adding route card")

   return (<div>
<h2 className="cards-header">Routes:</h2>
<div className="cards">
  <div className="card route-card b38">
    <div className="card-header" styles="border-color: #00AEEF">
      <h3 className="card-title">B38 Ridgewood - Downtown Brooklyn</h3>
    </div>
    <div className="card-content">
      <ul className="card-details">
        <li className="via">via DeKalb & Lafayette Ave</li>
      </ul>
      <div className="service-alert inner-card collapsible">
        <button className="card-header collapse-trigger" aria-haspopup="true"
          aria-expanded="false" aria-label="Toggle Service Alert Open/Closed">
          <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path className="yellow" fillRule="evenodd" clipRule="evenodd"
                d="M8.88184 0.314668C9.21848 0.108886 9.60539 0 9.99995 0C10.3945 0 10.7814 0.108886 11.118 0.314668C11.4547 0.52045 11.728 0.815142 11.9079 1.1663L11.9111 1.17253L19.7705 16.8915C19.9346 17.2175 20.0133 17.5813 19.998 17.946C19.9827 18.3111 19.8744 18.6663 19.6832 18.9777C19.4919 19.2891 19.2244 19.5465 18.9057 19.7255C18.5871 19.9044 18.228 19.9989 17.8625 20H17.8604H2.13945H2.13728C1.77185 19.9989 1.41276 19.9044 1.09412 19.7255C0.775488 19.5465 0.50788 19.2891 0.316714 18.9777C0.125549 18.6663 0.0171731 18.3111 0.00187865 17.946C-0.0133979 17.5813 0.0646962 17.2187 0.228751 16.8927L8.08882 1.17255L8.09195 1.16628C8.27184 0.815127 8.54521 0.52045 8.88184 0.314668Z" />
              <path className="black" fillRule="evenodd" clipRule="evenodd"
                d="M9.99974 5.88691C10.5917 5.88691 11.0716 6.36681 11.0716 6.95879V11.6036C11.0716 12.1956 10.5917 12.6755 9.99974 12.6755C9.40776 12.6755 8.92785 12.1956 8.92785 11.6036V6.95879C8.92785 6.36681 9.40776 5.88691 9.99974 5.88691ZM11.4289 15.5339C11.4289 16.3232 10.789 16.963 9.99974 16.963C9.21043 16.963 8.57056 16.3232 8.57056 15.5339C8.57056 14.7445 9.21043 14.1047 9.99974 14.1047C10.789 14.1047 11.4289 14.7445 11.4289 15.5339Z" />
            </svg>
          </span>
          <span className="label">Service Alert for B38</span>
        </button>
        <div className="card-content collapse-content" styles="max-height: 0px;">
          <p>Eastbound B38 stop on Kossuth Pl at Bushwick Ave is closed.</p>
          <p>Buses are making a stop on DeKalb Ave at Bushwick Ave.</p>
          <p>What's happening? <br />Building construction at 856 Bushwick Avenue</p>
          <p>Note: Real-time tracking on BusTime may be inaccurate in the
            service change area.</p>
          <p>The 2:59pm B38 to CADMAN PLZ W/TILLARY ST is canceled</p>
          <p>The 2:39pm B38 to CADMAN PLZ W/TILLARY ST is canceled</p>
          <p>Eastbound B38 buses are detoured because of roadwork on Lafayette
            Ave between Washington Ave and Classon Ave.</p>
          <p>Buses will not serve stops on Lafayette Ave from S Portland Ave to
            Grand Ave. Stops will be made along Fulton St as requested.</p>
          <p>Note: Bus arrival information may not be Available while buses are
            detoured.</p>
          <p><a href="/" tabIndex="-1">Click this link for a map of the detours.</a></p>
        </div>
      </div>
      <div className="route-direction inner-card collapsible">
        <button className="card-header collapse-trigger" aria-haspopup="true"
          aria-expanded="false"
          aria-label="Toggle B38 to Downtown Brooklyn Tillary Street Open / Closed">
          <span className="label">to <strong>Downtown Bklyn Tillary St</strong></span>
        </button>
        <div className="card-content collapse-content" styles="max-height: 0px;">
          <ul className="route-stops" styles="color: #00AEEF;">
            <li><a href="#" tabIndex="-1">Seneca Av/Cornelia St</a></li>
            <li><a href="#" tabIndex="-1">Metropolitan Av/Starr St</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">Grandview Av/Metropolitan Av</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7336</a>
                  <span className="bus-info">
                    <span className="approaching">approaching</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">Seneca Av/Gates Av</a></li>
            <li><a href="#" tabIndex="-1">Stanhope St/Grandview Av</a></li>
            <li><a href="#" tabIndex="-1">Seneca Av/Bleecker St</a></li>
            <li><a href="#" tabIndex="-1">Stanhope St/Woodward Av</a></li>
            <li><a href="#" tabIndex="-1">Stanhope St/Onderdonk Av</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">Seneca Av/DeKalb Av</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7619</a>
                  <span className="bus-info">
                    <span className="approaching">&lt;1 stop away</span>
                    <span className="passengers">~16 passengers</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">DeKalb Av/St Nicholas Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Wyckoff Av</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">DeKalb Av/Irving Av</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7299</a>
                  <span className="bus-info">
                    <span className="approaching">approaching</span>
                  </span>
                </li>
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7354</a>
                  <span className="bus-info">
                    <span className="approaching">&lt;1 stop away</span>
                    <span className="passengers">~10 passengers</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Knickerbocker Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Wilson Av</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">DeKalb Av/Myrtle Av</a>
              <ul className="approaching-buses">
                <li>
                  <span className="bus stroller-friendly">7095</span>
                  <span className="bus-info">
                    <span className="approaching">at stop</span>
                    <span className="visually-hidden">This bus has an open
                      stroller area.</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Evergreen Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Broadway</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Malcolm X Bl</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Stuyvesant Av</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">DeKalb Av/Lewis Av</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7336</a>
                  <span className="bus-info">
                    <span className="approaching">approaching</span>
                    <span className="passengers">~20 passengers</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Marcus Garvey Bl</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Throop Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Tompkins Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Marcy Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Nostrand Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Bedford Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Franklin Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Classon Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Ryerson Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Washington Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Vanderbilt Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Carlton Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/S Portland Av</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">DeKalb Av/Ft Greene Pl</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">806</a>
                  <span className="bus-info">
                    <span className="approaching">&lt;1 stop away</span>
                    <span className="passengers">~13 passengers</span>
                  </span>
                </li>
              </ul>
            </li>
            <li className="has-info">
              <a href="#" tabIndex="-1">DeKalb Av/Flatbush Av Ex</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7228</a>
                  <span className="bus-info">
                    <span className="approaching">at stop</span>
                  </span>
                </li>
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7299</a>
                  <span className="bus-info">
                    <span className="approaching">approaching</span>
                    <span className="passengers">~10 passengers</span>
                  </span>
                </li>
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7354</a>
                  <span className="bus-info">
                    <span className="approaching">&lt;1 stop away</span>
                    <span className="passengers">~18 passengers</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Bond St</a></li>
            <li><a href="#" tabIndex="-1">Fulton St/Duffield St</a></li>
            <li><a href="#" tabIndex="-1">Fulton St/Jay St</a></li>
            <li><a href="#" tabIndex="-1">Joralemon St/Court St</a></li>
            <li><a href="#" tabIndex="-1">Cadman Plz W/Montague St</a></li>
            <li><a href="#" tabIndex="-1">Cadman Plz W/Tillary St</a></li>
          </ul>
        </div>
      </div>
      <div className="route-direction inner-card collapsible">
        <button className="card-header collapse-trigger" aria-haspopup="true"
          aria-expanded="false"
          aria-label="Toggle B38 to Ridgewood Metro Av Open / Closed">
          <span className="label">to <strong>Ridgewood Metro Av</strong></span>
        </button>
        <div className="card-content collapse-content" styles="max-height: 0px;">
          <ul className="route-stops" styles="color: #00AEEF;">
            <li><a href="#" tabIndex="-1">Cadman Plz W/Tillary St</a></li>
            <li><a href="#" tabIndex="-1">Cadman Plz W/Montague St</a></li>
            <li><a href="#" tabIndex="-1">Joralemon St/Court St</a></li>
            <li><a href="#" tabIndex="-1">Fulton St/Jay St</a></li>
            <li><a href="#" tabIndex="-1">Fulton St/Duffield St</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Bond St</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">DeKalb Av/Flatbush Av Ex</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7001</a>
                  <span className="bus-info">
                    <span className="approaching">1 stop away</span>
                    <span className="passengers">~10 passengers</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Ft Greene Pl</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/S Portland Av</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">DeKalb Av/Carlton Av</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7222</a>
                  <span className="bus-info">
                    <span className="approaching">approaching</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Vanderbilt Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Washington Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Ryerson Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Classon Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Franklin Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Bedford Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Nostrand Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Marcy Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Tompkins Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Throop Av</a></li>
            <li><a href="#" tabIndex="-1">Dekalb Av/Marcus Garvey Bl</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Lewis Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Stuyvesant Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Malcolm X Bl</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Broadway</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Evergreen Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Myrtle Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Wilson Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Knickerbocker Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Irving Av</a></li>
            <li><a href="#" tabIndex="-1">DeKalb Av/Wyckoff Av</a></li>
            <li className="has-info">
              <a href="#" tabIndex="-1">DeKalb Av/St Nicholas Av</a>
              <ul className="approaching-buses">
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7105</a>
                  <span className="bus-info">
                    <span className="approaching">at stop</span>
                  </span>
                </li>
                <li>
                  <a
                    href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                    className="bus">7336</a>
                  <span className="bus-info">
                    <span className="approaching">approaching</span>
                    <span className="passengers">~20 passengers</span>
                  </span>
                </li>
              </ul>
            </li>
            <li><a href="#" tabIndex="-1">Seneca Av/DeKalb Av</a></li>
            <li><a href="#" tabIndex="-1">Stanhope St/Onderdonk Av</a></li>
            <li><a href="#" tabIndex="-1">Stanhope St/Woodward Av</a></li>
            <li><a href="#" tabIndex="-1">Seneca Av/Bleecker St</a></li>
            <li><a href="#" tabIndex="-1">Stanhope St/Grandview Av</a></li>
            <li><a href="#" tabIndex="-1">Seneca Av/Gates Av</a></li>
            <li><a href="#" tabIndex="-1">Grandview Av/Metropolitan Av</a></li>
            <li><a href="#" tabIndex="-1">Metropolitan Av/Starr St</a></li>
            <li><a href="#" tabIndex="-1">Seneca Av/Cornelia St</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
<ul className="menu icon-menu middle-menu refresh-menu" role="menu">
  <li>
    <button className="refresh-button" aria-label="Refresh the data">
      <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 20 20"><path className="blue"
            d="M5.106 5.083a6.91 6.91 0 0 1 7.02-1.681 1.051 1.051 0 1 0 .638-2 9.037 9.037 0 0 0-11.13 11.944.21.21 0 0 1-.084.253l-1.176.781a.84.84 0 0 0-.362.841.84.84 0 0 0 .656.664l3.707.824h.168a.841.841 0 0 0 .462-.143.84.84 0 0 0 .362-.53l.765-3.707a.84.84 0 0 0-.353-.84.841.841 0 0 0-.933 0l-1.127.74a.244.244 0 0 1-.266-.054.235.235 0 0 1-.053-.081 6.96 6.96 0 0 1 1.706-7.01ZM19.985 4.797a.84.84 0 0 0-.639-.672l-3.69-.866a.84.84 0 0 0-1.009.63l-.84 3.682a.84.84 0 0 0 .336.841.84.84 0 0 0 .487.16.79.79 0 0 0 .446-.135l1.21-.756a.244.244 0 0 1 .185 0 .235.235 0 0 1 .135.134 6.935 6.935 0 0 1-8.65 8.793 1.05 1.05 0 0 0-1.32.698 1.043 1.043 0 0 0 .69 1.311c.868.27 1.772.407 2.681.404a9.037 9.037 0 0 0 8.398-12.4.227.227 0 0 1 .084-.26l1.135-.706a.84.84 0 0 0 .361-.858Z" /></svg>
      </span>
      Refresh <span className="updated-at">(<span className="updated">updated
        </span>4:13 PM)</span>
    </button>
  </li>
</ul></div>);

 }

export default getRouteCard;