// Favorites live in localStorage, not cookies: cookies ride along on every request to the
// site, so a user with ~15 favorites overflowed the server's header limit (NYCUI-593), and
// they exposed the user's saved stops to server logs. localStorage never leaves the browser.
//
// Plain .mjs with no imports so `node --test` can load it on CI's Node 20, which can't run .ts
// (see test/favoritesStorage.test.js).
// Favorites are StopInterface | RouteInterface (DataModels.ts); validity is checked by the caller's isValid.

// Namespaced and versioned so a later format change can migrate from this key rather than guess.
export const favoritesStorageKey = "mta-oba.favorites.v1"
// Cookie formats being migrated away from: the classic site's single JSON cookie, and the
// per-favorite cookies (named by the part of the id after "_") ordered by a "favoritesIds" list.
export const oldFavoritesCookieIdentifier = "favorites"
export const favoritesIdsCookieIdentifier = "favoritesIds"

const getId = (favorite) => favorite?.routeId ?? favorite?.id

const parse = (raw) => {
    if (!raw) {return undefined}
    try {return JSON.parse(raw)} catch {return undefined}
}

const toState = (favorites) => {
    const unique = favorites.filter((f, i) => favorites.findIndex(g => getId(g) === getId(f)) === i)
    return {favorites: unique, favoritesIds: unique.map(getId)}
}

/**
 * Favorites found in either cookie format, plus the names of every cookie they were read from.
 * @param {{get(name: string): string | undefined}} cookies
 * @param {(x: any) => boolean} isValid
 */
export const readCookieFavorites = (cookies, isValid) => {
    const found = []
    const cookieNames = []

    const idsCookie = cookies.get(favoritesIdsCookieIdentifier)
    if (idsCookie !== undefined) {
        cookieNames.push(favoritesIdsCookieIdentifier)
        idsCookie.split(",").filter(Boolean).forEach(id => {
            const raw = cookies.get(id)
            if (raw === undefined) {return}
            cookieNames.push(id)
            const favorite = parse(raw)
            if (isValid(favorite)) {found.push(favorite)}
        })
    }

    const oldCookie = cookies.get(oldFavoritesCookieIdentifier)
    if (oldCookie !== undefined) {
        cookieNames.push(oldFavoritesCookieIdentifier)
        const old = parse(oldCookie)?.favorites
        if (Array.isArray(old)) {found.push(...old.filter(isValid))}
    }

    return {favorites: found, cookieNames}
}

/**
 * @param {Storage | null} storage
 * @param {any[]} favorites
 * @returns {boolean} whether the favorites were saved
 */
export const saveFavorites = (storage, favorites) => {
    if (!storage) {return false}
    try {
        storage.setItem(favoritesStorageKey, JSON.stringify(favorites))
        return true
    } catch {
        return false
    }
}

/**
 * Reads favorites from localStorage and folds in any still held in cookies. The cookies are
 * deleted only once their favorites are safely saved, so a browser that blocks storage
 * keeps its cookie favorites rather than losing them.
 * @param {Storage | null} storage
 * @param {{get(name: string): string | undefined, remove(name: string): void}} cookies
 * @param {(x: any) => boolean} isValid
 * @returns {{favorites: any[], favoritesIds: string[]}}
 */
export const loadFavorites = (storage, cookies, isValid) => {
    let stored = []
    try {
        const parsed = parse(storage?.getItem(favoritesStorageKey))
        if (Array.isArray(parsed)) {stored = parsed.filter(isValid)}
    } catch {
        // storage can throw on access (blocked site data); fall through to cookies
    }

    const fromCookies = readCookieFavorites(cookies, isValid)
    const state = toState([...stored, ...fromCookies.favorites])
    if (fromCookies.cookieNames.length > 0 && saveFavorites(storage, state.favorites)) {
        fromCookies.cookieNames.forEach(name => cookies.remove(name))
    }
    return state
}

/** @returns {Storage | null} window.localStorage, or null where reading it throws (private windows, blocked site data). */
export const getBrowserStorage = () => {
    try {
        return window.localStorage
    } catch {
        return null
    }
}
