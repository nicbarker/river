import { StyleObjects } from "lib/stylesheet-helper";
import { Layer } from "reducers/application-reducer";
import { NodeType, ValueType, TextChain } from "lib/interpreter";

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

export const setLogMessage = (nodeId: string, message: TextChain) => {
    return {
        type: 'SET_LOG_MESSAGE',
        payload: { nodeId, message }
    }
}

export const setStorageCreateLabel = (nodeId: string, label: string) => {
    return {
        type: 'SET_STORAGE_CREATE_LABEL',
        payload: { nodeId, label }
    }
}

export const setStorageCreateValueType = (nodeId: string, valueType: ValueType) => {
    return {
        type: 'SET_STORAGE_CREATE_VALUE_TYPE',
        payload: { nodeId, valueType }
    }
}

export const setStorageCreateValue = (nodeId: string, value: TextChain) => {
    return {
        type: 'SET_STORAGE_CREATE_VALUE',
        payload: { nodeId, value }
    }
}