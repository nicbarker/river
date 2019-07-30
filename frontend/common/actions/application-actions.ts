import { StyleObjects } from "lib/stylesheet-helper";
import { Layer } from "reducers/application-reducer";
import { NodeType } from "lib/interpreter";

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

export const setActiveLayer = (activeLayer: Layer) => {
    return {
        type: 'SET_ACTIVE_LAYER',
        payload: { activeLayer }
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

export const setNodeType = (nodeId: string, type: NodeType) => {
    return {
        type: 'SET_NODE_TYPE',
        payload: { nodeId, type }
    }
}