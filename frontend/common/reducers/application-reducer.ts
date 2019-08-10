import { StyleObjects } from "lib/stylesheet-helper"
import { ReduxAction } from "actions/application-actions"
import { uuid } from "lib/uuid"
import { RiverNode, LogNode, StorageNodes } from "lib/interpreter";

export type Layer = 'editor' | 'docs' | 'logs'

export type ApplicationState = {
    styles: StyleObjects[]
    nodes: { [id: string]: RiverNode },
    orderedNodes: RiverNode[],
    selectedNodeId?: string,
    activeLayer: Layer
}

export const initialState: ApplicationState = {
    styles: [],
    nodes: {},
    orderedNodes: [],
    selectedNodeId: null,
    activeLayer: 'editor'
}

// Create a cache array of nodes ordered by the execution map
const createOrderedNodes = (nodes: { [id: string]: RiverNode }) => {
    let orderedNodes: RiverNode[] = []
    const followNodeTree = (node: RiverNode) => {
        orderedNodes.push(node)
        if (node.nextNodeId) {
            followNodeTree(nodes[node.nextNodeId])
        }
    }

    const entryPoint = Object.values(nodes).find(n => n.entryPoint)
    if (entryPoint) {
        followNodeTree(entryPoint)
    }
    return orderedNodes
}

export const applicationReducer = (state = initialState, action: ReduxAction) => {
    const newState: ApplicationState = Object.assign({}, state)
    // --------------------------------------------------
    // Adds style objects to be rendered into the <head> tag
    // --------------------------------------------------
    if (action.type === 'ADD_STYLE_OBJECTS') {
        newState.styles = Object.assign({}, newState.styles, action.payload.styleObjects)
    }
    // --------------------------------------------------
    // Sets the active layer in the editor
    // --------------------------------------------------
    else if (action.type === 'SET_ACTIVE_LAYER') {
        newState.activeLayer = action.payload.activeLayer
    }
    // --------------------------------------------------
    // Sets the currently selected node in the editor
    // --------------------------------------------------
    else if (action.type === 'SET_SELECTED_NODE') {
        newState.selectedNodeId = action.payload.nodeId
    }
    // --------------------------------------------------
    // Inserts a new empty node in the program after the node
    // with previousNodeId, updating the nextNode reference
    // --------------------------------------------------
    else if (action.type === 'INSERT_NODE') {
        newState.nodes = JSON.parse(JSON.stringify(newState.nodes))
        const previousNode = newState.nodes[action.payload.previousNodeId]
        if (previousNode || !action.payload.previousNodeId) {
            const newId = uuid()
            newState.nodes[newId] = {
                id: newId,
                nextNodeId: previousNode ? previousNode.nextNodeId : undefined,
                nodeType: 'empty'
            }
            // If there's only one node, make it the entrypoint
            if (Object.values(newState.nodes).length === 1) {
                newState.nodes[newId].entryPoint = true
            }
            if (previousNode) {
                previousNode.nextNodeId = newId
            }
            newState.selectedNodeId = newId
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else {
            throw Error('Error in INSERT_NODE, node with id ' + action.payload.previousNodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Deletes a node from the program
    // --------------------------------------------------
    else if (action.type === 'DELETE_NODE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node) {
            newState.nodes = JSON.parse(JSON.stringify(newState.nodes))
            const previousNode = Object.values(newState.nodes).find(n => n.nextNodeId === action.payload.nodeId)
            // Select the next, or previous node
            if (node.nextNodeId) {
                newState.selectedNodeId = node.nextNodeId
            } else if (previousNode) {
                newState.selectedNodeId = previousNode.id
            } else {
                newState.selectedNodeId = undefined
            }
            // If something was pointing to the deleted node, point it to the next node instead
            if (previousNode) {
                previousNode.nextNodeId = node.nextNodeId
            }
            // If the deleted node was the entrypoint, make the next node the entrypoint instead
            if (node.entryPoint && node.nextNodeId) {
                newState.nodes[node.nextNodeId].entryPoint = true
            }
            delete newState.nodes[action.payload.nodeId]
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in DELETE_NODE, node with id ' + action.payload.nodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Sets the type of a node
    // --------------------------------------------------
    else if (action.type === 'SET_NODE_TYPE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node) {
            const newNode = JSON.parse(JSON.stringify(node)) as RiverNode
            newNode.nodeType = action.payload.type
            if (newNode.nodeType === 'log') {
                newNode.message = [{ id: uuid(), type: 'raw', value: '' }]
            }
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_NODE_TYPE, node with id ' + action.payload.nodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Sets the message of a log node
    // --------------------------------------------------
    else if (action.type === 'SET_LOG_MESSAGE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node && node.nodeType === 'log') {
            const newNode = JSON.parse(JSON.stringify(node)) as LogNode
            newNode.message = action.payload.message
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_LOG_MESSAGE, node with id ' + action.payload.nodeId + ' was not found or was not a log node')
        }
    }
    // --------------------------------------------------
    // Sets the label of a Storage: Create node
    // --------------------------------------------------
    else if (action.type === 'SET_STORAGE_CREATE_LABEL') {
        const node = newState.nodes[action.payload.nodeId]
        if (node && node.nodeType === 'storage_create') {
            const newNode = JSON.parse(JSON.stringify(node)) as StorageNodes.Create
            newNode.label = action.payload.label
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_STORAGE_CREATE_LABEL, node with id ' + action.payload.nodeId + ' was not found or was not a log node')
        }
    }
    // --------------------------------------------------
    // Sets the value type of a Storage: Create node
    // --------------------------------------------------
    else if (action.type === 'SET_STORAGE_CREATE_VALUE_TYPE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node && node.nodeType === 'storage_create') {
            const newNode = JSON.parse(JSON.stringify(node)) as StorageNodes.Create
            newNode.valueType = action.payload.valueType
            newNode.value = [{ id: uuid(), type: 'raw', value: '' }]
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_STORAGE_CREATE_VALUE_TYPE, node with id ' + action.payload.nodeId + ' was not found or was not a log node')
        }
    }
    // --------------------------------------------------
    // Sets the value of a Storage: Create node
    // --------------------------------------------------
    else if (action.type === 'SET_STORAGE_CREATE_VALUE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node && node.nodeType === 'storage_create') {
            const newNode = JSON.parse(JSON.stringify(node)) as StorageNodes.Create
            newNode.value = action.payload.value
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_STORAGE_CREATE_VALUE, node with id ' + action.payload.nodeId + ' was not found or was not a log node')
        }
    }


    return newState
}