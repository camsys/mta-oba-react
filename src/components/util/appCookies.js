import React from 'react';
import log from 'loglevel';
import Cookies from 'js-cookie';

//to use add import {setCookie, getCookie} from '../../components/util/appCookies'; and then call set or get cookie with values

export const setCookie = (cookieName, cookieValue, expiresInDays = 30) => {
    Cookies.set(cookieName, cookieValue, { expires: expiresInDays })
  }

export const getCookie = (cookieName) => {
    return Cookies.get(cookieName);
  }
