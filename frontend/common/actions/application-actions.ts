import { StyleObjects } from "lib/stylesheet-helper";

// -------------------------------------------------------------
// Redux actions for interacting with the global application state.
// -------------------------------------------------------------

export type ReduxAction = {
    type: string,
    payload: {
        [key: string]: any
    }
}

export const addStyleObjects = (styleObjects: StyleObjects) => {
    return {
        type: 'ADD_STYLE_OBJECTS',
        payload: { styleObjects }
    }
}

export const setSelectedNode = (nodeId: string) => {
    return {
        type: 'SET_SELECTED_NODE',
        payload: { nodeId }
    }
}

export const insertNode = (previousNodeId: string) => {
    return {
        type: 'INSERT_NODE',
        payload: { previousNodeId }
    }
}

export const deleteNode = (nodeId: string) => {
    return {
        type: 'DELETE_NODE',
        payload: { nodeId }
    }
}