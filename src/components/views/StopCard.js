import React from 'react';
import busStopIcon from "../../img/icon/bus-stop.svg"

export const StopCard = () => {
    return (
    <>
        <h2 className="cards-header">Routes:</h2>
        <div className="cards">
            <div className="card stop-card">
                <div className="card-header">
                    <h3 className="card-title">
                        <img src={busStopIcon} alt="bus stop icon" className="icon" />
                        DeKalb Av/Flatbush Av Ex
                    </h3>
                </div>
                <div className="card-content">
                    <ul className="card-details">
                        <li className="stopcode">Stopcode 303102</li>
                    </ul>
                    <h4>Buses en-route:</h4>
                    <div className="inner-card route-direction en-route collapsible open">
                        <button
                            className="card-header collapse-trigger open"
                            aria-haspopup="true"
                            aria-expanded="false"
                            aria-label="Toggle B38 Limited to Downtown Brooklyn Tillary Street Open / Closed"
                        >
              <span className="label" style={{ borderColor: '#00AEEF' }}>
                <strong>B38 Limited</strong> Downtown Bklyn Tillary St
              </span>
                        </button>
                        <div className="card-content collapse-content" style={{ maxHeight: '0px' }}>
                            <ul className="approaching-buses">
                                <li>
                                    <a
                                        href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                                        className="bus"
                                    >
                                        7228
                                    </a>
                                    <span className="bus-info">
                    <span className="approaching">1 minute, &lt; 1 stop away</span>
                  </span>
                                </li>
                                <li>
                                    <a
                                        href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                                        className="bus"
                                    >
                                        7299
                                    </a>
                                    <span className="bus-info">
                    <span className="approaching">22 minutes, 2.8 miles away</span>
                    <span className="passengers">~10 passengers</span>
                  </span>
                                </li>
                                <li>
                                    <a
                                        href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                                        className="bus"
                                    >
                                        7354
                                    </a>
                                    <span className="bus-info">
                    <span className="approaching">31 minutes, 3.9 miles away</span>
                    <span className="passengers">~18 passengers</span>
                  </span>
                                </li>
                            </ul>
                            <div className="service-alert inner-card collapsible">
                                <button
                                    className="card-header collapse-trigger"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    aria-label="Toggle Service Alert Open/Closed"
                                >
                  <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                          className="yellow"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.88184 0.314668C9.21848 0.108886 9.60539 0 9.99995 0C10.3945 0 10.7814 0.108886 11.118 0.314668C11.4547 0.52045 11.728 0.815142 11.9079 1.1663L11.9111 1.17253L19.7705 16.8915C19.9346 17.2175 20.0133 17.5813 19.998 17.946C19.9827 18.3111 19.8744 18.6663 19.6832 18.9777C19.4919 19.2891 19.2244 19.5465 18.9057 19.7255C18.5871 19.9044 18.228 19.9989 17.8625 20H17.8604H2.13945H2.13728C1.77185 19.9989 1.41276 19.9044 1.09412 19.7255C0.775488 19.5465 0.50788 19.2891 0.316714 18.9777C0.125549 18.6663 0.0171731 18.3111 0.00187865 17.946C-0.0133979 17.5813 0.0646962 17.2187 0.228751 16.8927L8.08882 1.17255L8.09195 1.16628C8.27184 0.815127 8.54521 0.52045 8.88184 0.314668Z"
                      />
                      <path
                          className="black"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.99974 5.88691C10.5917 5.88691 11.0716 6.36681 11.0716 6.95879V11.6036C11.0716 12.1956 10.5917 12.6755 9.99974 12.6755C9.40776 12.6755 8.92785 12.1956 8.92785 11.6036V6.95879C8.92785 6.36681 9.40776 5.88691 9.99974 5.88691ZM11.4289 15.5339C11.4289 16.3232 10.789 16.963 9.99974 16.963C9.21043 16.963 8.57056 16.3232 8.57056 15.5339C8.57056 14.7445 9.21043 14.1047 9.99974 14.1047C10.789 14.1047 11.4289 14.7445 11.4289 15.5339Z"
                      />
                    </svg>
                  </span>
                                    <span className="label">Service Alert for B38</span>
                                </button>
                                <div className="card-content collapse-content" style={{ maxHeight: '0px' }}>
                                    <p>Eastbound B38 stop on Kossuth Pl at Bushwick Ave is closed.</p>
                                    <p>Buses are making a stop on DeKalb Ave at Bushwick Ave.</p>
                                    <p>
                                        What's happening? <br />
                                        Building construction at 856 Bushwick Avenue
                                    </p>
                                    <p>Note: Real-time tracking on BusTime may be inaccurate in the service change area.</p>
                                    <p>The 2:59pm B38 to CADMAN PLZ W/TILLARY ST is canceled</p>
                                    <p>The 2:39pm B38 to CADMAN PLZ W/TILLARY ST is canceled</p>
                                    <p>
                                        Eastbound B38 buses are detoured because of roadwork on Lafayette Ave between
                                        Washington Ave and Classon Ave.
                                    </p>
                                    <p>
                                        Buses will not serve stops on Lafayette Ave from S Portland Ave to Grand Ave.
                                        Stops will be made along Fulton St as requested.
                                    </p>
                                    <p>Note: Bus arrival information may not be available while buses are detoured.</p>
                                    <p>
                                        <a href="/" tabIndex="-1">
                                            Click this link for a map of the detours.
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="inner-card route-direction en-route collapsible open">
                        <button
                            className="card-header collapse-trigger open"
                            aria-haspopup="true"
                            aria-expanded="false"
                            aria-label="Toggle B54 to Downtown Brooklyn Jay St via Myrtle Open / Closed"
                        >
              <span className="label" style={{ borderColor: '#6CBE44' }}>
                <strong>B54</strong> Downtown Bklyn Jay St via Myrtle
              </span>
                        </button>
                        <div className="card-content collapse-content" style={{ maxHeight: '0px' }}>
                            <ul className="approaching-buses">
                                <li>
                                    <a
                                        href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                                        className="bus"
                                    >
                                        7228
                                    </a>
                                    <span className="bus-info">
                    <span className="approaching">1 minute, &lt; 1 stop away</span>
                  </span>
                                </li>
                                <li>
                                    <a
                                        href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                                        className="bus"
                                    >
                                        7299
                                    </a>
                                    <span className="bus-info">
                    <span className="approaching">22 minutes, 2.8 miles away</span>
                    <span className="passengers">~10 passengers</span>
                  </span>
                                </li>
                                <li>
                                    <a
                                        href="/?content=route-b-38_vehicle&search=B38&refresh=true&vehicle-popup=true"
                                        className="bus"
                                    >
                                        7354
                                    </a>
                                    <span className="bus-info">
                    <span className="approaching">31 minutes, 3.9 miles away</span>
                    <span className="passengers">~18 passengers</span>
                  </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-note">
                        <p>
                            Text stopcode <strong>303102</strong> to 511123 to receive an up-to-date list of buses
                            en-route on your phone.
                        </p>
                    </div>
                    <ul className="menu icon-menu card-menu">
                        <li>
                            <button aria-label="Center & Zoom here on the Map">
                <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                  >
                    <path
                        fill="#0E61A9"
                        fillRule="evenodd"
                        d="M2.14286 2.5C2.14286 2.30276 2.30276 2.14286 2.5 2.14286H3.21429C3.80601 2.14286 4.28571 1.66316 4.28571 1.07143C4.28571 0.479694 3.80601 0 3.21429 0H2.5C1.11929 0 0 1.11929 0 2.5V3.21429C0 3.80601 0.479694 4.28571 1.07143 4.28571C1.66316 4.28571 2.14286 3.80601 2.14286 3.21429V2.5ZM16.7857 0C16.194 0 15.7143 0.479694 15.7143 1.07143C15.7143 1.66316 16.194 2.14286 16.7857 2.14286H17.5C17.6973 2.14286 17.8571 2.30276 17.8571 2.5V3.21429C17.8571 3.80601 18.3369 4.28571 18.9286 4.28571C19.5203 4.28571 20 3.80601 20 3.21429V2.5C20 1.11929 18.8807 0 17.5 0H16.7857ZM1.0716 15.7143C1.66334 15.7143 2.14303 16.194 2.14303 16.7857V17.5C2.14303 17.6973 2.30293 17.8571 2.50017 17.8571H3.21446C3.8062 17.8571 4.28589 18.3369 4.28589 18.9286C4.28589 19.5203 3.8062 20 3.21446 20H2.50017C1.11946 20 0.000174386 18.8807 0.000174386 17.5V16.7857C0.000174386 16.194 0.47987 15.7143 1.0716 15.7143ZM8.57143 0C7.9797 0 7.5 0.479694 7.5 1.07143C7.5 1.66316 7.9797 2.14286 8.57143 2.14286H11.4286C12.0203 2.14286 12.5 1.66316 12.5 1.07143C12.5 0.479694 12.0203 0 11.4286 0H8.57143ZM1.07143 7.5C1.66316 7.5 2.14286 7.9797 2.14286 8.57143V11.4286C2.14286 12.0203 1.66316 12.5 1.07143 12.5C0.479694 12.5 0 12.0203 0 11.4286V8.57143C0 7.9797 0.479694 7.5 1.07143 7.5ZM18.2143 11.785C18.2143 13.1736 17.774 14.4593 17.0254 15.5103L19.6861 18.171C20.1046 18.5894 20.1046 19.2679 19.6861 19.6863C19.2677 20.1047 18.5894 20.1046 18.171 19.6863L15.5101 17.0254C14.4593 17.7736 13.1739 18.2136 11.7857 18.2136C8.23527 18.2136 5.3571 15.3354 5.3571 11.785C5.3571 8.23461 8.23527 5.35644 11.7857 5.35644C15.3361 5.35644 18.2143 8.23461 18.2143 11.785ZM11.7857 7.4993C9.41874 7.4993 7.49996 9.41809 7.49996 11.785C7.49996 14.152 9.41874 16.0707 11.7857 16.0707C14.1526 16.0707 16.0714 14.152 16.0714 11.785C16.0714 9.41809 14.1526 7.4993 11.7857 7.4993ZM11.7857 8.7493C12.2788 8.7493 12.6786 9.14904 12.6786 9.64216V10.8922H13.9286C14.4217 10.8922 14.8214 11.2919 14.8214 11.785C14.8214 12.2781 14.4217 12.6779 13.9286 12.6779H12.6786V13.9279C12.6786 14.421 12.2788 14.8207 11.7857 14.8207C11.2926 14.8207 10.8929 14.421 10.8929 13.9279V12.6779H9.64286C9.14974 12.6779 8.75 12.2781 8.75 11.785C8.75 11.2919 9.14974 10.8922 9.64286 10.8922H10.8929V9.64216C10.8929 9.14904 11.2926 8.7493 11.7857 8.7493Z"
                        clipRule="evenodd"
                    />
                  </svg>
                </span>
                                Center & Zoom Here on Map
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <ul className="menu icon-menu middle-menu refresh-menu" role="menu">
            <li>
                <button className="refresh-button" aria-label="Refresh the data">
          <span className="svg-icon-wrap" role="presentation" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path
                  className="blue"
                  d="M5.106 5.083a6.91 6.91 0 0 1 7.02-1.681 1.051 1.051 0 1 0 .638-2 9.037 9.037 0 0 0-11.13 11.944.21.21 0 0 1-.084.253l-1.176.781a.84.84 0 0 0-.362.841.84.84 0 0 0 .656.664l3.707.824h.168a.841.841 0 0 0 .462-.143.84.84 0 0 0 .362-.53l.765-3.707a.84.84 0 0 0-.353-.84.841.841 0 0 0-.933 0l-1.127.74a.244.244 0 0 1-.266-.054.235.235 0 0 1-.053-.081 6.96 6.96 0 0 1 1.706-7.01ZM19.985 4.797a.84.84 0 0 0-.639-.672l-3.69-.866a.84.84 0 0 0-1.009.63l-.84 3.682a.84.84 0 0 0 .336.841.84.84 0 0 0 .487.16.79.79 0 0 0 .446-.135l1.21-.756a.244.244 0 0 1 .185 0 .235.235 0 0 1 .135.134 6.935 6.935 0 0 1-8.65 8.793 1.05 1.05 0 0 0-1.32.698 1.043 1.043 0 0 0 .69 1.311c.868.27 1.772.407 2.681.404a9.037 9.037 0 0 0 8.398-12.4.227.227 0 0 1 .084-.26l1.135-.706a.84.84 0 0 0 .361-.858Z"
              />
            </svg>
          </span>
                    Refresh <span className="updated-at">(<span className="updated">updated </span>4:13 PM)</span>
                </button>
            </li>
        </ul>
    </>
)};
