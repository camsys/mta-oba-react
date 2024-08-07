"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollapsableRouteCard = CollapsableRouteCard;
exports.RouteCard = RouteCard;
exports.RouteCardContent = RouteCardContent;
exports.RouteCardWrapper = RouteCardWrapper;
exports.RouteDirection = void 0;
exports.RouteStopComponent = RouteStopComponent;
var _react = _interopRequireWildcard(require("react"));
var _oba = require("../../js/oba");
var _CardStateComponent = require("../util/CardStateComponent");
var _ServiceAlertContainerComponent = _interopRequireDefault(require("./ServiceAlertContainerComponent"));
var _MapHighlightingStateComponent = require("../util/MapHighlightingStateComponent");
var _DataModels = require("../../js/updateState/DataModels");
var _VehicleStateComponent = require("../util/VehicleStateComponent");
var _SearchEffect = require("../../js/updateState/SearchEffect");
var _VehicleComponent = _interopRequireDefault(require("./VehicleComponent"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function RouteStopComponent(_ref) {
  var stopDatum = _ref.stopDatum,
    routeId = _ref.routeId,
    index = _ref.index;
  var _useHighlight = (0, _MapHighlightingStateComponent.useHighlight)(),
    highlightId = _useHighlight.highlightId;
  var _useContext = (0, _react.useContext)(_VehicleStateComponent.VehicleStateContext),
    vehicleState = _useContext.vehicleState;
  var _useSearch = (0, _SearchEffect.useSearch)(),
    search = _useSearch.search;
  routeId = routeId.split("_")[1];
  var vehicleChildComponents = vehicleState[routeId + _VehicleStateComponent.stopSortedDataIdentifier];
  var hasVehicleChildren = vehicleChildComponents !== null && typeof vehicleChildComponents !== "undefined";
  if (hasVehicleChildren) {
    hasVehicleChildren = vehicleChildComponents.has(stopDatum.id);
    vehicleChildComponents = vehicleChildComponents.get(stopDatum.id);
  }
  var uniqueId = stopDatum.name + "_" + stopDatum.id + "_" + index;
  return /*#__PURE__*/_react.default.createElement("li", {
    className: hasVehicleChildren ? "has-info" : null,
    key: uniqueId,
    id: uniqueId,
    onMouseEnter: function onMouseEnter() {
      return highlightId(stopDatum.id);
    },
    onMouseLeave: function onMouseLeave() {
      return highlightId(null);
    }
  }, /*#__PURE__*/_react.default.createElement("a", {
    href: "#",
    onClick: function onClick() {
      return search(stopDatum.id.split("_")[1]);
    },
    tabIndex: stopDatum.id
  }, stopDatum.name), hasVehicleChildren ? /*#__PURE__*/_react.default.createElement("ul", {
    className: "approaching-buses"
  }, vehicleChildComponents.map(function (vehicleDatum, index) {
    return /*#__PURE__*/_react.default.createElement(_VehicleComponent.default, {
      vehicleDatum: vehicleDatum,
      lastUpdateTime: null,
      key: index
    });
  })) : null);
}
var RouteDirection = exports.RouteDirection = function RouteDirection(_ref2) {
  var datum = _ref2.datum,
    color = _ref2.color;
  console.log("generating RouteDirectionComponent:", datum);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "route-direction inner-card collapsible",
    key: datum.routeId + datum.directionId
  }, /*#__PURE__*/_react.default.createElement("button", {
    className: "card-header collapse-trigger",
    "aria-haspopup": "true",
    "aria-expanded": "false",
    "aria-label": "Toggle " + datum.routeId + " to " + datum.routeDestination + " Open / Closed"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "label"
  }, "to ", /*#__PURE__*/_react.default.createElement("strong", null, " ", datum.routeDestination))), /*#__PURE__*/_react.default.createElement("div", {
    className: "card-content collapse-content",
    styles: "max-height: 0px;"
  }, /*#__PURE__*/_react.default.createElement("ul", {
    className: "route-stops",
    style: {
      color: '#' + color
    }
  }, console.log("preparing to get RouteStopComponents from: ", datum), datum.routeStopComponentsData.map(function (stopDatum, index) {
    return /*#__PURE__*/_react.default.createElement(RouteStopComponent, {
      stopDatum: stopDatum,
      routeId: datum.routeId,
      key: index
    });
  }))));
};
function RouteCardContent(_ref3) {
  var routeMatch = _ref3.routeMatch;
  var routeId = routeMatch.routeId.split("_")[1];
  var serviceAlertIdentifier = routeMatch.routeId;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("ul", {
    className: "card-details"
  }, /*#__PURE__*/_react.default.createElement("li", {
    className: "via"
  }, routeMatch.description)), /*#__PURE__*/_react.default.createElement(_ServiceAlertContainerComponent.default, {
    routeId: routeId,
    serviceAlertIdentifier: serviceAlertIdentifier
  }), routeMatch.directions.map(function (dir, index) {
    return /*#__PURE__*/_react.default.createElement(RouteDirection, {
      datum: dir.routeDirectionComponentData,
      color: routeMatch.color,
      key: index
    });
  }));
}
function RouteCard(_ref4) {
  var routeMatch = _ref4.routeMatch;
  console.log("generating route card: ", routeMatch);
  if (routeMatch.type !== _DataModels.MatchType.RouteMatch) {
    return null;
  }
  var _useHighlight2 = (0, _MapHighlightingStateComponent.useHighlight)(),
    highlightId = _useHighlight2.highlightId;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "card route-card ".concat(routeMatch.routeId)
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "card-header",
    style: {
      borderColor: "#" + routeMatch.color
    },
    onMouseEnter: function onMouseEnter() {
      return highlightId(routeMatch.routeId);
    },
    onMouseLeave: function onMouseLeave() {
      return highlightId(null);
    }
  }, /*#__PURE__*/_react.default.createElement("h3", {
    className: "card-title"
  }, _oba.OBA.Config.noWidows(routeMatch.routeTitle))), /*#__PURE__*/_react.default.createElement("div", {
    className: "card-content"
  }, /*#__PURE__*/_react.default.createElement(RouteCardContent, {
    routeMatch: routeMatch
  }))));
}
function CollapsableRouteCard(_ref5) {
  var routeMatch = _ref5.routeMatch,
    oneOfMany = _ref5.oneOfMany;
  console.log("generating route card: ", routeMatch);
  if (routeMatch.type !== _DataModels.MatchType.RouteMatch) {
    return null;
  }
  var _useHighlight3 = (0, _MapHighlightingStateComponent.useHighlight)(),
    highlightId = _useHighlight3.highlightId;
  var routeId = routeMatch.routeId.split("_")[1];
  var serviceAlertIdentifier = routeMatch.routeId;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "card route-card ".concat(oneOfMany ? "collapsible open" : "")
  }, /*#__PURE__*/_react.default.createElement("button", {
    className: "card-header collapse-trigger open",
    style: {
      borderColor: "#" + routeMatch.color
    },
    onMouseEnter: function onMouseEnter() {
      return highlightId(routeMatch.routeId);
    },
    onMouseLeave: function onMouseLeave() {
      return highlightId(null);
    },
    "aria-haspopup": "true",
    "aria-expanded": "true",
    "aria-label": "Toggle ".concat(routeMatch.routeId.split("_")[1], " ").concat(routeMatch.description, " open/close")
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "card-title label"
  }, _oba.OBA.Config.noWidows(routeMatch.routeTitle))), /*#__PURE__*/_react.default.createElement("div", {
    className: "card-content collapse-content"
  }, /*#__PURE__*/_react.default.createElement(RouteCardContent, {
    routeMatch: routeMatch
  }))));
}
function RouteCardWrapper() {
  var _useContext2 = (0, _react.useContext)(_CardStateComponent.CardStateContext),
    state = _useContext2.state;
  console.log("adding route cards for matches:", state.currentCard.searchMatches);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h2", {
    className: "cards-header"
  }, "Routes:"), /*#__PURE__*/_react.default.createElement("div", {
    className: "cards"
  }, state.currentCard.searchMatches.map(function (searchMatch, index) {
    return /*#__PURE__*/_react.default.createElement(RouteCard, {
      routeMatch: searchMatch,
      key: index
    });
  })));
}