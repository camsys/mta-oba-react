"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSearch = exports.updateCard = exports.getHomeCard = void 0;
var _queryString = _interopRequireDefault(require("query-string"));
var _react = _interopRequireWildcard(require("react"));
var _CardStateComponent = require("Components/util/CardStateComponent");
var _oba = require("../oba");
var _DataModels = require("./DataModels");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, catch: function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function processRouteSearch(route, card, stops, routes) {
  var match = new _DataModels.RouteMatch(route);
  console.log("processing route search results", route, card, stops, routes);
  if (route != null && route.hasOwnProperty("directions")) {
    match.color = route === null || route === void 0 ? void 0 : route.color;
    match.routeId = route === null || route === void 0 ? void 0 : route.id;
    card.routeIdList.add(match.routeId);
    match.routeTitle = (route === null || route === void 0 ? void 0 : route.shortName) + " " + (route === null || route === void 0 ? void 0 : route.longName);
    match.description = route === null || route === void 0 ? void 0 : route.description;
    match.directions = [];
    match.routeMatches = [];
    match.routeMatches.push(match);
    console.log("assigned basic search values to card", route, match);
    for (var i = 0; i < (route === null || route === void 0 ? void 0 : route.directions.length); i++) {
      var directionDatum = (0, _DataModels.createRouteMatchDirectionInterface)(route === null || route === void 0 ? void 0 : route.directions[i], match.routeId, match.color);
      directionDatum.mapStopComponentData.forEach(function (stop) {
        return stops.current[stop.id] = stop;
      });
      match.directions.push(directionDatum);
    }
  }
  routes.current[match.routeId] = match;
  return match;
}
function processGeocodeSearch(geocode, card, stops, routes) {
  var match = new _DataModels.GeocodeMatch(geocode);
  console.log("processing geocode search results", geocode, card, match);
  if (geocode != null && geocode.hasOwnProperty("latitude")) {
    geocode === null || geocode === void 0 || geocode.nearbyRoutes.forEach(function (searchResult) {
      if (typeof (searchResult === null || searchResult === void 0 ? void 0 : searchResult.stopDirection) !== "undefined") {
        match.routeMatches.push(processStopSearch(searchResult, card, stops, routes));
      } else if (typeof (searchResult === null || searchResult === void 0 ? void 0 : searchResult.longName) !== "undefined") {
        match.routeMatches.push(processRouteSearch(searchResult, card, stops, routes));
      }
    });
  }
  // todo: add a list of stops to card.stopIdList, probably need to search to get them,
  // ... honestly this whole thing should be done async during the siri calls which means a minor
  // refactor. but we knew that was coming. given this is a rly fast api call though, probably can make it
  // done seperate for now. also will need to be done before the siri stop-monitoring calls
  console.log("geocode data processed: ", match);
  return match;
}
function processStopSearch(stop, card, stops, routes) {
  var match = new _DataModels.StopMatch(stop);
  console.log("processing stopMatch search results", stop, card, match);
  if (stop != null && stop.hasOwnProperty("latitude")) {
    card.stopIdList.add(stop.id);
    match.routeMatches = [];
    stop === null || stop === void 0 || stop.routesAvailable.forEach(function (x) {
      match.routeMatches.push(processRouteSearch(x, card, stops, routes));
    });
  }
  console.log("stopMatch data processed: ", match);
  return match;
}
function getData(_x, _x2, _x3, _x4) {
  return _getData.apply(this, arguments);
}
function _getData() {
  _getData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(card, stops, routes, address) {
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          console.log("filling card data with search", card, stops, routes);
          if (!(card.searchTerm == null || card.searchTerm == '')) {
            _context6.next = 4;
            break;
          }
          console.log("empty search means home", card);
          return _context6.abrupt("return", card);
        case 4:
          // let address = "http://localhost:8080" + "/" + OBA.Config.searchUrl + "?q=" + card.searchTerm
          console.log('requesting search results from ', address);
          _context6.next = 7;
          return fetch(address).then(function (response) {
            return response.json();
          }).then(function (parsed) {
            console.log("got back search results");
            console.log("parsed: ", parsed);
            var searchResults = parsed === null || parsed === void 0 ? void 0 : parsed.searchResults;
            console.log("search results found ", searchResults);
            console.log("resultType = ", searchResults.resultType);
            card.setSearchResultType(searchResults.resultType);
            console.log(card);
            if (searchResults.resultType == "StopResult") {
              searchResults.matches.forEach(function (x) {
                card.searchMatches.push(processStopSearch(x, card, stops, routes));
              });
              var stopMatch = card.searchMatches[0];
              card.datumId = stopMatch.id;
            }
            if (searchResults.resultType == "GeocodeResult") {
              searchResults.matches.forEach(function (x) {
                card.searchMatches.push(processGeocodeSearch(x, card, stops, routes));
              });
            }
            if (searchResults.resultType == "RouteResult") {
              searchResults.matches.forEach(function (x) {
                card.searchMatches.push(processRouteSearch(x, card, stops, routes));
              });
              var routeMatch = card.searchMatches[0];
              card.datumId = routeMatch.routeId;
            }
            console.log('completed search results: ', card, stops, routes);
          }).catch(function (error) {
            console.error(error);
          });
        case 7:
          console.log("got card data: ", card, _typeof(card), card == null, stops, routes);
          return _context6.abrupt("return", card);
        case 9:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _getData.apply(this, arguments);
}
var performNewSearch = function performNewSearch(searchRef, currentCard) {
  if (currentCard.type === _DataModels.CardType.VehicleCard) {
    // this only works because vehicle searches are handled elsewhere
    return true;
  } else if ((currentCard === null || currentCard === void 0 ? void 0 : currentCard.searchTerm) === searchRef) {
    return false;
  }
  return true;
};
var updateWindowHistory = function updateWindowHistory(term) {
  var url = new URL(window.location.href);
  url.searchParams.set('LineRef', term);
  window.history.pushState({}, '', url);
};
var updateCard = exports.updateCard = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(searchRef, stops, routes, address) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          console.log("received new search input:", searchRef);
          // searchRef = searchRef.replaceAll(" ","%2520")
          _context.next = 3;
          return getData(new _DataModels.Card(searchRef), stops, routes, address);
        case 3:
          return _context.abrupt("return", _context.sent);
        case 4:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function updateCard(_x5, _x6, _x7, _x8) {
    return _ref.apply(this, arguments);
  };
}();
var getHomeCard = exports.getHomeCard = function getHomeCard() {
  return new _DataModels.Card("");
};
var getBaseAddress = function getBaseAddress() {
  return "https://" + process.env.ENV_ADDRESS + "/";
};
var getSearchAddress = function getSearchAddress(searchTerm) {
  return getBaseAddress() + _oba.OBA.Config.searchUrl + "?q=" + searchTerm;
};
var getRoutesAddress = function getRoutesAddress() {
  return getBaseAddress() + "/api/routes";
};
var useSearch = exports.useSearch = function useSearch() {
  var _useContext = (0, _react.useContext)(_CardStateComponent.CardStateContext),
    state = _useContext.state,
    setState = _useContext.setState;
  var routes = (0, _react.useContext)(_CardStateComponent.RoutesContext);
  var stops = (0, _react.useContext)(_CardStateComponent.StopsContext);
  var allRoutesSearchTerm = "allRoutes";
  var search = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(searchTerm) {
      var currentCard, cardStack;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            searchTerm = searchTerm.split("_").length > 1 ? searchTerm.split("_").reduce(function (acc, part, nth) {
              return nth !== 0 ? acc + part : acc;
            }, "").toUpperCase() : searchTerm.toUpperCase();
            if (!(searchTerm === allRoutesSearchTerm)) {
              _context2.next = 5;
              break;
            }
            _context2.next = 4;
            return allRoutesSearch();
          case 4:
            return _context2.abrupt("return");
          case 5:
            _context2.prev = 5;
            console.log("fetch search data called, generating new card", state, searchTerm);
            if (!performNewSearch(searchTerm, state === null || state === void 0 ? void 0 : state.currentCard)) {
              _context2.next = 20;
              break;
            }
            updateWindowHistory(searchTerm);
            if (!(searchTerm != null | searchTerm != "" | searchTerm != "#")) {
              _context2.next = 15;
              break;
            }
            _context2.next = 12;
            return updateCard(searchTerm, stops, routes, getSearchAddress(searchTerm));
          case 12:
            currentCard = _context2.sent;
            _context2.next = 16;
            break;
          case 15:
            currentCard = getHomeCard();
          case 16:
            cardStack = state.cardStack;
            cardStack.push(currentCard);
            console.log("updating state with new card:", currentCard, stops, routes);
            setState(function (prevState) {
              return _objectSpread(_objectSpread({}, prevState), {}, {
                currentCard: currentCard,
                cardStack: cardStack,
                renderCounter: prevState.renderCounter + 1
              });
            });
          case 20:
            _context2.next = 25;
            break;
          case 22:
            _context2.prev = 22;
            _context2.t0 = _context2["catch"](5);
            console.error('There was a problem with the fetch operation:', _context2.t0);
          case 25:
            _context2.prev = 25;
            return _context2.finish(25);
          case 27:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[5, 22, 25, 27]]);
    }));
    return function search(_x9) {
      return _ref2.apply(this, arguments);
    };
  }();
  var generateInitialCard = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(setLoading) {
      var currentCard, cardStack, searchRef, _currentCard, _cardStack;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            currentCard = new _DataModels.Card("");
            console.log("setting initial state data home card", currentCard);
            cardStack = state.cardStack;
            cardStack.push(currentCard);
            setState(function (prevState) {
              return _objectSpread(_objectSpread({}, prevState), {}, {
                currentCard: currentCard,
                cardStack: cardStack,
                renderCounter: prevState.renderCounter + 1
              });
            });
            setLoading(false);
            _context3.prev = 6;
            searchRef = _queryString.default.parse(location.search).LineRef;
            if (searchRef) {
              _context3.next = 10;
              break;
            }
            return _context3.abrupt("return");
          case 10:
            console.log("generating card based on starting query");
            if (!(searchRef === allRoutesSearchTerm)) {
              _context3.next = 15;
              break;
            }
            _context3.next = 14;
            return allRoutesSearch();
          case 14:
            return _context3.abrupt("return");
          case 15:
            _context3.next = 17;
            return getData(new _DataModels.Card(searchRef), stops, routes, getSearchAddress(searchRef));
          case 17:
            _currentCard = _context3.sent;
            // let currentCard = new Card(searchRef);
            console.log("setting card based on starting query", _currentCard);
            _cardStack = state.cardStack;
            _cardStack.push(_currentCard);
            setState(function (prevState) {
              return _objectSpread(_objectSpread({}, prevState), {}, {
                currentCard: _currentCard,
                cardStack: _cardStack,
                renderCounter: prevState.renderCounter + 1
              });
            });
            _context3.next = 27;
            break;
          case 24:
            _context3.prev = 24;
            _context3.t0 = _context3["catch"](6);
            console.error('There was a problem with the fetch operation:', _context3.t0);
          case 27:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[6, 24]]);
    }));
    return function generateInitialCard(_x10) {
      return _ref3.apply(this, arguments);
    };
  }();

  //this function doesn't belong in "SearchEffect" but it does belong with card handling functions
  // which is what this has become

  var vehicleSearch = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(vehicleDatum) {
      var pastCard, routeId, currentCard, routeData, cardStack;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            console.log("setting card to vehicle card", vehicleDatum);
            //todo: should be current search term
            pastCard = state.currentCard;
            routeId = vehicleDatum.routeId.split("_")[1];
            console.log("found routeId of target vehicle: ", routeId);
            currentCard = new _DataModels.Card(routeId);
            routeData = routes === null || routes === void 0 ? void 0 : routes.current;
            if (routeData) {
              routeData = routeData[vehicleDatum.routeId];
            }
            ;
            console.log("found routedata of target vehicle: ", routeData);
            currentCard.setToVehicle(vehicleDatum.vehicleId, [routeData], new Set([vehicleDatum.routeId]));
            cardStack = state.cardStack;
            cardStack.push(currentCard);
            console.log("updating state prev card -> new card: \n", pastCard, currentCard);
            // todo: condense all of these into a single method, copied and pasted too many times
            setState(function (prevState) {
              return _objectSpread(_objectSpread({}, prevState), {}, {
                currentCard: currentCard,
                cardStack: cardStack,
                renderCounter: prevState.renderCounter + 1
              });
            });
          case 14:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    return function vehicleSearch(_x11) {
      return _ref4.apply(this, arguments);
    };
  }();
  var allRoutesSearch = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
      var searchTerm, address, _state$currentCard, currentCard, cardStack;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            searchTerm = allRoutesSearchTerm;
            address = getRoutesAddress();
            _context5.prev = 2;
            console.log("all routes requested, generating new card", state);
            if (!((state === null || state === void 0 || (_state$currentCard = state.currentCard) === null || _state$currentCard === void 0 ? void 0 : _state$currentCard.type) !== _DataModels.CardType.AllRoutesCard)) {
              _context5.next = 13;
              break;
            }
            updateWindowHistory(searchTerm);
            _context5.next = 8;
            return fetch(address).then(function (response) {
              return response.json();
            }).then(function (parsed) {
              var currentCard = new _DataModels.Card(searchTerm);
              console.log("all routes results: ", parsed);
              var searchMatch = new _DataModels.SearchMatch(_DataModels.SearchMatch.matchTypes.AllRoutesMatch);
              searchMatch.routeMatches = parsed === null || parsed === void 0 ? void 0 : parsed.routes.map(function (route) {
                return new _DataModels.RouteMatch(route);
              });
              var routeIdList = new Set();
              // parsed?.routes.forEach(route=>routeIdList.add(route.id));
              currentCard.setToAllRoutes([searchMatch], routeIdList);
              console.log('completed processing all routes results: ', currentCard, stops, routes);
              return currentCard;
            }).catch(function (error) {
              console.error(error);
            });
          case 8:
            currentCard = _context5.sent;
            cardStack = state.cardStack;
            cardStack.push(currentCard);
            console.log("updating state with new card:", currentCard, stops, routes);
            setState(function (prevState) {
              return _objectSpread(_objectSpread({}, prevState), {}, {
                currentCard: currentCard,
                cardStack: cardStack,
                renderCounter: prevState.renderCounter + 1
              });
            });
          case 13:
            _context5.next = 18;
            break;
          case 15:
            _context5.prev = 15;
            _context5.t0 = _context5["catch"](2);
            console.error('There was a problem with the fetch operation:', _context5.t0);
          case 18:
            _context5.prev = 18;
            return _context5.finish(18);
          case 20:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[2, 15, 18, 20]]);
    }));
    return function allRoutesSearch() {
      return _ref5.apply(this, arguments);
    };
  }();
  return {
    search: search,
    generateInitialCard: generateInitialCard,
    vehicleSearch: vehicleSearch,
    allRoutesSearch: allRoutesSearch
  };
};