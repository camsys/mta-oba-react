// Favorites storage (NYCUI-593): favorites live in localStorage, and any still held in the old
// cookies are moved over and the cookies deleted, so they stop riding along on every request.
const test = require('node:test');
const assert = require('node:assert/strict');

const STOP_ID = 'MTA_303245';
const ROUTE_ID = 'MTA NYCT_B63';
// Fresh objects per call, so no test can mutate a fixture another test relies on.
const makeStop = () => ({name: 'FLATBUSH AV/NOSTRAND AV', longLat: [40.632561, -73.947438], id: STOP_ID,
  stopDirection: 'NE', datumId: STOP_ID, datumName: 'FLATBUSH AV/NOSTRAND AV'});
const makeRoute = () => ({color: '00AEEF', routeId: ROUTE_ID, routeTitle: 'B63', description: 'via 5th Av',
  datumId: ROUTE_ID, datumName: 'B63'});

// The app passes isStopInterface/isRouteInterface (DataModelsUtils.ts); CI's Node 20 can't load .ts.
const isValid = x => typeof x?.datumId === 'string' && typeof (x.routeId ?? x.id) === 'string';
const load = async () => ({...await import('../src/js/updateState/favoritesStorage.mjs'), isValid});

// Per-favorite cookies were named by the part of the id after "_" (e.g. "B63").
const cookieName = id => id.split('_')[1];
const perFavoriteCookies = (idsCookie, ...favorites) => ({
  [idsCookie]: favorites.map(f => cookieName(f.routeId ?? f.id)).join(','),
  ...Object.fromEntries(favorites.map(f => [cookieName(f.routeId ?? f.id), JSON.stringify(f)])),
});

const fakeStorage = (initial = {}) => {
  const data = {...initial};
  return {data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); }};
};

const fakeCookies = (initial = {}) => {
  const data = {...initial};
  return {data, get: k => data[k], remove: k => { delete data[k]; }};
};

test('moves per-favorite cookies into localStorage in order, then deletes them', async () => {
  const {loadFavorites, favoritesStorageKey, favoritesIdsCookieIdentifier, isValid} = await load();
  const storage = fakeStorage();
  const cookies = fakeCookies({...perFavoriteCookies(favoritesIdsCookieIdentifier, makeRoute(), makeStop()), other: 'kept'});

  const state = loadFavorites(storage, cookies, isValid);

  assert.deepEqual(state.favoritesIds, [ROUTE_ID, STOP_ID]);
  assert.deepEqual(JSON.parse(storage.data[favoritesStorageKey]), [makeRoute(), makeStop()]);
  assert.deepEqual(cookies.data, {other: 'kept'});
});

test('moves the older version of the site\'s single favorites cookie too', async () => {
  const {loadFavorites, oldFavoritesCookieIdentifier, isValid} = await load();
  const storage = fakeStorage();
  const cookies = fakeCookies({[oldFavoritesCookieIdentifier]: JSON.stringify({favorites: [makeStop()]})});

  assert.deepEqual(loadFavorites(storage, cookies, isValid).favorites, [makeStop()]);
  assert.deepEqual(cookies.data, {});
});

test('merges cookie favorites into existing localStorage ones without duplicates', async () => {
  const {loadFavorites, favoritesStorageKey, favoritesIdsCookieIdentifier, isValid} = await load();
  const storage = fakeStorage({[favoritesStorageKey]: JSON.stringify([makeStop()])});
  const cookies = fakeCookies(perFavoriteCookies(favoritesIdsCookieIdentifier, makeStop(), makeRoute()));

  assert.deepEqual(loadFavorites(storage, cookies, isValid).favoritesIds, [STOP_ID, ROUTE_ID]);
});

test('keeps the cookies when localStorage can\'t be written, so favorites aren\'t lost', async () => {
  const {loadFavorites, favoritesIdsCookieIdentifier, isValid} = await load();
  const cookies = fakeCookies(perFavoriteCookies(favoritesIdsCookieIdentifier, makeStop()));
  const blocked = {getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }};

  assert.deepEqual(loadFavorites(blocked, cookies, isValid).favorites, [makeStop()]);
  assert.deepEqual(loadFavorites(null, cookies, isValid).favorites, [makeStop()]);
  assert.ok(cookies.data[cookieName(STOP_ID)]);
});

test('skips corrupt or invalid entries', async () => {
  const {loadFavorites, favoritesStorageKey, favoritesIdsCookieIdentifier, isValid} = await load();
  const storage = fakeStorage({[favoritesStorageKey]: JSON.stringify([makeStop(), {junk: true}])});
  const cookies = fakeCookies({[favoritesIdsCookieIdentifier]: cookieName(ROUTE_ID), [cookieName(ROUTE_ID)]: '{not json'});

  assert.deepEqual(loadFavorites(storage, cookies, isValid).favorites, [makeStop()]);
  assert.deepEqual(loadFavorites(fakeStorage({[favoritesStorageKey]: '{not json'}), fakeCookies(), isValid).favorites, []);
});
