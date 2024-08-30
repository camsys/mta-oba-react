"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StopMatch = exports.SearchMatch = exports.RouteMatch = exports.MatchType = exports.GeocodeMatch = exports.CardType = exports.Card = exports.AgencyAndId = void 0;
exports.createMapRouteComponentInterface = createMapRouteComponentInterface;
exports.createRouteDirectionComponentInterface = createRouteDirectionComponentInterface;
exports.createRouteMatchDirectionInterface = createRouteMatchDirectionInterface;
exports.createServiceAlertInterface = createServiceAlertInterface;
exports.createStopInterface = createStopInterface;
exports.createVehicleArrivalInterface = createVehicleArrivalInterface;
exports.createVehicleRtInterface = createVehicleRtInterface;
var _oba = require("../oba");
var _leaflet = require("leaflet");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var AgencyAndId = exports.AgencyAndId = /*#__PURE__*/_createClass(function AgencyAndId(datum) {
  _classCallCheck(this, AgencyAndId);
  _defineProperty(this, "agency", void 0);
  _defineProperty(this, "id", void 0);
  var parts = datum.split("_");
  this.agency = parts[0];
  this.id = parts.reduce(function (acc, part, nth) {
    return nth !== 0 ? acc + part : acc;
  }, "");
});
function createStopInterface(stopJson) {
  return {
    name: stopJson.name,
    longLat: [stopJson.latitude, stopJson.longitude],
    id: stopJson.id,
    stopDirection: stopJson.stopDirection
  };
}
function createServiceAlertInterface(serviceAlertJson) {
  return {
    json: serviceAlertJson,
    descriptionParts: serviceAlertJson.Description.split("\n"),
    title: serviceAlertJson.Summary
  };
}
function createVehicleArrivalInterface(mc) {
  var _mc$Extensions;
  var distances = (mc === null || mc === void 0 || (_mc$Extensions = mc.Extensions) === null || _mc$Extensions === void 0 ? void 0 : _mc$Extensions.Distances) || {};
  return {
    prettyDistance: distances.PresentableDistance,
    rawDistanceInfo: distances.DistanceFromCall,
    stopsFromCall: distances.StopsFromCall,
    rawDistanceOnRoute: distances.CallDistanceAlongRoute,
    stopId: mc === null || mc === void 0 ? void 0 : mc.StopPointRef,
    stopName: mc === null || mc === void 0 ? void 0 : mc.StopPointName,
    ISOTime: mc === null || mc === void 0 ? void 0 : mc.ExpectedArrivalTime
  };
}
function createVehicleRtInterface(mvj, updateTime) {
  var _mvj$MonitoredCall, _mvj$MonitoredCall2, _mvj$MonitoredCall3, _mvj$MonitoredCall4;
  var vehicleArrivalData = [];
  if ((mvj === null || mvj === void 0 ? void 0 : mvj.MonitoredCall) != null) {
    var _mvj$OnwardCalls;
    var mc = mvj.MonitoredCall;
    vehicleArrivalData.push(createVehicleArrivalInterface(mc));
    if ((mvj === null || mvj === void 0 || (_mvj$OnwardCalls = mvj.OnwardCalls) === null || _mvj$OnwardCalls === void 0 ? void 0 : _mvj$OnwardCalls.OnwardCall) != null) {
      mvj.OnwardCalls.OnwardCall.forEach(function (call, index) {
        if (index !== 0) {
          vehicleArrivalData.push(createVehicleArrivalInterface(call));
        }
      });
    }
  }
  return {
    lastUpdate: updateTime,
    longLat: [mvj.VehicleLocation.Latitude, mvj.VehicleLocation.Longitude],
    latLngLiteral: {
      lat: mvj.VehicleLocation.Latitude,
      lng: mvj.VehicleLocation.Longitude
    },
    destination: mvj.DestinationName,
    hasRealtime: mvj.Monitored && mvj.ProgressStatus !== "spooking",
    nextStop: ((_mvj$MonitoredCall = mvj.MonitoredCall) === null || _mvj$MonitoredCall === void 0 ? void 0 : _mvj$MonitoredCall.StopPointRef) || null,
    vehicleArrivalData: vehicleArrivalData,
    strollerVehicle: (_mvj$MonitoredCall2 = mvj.MonitoredCall) === null || _mvj$MonitoredCall2 === void 0 || (_mvj$MonitoredCall2 = _mvj$MonitoredCall2.Extensions) === null || _mvj$MonitoredCall2 === void 0 || (_mvj$MonitoredCall2 = _mvj$MonitoredCall2.VehicleFeatures) === null || _mvj$MonitoredCall2 === void 0 ? void 0 : _mvj$MonitoredCall2.StrollerVehicle,
    passengerCount: (_mvj$MonitoredCall3 = mvj.MonitoredCall) === null || _mvj$MonitoredCall3 === void 0 || (_mvj$MonitoredCall3 = _mvj$MonitoredCall3.Extensions) === null || _mvj$MonitoredCall3 === void 0 || (_mvj$MonitoredCall3 = _mvj$MonitoredCall3.Capacities) === null || _mvj$MonitoredCall3 === void 0 ? void 0 : _mvj$MonitoredCall3.EstimatedPassengerCount,
    passengerCapacity: (_mvj$MonitoredCall4 = mvj.MonitoredCall) === null || _mvj$MonitoredCall4 === void 0 || (_mvj$MonitoredCall4 = _mvj$MonitoredCall4.Extensions) === null || _mvj$MonitoredCall4 === void 0 || (_mvj$MonitoredCall4 = _mvj$MonitoredCall4.Capacities) === null || _mvj$MonitoredCall4 === void 0 ? void 0 : _mvj$MonitoredCall4.EstimatedPassengerCapacity,
    vehicleId: mvj.VehicleRef,
    bearing: mvj.Bearing,
    direction: mvj.DirectionRef,
    routeId: mvj.LineRef
  };
}
function createMapRouteComponentInterface(routeId, componentId, points, color) {
  return {
    routeId: routeId,
    id: componentId,
    points: points,
    color: color
  };
}
function createRouteDirectionComponentInterface(routeId, directionId, routeDestination, stops) {
  var routeStopComponentsData = stops.map(function (stop) {
    return createStopInterface(stop);
  });
  return {
    routeId: routeId,
    directionId: directionId,
    routeDestination: routeDestination,
    routeStopComponentsData: routeStopComponentsData
  };
}
function createRouteMatchDirectionInterface(directionJson, routeId, color) {
  var mapRouteComponentData = [];
  var mapStopComponentData = [];
  var stops = (directionJson === null || directionJson === void 0 ? void 0 : directionJson.stops) || [];
  var routeDirectionComponentData = createRouteDirectionComponentInterface(routeId, directionJson.directionId, directionJson.destination, stops);
  for (var j = 0; j < directionJson.polylines.length; j++) {
    var encodedPolyline = directionJson.polylines[j];
    var decodedPolyline = _oba.OBA.Util.decodePolyline(encodedPolyline);
    var polylineId = "".concat(routeId, "_dir_").concat(directionJson.directionId, "_polyLineNum_").concat(j);
    mapRouteComponentData.push(createMapRouteComponentInterface(routeId, polylineId, decodedPolyline, color));
  }
  stops.forEach(function (stop) {
    return mapStopComponentData.push(createStopInterface(stop));
  });
  return {
    routeId: routeId,
    color: color,
    directionId: directionJson.directionId,
    destination: directionJson.destination,
    mapRouteComponentData: mapRouteComponentData,
    mapStopComponentData: mapStopComponentData,
    routeDirectionComponentData: routeDirectionComponentData
  };
}
var MatchType = exports.MatchType = /*#__PURE__*/function (MatchType) {
  MatchType["RouteMatch"] = "routeMatch";
  MatchType["GeocodeMatch"] = "geocodeMatch";
  MatchType["StopMatch"] = "stopMatch";
  MatchType["AllRoutesMatch"] = "allRoutesMatch";
  return MatchType;
}({});
var SearchMatch = exports.SearchMatch = /*#__PURE__*/_createClass(function SearchMatch(type) {
  _classCallCheck(this, SearchMatch);
  _defineProperty(this, "type", void 0);
  _defineProperty(this, "routeMatches", void 0);
  this.type = type;
  this.routeMatches = [];
});
_defineProperty(SearchMatch, "matchTypes", MatchType);
var RouteMatch = exports.RouteMatch = /*#__PURE__*/function (_SearchMatch2) {
  function RouteMatch(data) {
    var _this;
    _classCallCheck(this, RouteMatch);
    _this = _callSuper(this, RouteMatch, [MatchType.RouteMatch]);
    _defineProperty(_this, "color", void 0);
    _defineProperty(_this, "routeId", void 0);
    _defineProperty(_this, "routeTitle", void 0);
    _defineProperty(_this, "description", void 0);
    _defineProperty(_this, "directions", void 0);
    _this.color = data === null || data === void 0 ? void 0 : data.color;
    _this.routeId = data === null || data === void 0 ? void 0 : data.id;
    _this.routeTitle = (data === null || data === void 0 ? void 0 : data.shortName) + " " + (data === null || data === void 0 ? void 0 : data.longName);
    _this.description = data === null || data === void 0 ? void 0 : data.description;
    _this.directions = [];
    return _this;
  }
  _inherits(RouteMatch, _SearchMatch2);
  return _createClass(RouteMatch);
}(SearchMatch);
var GeocodeMatch = exports.GeocodeMatch = /*#__PURE__*/function (_SearchMatch3) {
  function GeocodeMatch(data) {
    var _this2;
    _classCallCheck(this, GeocodeMatch);
    _this2 = _callSuper(this, GeocodeMatch, [MatchType.GeocodeMatch]);
    _defineProperty(_this2, "latitude", void 0);
    _defineProperty(_this2, "longitude", void 0);
    _defineProperty(_this2, "routeMatches", void 0);
    _this2.latitude = data.latitude;
    _this2.longitude = data.longitude;
    _this2.routeMatches = [];
    return _this2;
  }
  _inherits(GeocodeMatch, _SearchMatch3);
  return _createClass(GeocodeMatch);
}(SearchMatch);
var StopMatch = exports.StopMatch = /*#__PURE__*/function (_SearchMatch4) {
  function StopMatch(data) {
    var _this3;
    _classCallCheck(this, StopMatch);
    _this3 = _callSuper(this, StopMatch, [MatchType.StopMatch]);
    _defineProperty(_this3, "latitude", void 0);
    _defineProperty(_this3, "longitude", void 0);
    _defineProperty(_this3, "name", void 0);
    _defineProperty(_this3, "id", void 0);
    _defineProperty(_this3, "routeMatches", void 0);
    _defineProperty(_this3, "longLat", void 0);
    _defineProperty(_this3, "stopDirection", void 0);
    _this3.latitude = data.latitude;
    _this3.longitude = data.longitude;
    _this3.name = data.name;
    _this3.id = data.id;
    _this3.routeMatches = [];
    _this3.longLat = [data.latitude, data.longitude];
    _this3.stopDirection = data.stopDirection;
    return _this3;
  }
  _inherits(StopMatch, _SearchMatch4);
  return _createClass(StopMatch);
}(SearchMatch);
var CardType = exports.CardType = /*#__PURE__*/function (CardType) {
  CardType["RouteCard"] = "routeCard";
  CardType["GeocodeCard"] = "geocodeCard";
  CardType["StopCard"] = "stopCard";
  CardType["VehicleCard"] = "vehicleCard";
  CardType["ErrorCard"] = "errorCard";
  CardType["HomeCard"] = "homeCard";
  CardType["AllRoutesCard"] = "allRoutesCard";
  return CardType;
}({});
var Card = exports.Card = /*#__PURE__*/function () {
  function Card(searchTerm) {
    _classCallCheck(this, Card);
    _defineProperty(this, "searchTerm", void 0);
    _defineProperty(this, "datumId", void 0);
    _defineProperty(this, "searchResultType", void 0);
    _defineProperty(this, "name", void 0);
    _defineProperty(this, "searchMatches", void 0);
    _defineProperty(this, "routeIdList", void 0);
    _defineProperty(this, "stopIdList", void 0);
    _defineProperty(this, "vehicleId", void 0);
    _defineProperty(this, "type", void 0);
    this.searchTerm = searchTerm;
    this.searchResultType = null;
    this.name = "homeCard";
    this.searchMatches = [];
    this.routeIdList = new Set();
    this.stopIdList = new Set();
    this.vehicleId = null;
    this.type = CardType.HomeCard; // Default or initial type if applicable
    this.datumId = null;
  }
  return _createClass(Card, [{
    key: "setType",
    value: function setType(cardType) {
      this.type = cardType;
      this.name = this.type;
    }
  }, {
    key: "setToVehicle",
    value: function setToVehicle(vehicleId, searchMatches, routeIdList) {
      this.setType(CardType.VehicleCard);
      this.vehicleId = vehicleId;
      this.datumId = vehicleId;
      this.searchMatches = searchMatches;
      this.routeIdList = routeIdList;
    }
  }, {
    key: "setToAllRoutes",
    value: function setToAllRoutes(searchMatches, routeIdList) {
      this.setType(CardType.AllRoutesCard);
      this.datumId = null;
      this.searchMatches = searchMatches;
      this.routeIdList = routeIdList;
    }
  }, {
    key: "setSearchResultType",
    value: function setSearchResultType(searchResultType) {
      this.searchResultType = searchResultType;
      switch (searchResultType) {
        case Card.ROUTECARDIDENTIFIER:
          this.setType(CardType.RouteCard);
          break;
        case Card.GEOCARDIDENTIFIER:
          this.setType(CardType.GeocodeCard);
          break;
        case Card.STOPCARDIDENTIFIER:
          this.setType(CardType.StopCard);
          break;
        case null:
          this.setType(CardType.ErrorCard);
          break;
        default:
          this.setType(CardType.ErrorCard);
          console.error("Invalid search result type", searchResultType);
      }
    }
  }, {
    key: "equals",
    value: function equals(that) {
      return this.searchTerm === (that === null || that === void 0 ? void 0 : that.searchTerm) && this.searchResultType === (that === null || that === void 0 ? void 0 : that.searchResultType);
    }
  }]);
}();
_defineProperty(Card, "ROUTECARDIDENTIFIER", "RouteResult");
_defineProperty(Card, "GEOCARDIDENTIFIER", "GeocodeResult");
_defineProperty(Card, "STOPCARDIDENTIFIER", "StopResult");
_defineProperty(Card, "cardTypes", CardType);