import * as React from 'react'
import { useCallback } from 'react';

export const InteractionContext = React.createContext({
    currentFocus: [] as number[],
    focusUtil: {
        setCurrentFocus: (focusState: number[]): void => void 0,
        incrementCurrentFocus: (increment: number) => void 0,
        hasFocus: (focusState: number[]): [boolean, boolean] => [false, false],
    },
    keyboardUtil: {
        registerKeyListeners: (listeners: { key: string, callback: () => void }[]) => void 0,
        deregisterKeyListeners: (callbacks: (() => void)[]) => void 0,
    }
});

type KeyListeners = { key: string, callback: () => void }[]

const createKeyListener = () => {
    let keyListeners: KeyListeners = []

    typeof window !== 'undefined' && window.addEventListener('keydown', (event: KeyboardEvent) => {
        for (const listener of keyListeners) {
            if (listener['key'] === event.key) {
                setTimeout(() => {
                    listener.callback()
                })
            }
        }

        if (event.key === 'Tab') {
            event.preventDefault()
        }
    })

    return {
        registerKeyListeners: (listeners: { key: string, callback: () => void }[]) => {
            for (const { key, callback } of listeners) {
                if (!keyListeners.find(l => l.callback === callback)) {
                    keyListeners.push({ key, callback })
                }
            }
        },
        deregisterKeyListeners: (callbacks: (() => void)[]) => {
            for (const callback of callbacks) {
                const index = keyListeners.findIndex(l => l.callback === callback)
                if (index !== -1) {
                    keyListeners = keyListeners.slice(0, index).concat(keyListeners.slice(index + 1))
                }
            }
        }
    }
}

export const InteractionProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentFocus, setCurrentFocus] = React.useState<number[]>([]);
    const { registerKeyListeners, deregisterKeyListeners } = React.useMemo(() => createKeyListener(), [])
    return (
        <InteractionContext.Provider value={{
            currentFocus,
            focusUtil: {
                setCurrentFocus,
                incrementCurrentFocus: (increment: number) => {
                    const newFocus = [...currentFocus]
                    newFocus[newFocus.length - 1] = Math.max(0, newFocus[newFocus.length - 1] + increment)
                    setCurrentFocus(newFocus)
                },
                hasFocus: (focusToCheck: number[]) => {
                    for (let i = 0; i < focusToCheck.length && i < currentFocus.length; i++) {
                        if (focusToCheck[i] !== currentFocus[i]) {
                            return [false, false]
                        }
                    }
                    return [focusToCheck.length === currentFocus.length, focusToCheck.length <= currentFocus.length]
                },
            },
            keyboardUtil: {
                registerKeyListeners,
                deregisterKeyListeners
            }
        }}>
            {children}
        </InteractionContext.Provider>
    );
};