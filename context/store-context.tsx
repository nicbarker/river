import * as React from 'react'
import { uuid } from "../lib/uuid"
import { RiverNode, LogNode, VariableNodes, NodeType, TextBlockObjectType, ValueType, ConditionalType, createRawTextChainFromString, TextChain } from "../lib/interpreter";

export type Layer = 'editor' | 'docs' | 'logs'

export type ApplicationState = {
    nodes: { [id: string]: RiverNode }
    orderedNodes: RiverNode[]
    activeLayer: Layer
    focusGroups: { [id: string]: string[] }
}

export const initialState: ApplicationState = {
    nodes: {},
    orderedNodes: [],
    activeLayer: 'editor',
    focusGroups: {}
}

type SetProgramNodes = {
    type: 'SET_PROGRAM_NODES'
    payload: { nodes: { [id: string]: RiverNode } }
}

type SetActiveLayer = {
    type: 'SET_ACTIVE_LAYER'
    payload: { activeLayer: Layer }
}

type SetSelectedNode = {
    type: 'SET_SELECTED_NODE'
    payload: { selectedNodeId: string }
}

type InsertNode = {
    type: 'INSERT_NODE'
    payload: { previousNodeId?: string, conditional: boolean }
}

type DeleteNodes = {
    type: 'DELETE_NODES'
    payload: { nodeIds: string[] }
}

type SetNodeType = {
    type: 'SET_NODE_TYPE'
    payload: { nodeId: string, type: NodeType }
}

type SetNodeConditional = {
    type: 'SET_NODE_CONDITIONAL'
    payload: { nodeId: string, conditional: boolean }
}

type SetConditionalType = {
    type: 'SET_CONDITIONAL_TYPE'
    payload: { nodeId: string, type: ConditionalType }
}

type SetConditionalLeftSide = {
    type: 'SET_CONDITIONAL_LEFT_SIDE'
    payload: { nodeId: string, leftSide: TextChain }
}

type SetConditionalRightSide = {
    type: 'SET_CONDITIONAL_RIGHT_SIDE'
    payload: { nodeId: string, rightSide: TextChain }
}

type SetLogMessage = {
    type: 'SET_LOG_MESSAGE'
    payload: { nodeId: string, message: TextBlockObjectType[] }
}

type SetCreateVariableLabel = {
    type: 'SET_CREATE_VARIABLE_LABEL'
    payload: { nodeId: string, label: string }
}

type SetCreateVariableValueType = {
    type: 'SET_CREATE_VARIABLE_VALUE_TYPE'
    payload: { nodeId: string, valueType: ValueType }
}


type SetCreateVariableValue = {
    type: 'SET_CREATE_VARIABLE_VALUE'
    payload: { nodeId: string, value: TextBlockObjectType[] }
}

export type ReducerAction =
    | SetProgramNodes
    | SetActiveLayer
    | SetSelectedNode
    | InsertNode
    | DeleteNodes
    | SetNodeType
    | SetNodeConditional
    | SetConditionalType
    | SetConditionalLeftSide
    | SetConditionalRightSide
    | SetLogMessage
    | SetCreateVariableLabel
    | SetCreateVariableValueType
    | SetCreateVariableValue

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

let undoStack: ApplicationState[] = [initialState]
let undoStackPosition = 0

