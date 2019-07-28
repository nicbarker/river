// -------------------------------------------------------------
// Listens for keyboard events on the body and passes them on
// to registered listeners.
// -------------------------------------------------------------

import { uuid } from 'lib/uuid'

const keyListeners = {}
const blockedKeys = {}

const keypressHandler = (event) => {
    for (const listener of Object.values(keyListeners)) {
        if (listener['key'] === event.keyCode && !blockedKeys[event.keyCode]) {
            if (listener.listener(event) === false) {
                break
            }
        }
    }
}

export const initialize = (event) => {
    document.body.addEventListener('keydown', keypressHandler)
}

export const registerKeyListener = (key, listener) => {
    const listenerId = uuid()
    keyListeners[listenerId] = { key, listener }
    return listenerId
}

export const deregisterKeyListener = (listenerId, key, listener) => {
    delete keyListeners[listenerId]
}

// Blocks all key events from occuring on a specific key
export const blockKey = (key) => {
    blockedKeys[key] = true
}

export const unblockKey = (key) => {
    delete blockedKeys[key]
}