import { StyleObjects } from "lib/stylesheet-helper"
import { ReduxAction } from "actions/application-actions"
import { uuid } from "lib/uuid"
import { RiverNode } from "lib/interpreter";

export type ApplicationState = {
    styles: StyleObjects[]
    nodes: { [id: string]: RiverNode },
    orderedNodes: RiverNode[],
    selectedNodeId?: string,
}

const initialState: ApplicationState = {
    styles: [],
    nodes: {},
    orderedNodes: [],
    selectedNodeId: null
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
                nextNodeId: previousNode ? previousNode.nextNodeId : undefined
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
        } else {
            throw Error('Error in DELETE_NODE, node with id ' + action.payload.nodeId + ' was not found')
        }
    }

    return newState
}