const reducer = (state: ApplicationState, action: ReducerAction) => {
    let canUndo = false
    let newState: ApplicationState = { ...state }
    // --------------------------------------------------
    // Replaces the whole program with a new set of nodes
    // --------------------------------------------------
    if (action.type === 'SET_PROGRAM_NODES') {
        newState.nodes = action.payload.nodes
        newState.orderedNodes = createOrderedNodes(newState.nodes)
        canUndo = true
    }
    // --------------------------------------------------
    // Sets the active layer in the editor
    // --------------------------------------------------
    else if (action.type === 'SET_ACTIVE_LAYER') {
        newState.activeLayer = action.payload.activeLayer
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
                nodeType: 'EmptyNode',
                conditional: action.payload.conditional ? { conditionalType: 'EmptyConditional' } : undefined
            }
            // If there's only one node, make it the entrypoint
            if (Object.values(newState.nodes).length === 1) {
                newState.nodes[newId].entryPoint = true
            // If we've inserted a new node before the first node
            } else if (!action.payload.previousNodeId && Object.values(newState.nodes).length > 1) {
                newState.nodes[newId].nextNodeId = newState.orderedNodes[0].id
                newState.nodes[newId].entryPoint = true
                newState.nodes[newState.orderedNodes[0].id].entryPoint = false
            }

            if (previousNode) {
                previousNode.nextNodeId = newId
            }
            newState.orderedNodes = createOrderedNodes(newState.nodes)
            canUndo = true
        } else {
            throw Error('Error in INSERT_NODE, node with id ' + action.payload.previousNodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Deletes nodes from the program
    // --------------------------------------------------
    else if (action.type === 'DELETE_NODES') {
        for (const nodeId of action.payload.nodeIds) {
            const node = newState.nodes[nodeId]
            if (node) {
                newState.nodes = JSON.parse(JSON.stringify(newState.nodes))
                const previousNode = Object.values(newState.nodes).find(n => n.nextNodeId === nodeId)
                // If something was pointing to the deleted node, point it to the next node instead
                if (previousNode) {
                    previousNode.nextNodeId = node.nextNodeId
                }
                // If the deleted node was the entrypoint, make the next node the entrypoint instead
                if (node.entryPoint && node.nextNodeId) {
                    newState.nodes[node.nextNodeId].entryPoint = true
                }
                delete newState.nodes[nodeId]
                newState.orderedNodes = createOrderedNodes(newState.nodes)
                canUndo = true
            } else if (nodeId) { // If the node id was defined but no node was found, we're in trouble
                throw Error('Error in DELETE_NODE, node with id ' + nodeId + ' was not found')
            }
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
            if (newNode.nodeType === 'LogNode') {
                newNode.message = [{ id: uuid(), textBlockType: 'RawTextBlock', value: '' }]
            }
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_NODE_TYPE, node with id ' + action.payload.nodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Sets a node to conditional or non conditional execution
    // --------------------------------------------------
    else if (action.type === 'SET_NODE_CONDITIONAL') {
        const node = newState.nodes[action.payload.nodeId]
        if (node) {
            const newNode = JSON.parse(JSON.stringify(node)) as RiverNode
            newNode.conditional = action.payload.conditional ? { conditionalType: 'EmptyConditional' } : undefined
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_NODE_CONDITIONAL, node with id ' + action.payload.nodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Sets the conditional type of a node
    // --------------------------------------------------
    else if (action.type === 'SET_CONDITIONAL_TYPE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node) {
            const newNode = JSON.parse(JSON.stringify(node)) as RiverNode
            switch (action.payload.type) {
                case 'EmptyConditional': newNode.conditional = { conditionalType: 'EmptyConditional' }; break
                case 'EqualsConditional': newNode.conditional = { conditionalType: 'EqualsConditional', leftSide: createRawTextChainFromString(''), rightSide: createRawTextChainFromString('') }; break
                case 'NotEqualsConditional': newNode.conditional = { conditionalType: 'NotEqualsConditional', leftSide: createRawTextChainFromString(''), rightSide: createRawTextChainFromString('') }; break
            }
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_CONDITIONAL_TYPE, node with id ' + action.payload.nodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Sets the left side of a conditional
    // --------------------------------------------------
    else if (action.type === 'SET_CONDITIONAL_LEFT_SIDE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node) {
            const newNode = JSON.parse(JSON.stringify(node)) as RiverNode
            if (newNode.conditional.conditionalType !== 'EmptyConditional') {
                newNode.conditional.leftSide = action.payload.leftSide
            }
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_CONDITIONAL_TYPE, node with id ' + action.payload.nodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Sets the right side of a conditional
    // --------------------------------------------------
    else if (action.type === 'SET_CONDITIONAL_RIGHT_SIDE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node) {
            const newNode = JSON.parse(JSON.stringify(node)) as RiverNode
            if (newNode.conditional.conditionalType !== 'EmptyConditional') {
                newNode.conditional.rightSide = action.payload.rightSide
            }
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_CONDITIONAL_TYPE, node with id ' + action.payload.nodeId + ' was not found')
        }
    }
    // --------------------------------------------------
    // Sets the message of a log node
    // --------------------------------------------------
    else if (action.type === 'SET_LOG_MESSAGE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node && node.nodeType === 'LogNode') {
            const newNode = JSON.parse(JSON.stringify(node)) as LogNode
            newNode.message = action.payload.message
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
            canUndo = true
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_LOG_MESSAGE, node with id ' + action.payload.nodeId + ' was not found or was not a log node')
        }
    }
    // --------------------------------------------------
    // Sets the label of a Create Variable node
    // --------------------------------------------------
    else if (action.type === 'SET_CREATE_VARIABLE_LABEL') {
        const node = newState.nodes[action.payload.nodeId]
        if (node && node.nodeType === 'CreateVariableNode') {
            const newNode = JSON.parse(JSON.stringify(node)) as VariableNodes.Create
            newNode.label = action.payload.label
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
            canUndo = true
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_CREATE_VARIABLE_LABEL, node with id ' + action.payload.nodeId + ' was not found or was not a log node')
        }
    }
    // --------------------------------------------------
    // Sets the value type of a Create Variable node
    // --------------------------------------------------
    else if (action.type === 'SET_CREATE_VARIABLE_VALUE_TYPE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node && node.nodeType === 'CreateVariableNode') {
            const newNode = JSON.parse(JSON.stringify(node)) as VariableNodes.Create
            newNode.valueType = action.payload.valueType
            newNode.value = [{ id: uuid(), textBlockType: 'RawTextBlock', value: '' }]
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
            canUndo = true
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_CREATE_VARIABLE_VALUE_TYPE, node with id ' + action.payload.nodeId + ' was not found or was not a log node')
        }
    }
    // --------------------------------------------------
    // Sets the value of a Create Variable node
    // --------------------------------------------------
    else if (action.type === 'SET_CREATE_VARIABLE_VALUE') {
        const node = newState.nodes[action.payload.nodeId]
        if (node && node.nodeType === 'CreateVariableNode') {
            const newNode = JSON.parse(JSON.stringify(node)) as VariableNodes.Create
            newNode.value = action.payload.value
            newState.nodes[action.payload.nodeId] = newNode
            newState.orderedNodes = createOrderedNodes(newState.nodes)
            canUndo = true
        } else if (action.payload.nodeId) { // If the node id was defined but no node was found, we're in trouble
            throw Error('Error in SET_CREATE_VARIABLE_VALUE, node with id ' + action.payload.nodeId + ' was not found or was not a log node')
        }
    }

    if (canUndo) {
        if (undoStackPosition < undoStack.length - 1) {
            undoStack = undoStack.slice(0, undoStackPosition)
        }
        undoStack.push(newState)
        undoStackPosition++
    }

    return newState
}

const StoreContext = React.createContext({ state: initialState, dispatch: (value: ReducerAction) => void 0 })

const StoreProvider = ({ children }: { children: React.ReactElement}) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
};

export { StoreContext, StoreProvider };