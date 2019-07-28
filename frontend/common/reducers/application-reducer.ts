import { StyleObjects } from "lib/stylesheet-helper"
import { ReduxAction } from "actions/application-actions"
import { RiverNodes, nodeReducer } from 'reducers/node-reducer'
import { uuid } from "lib/uuid";

export type ApplicationState = {
    styles: StyleObjects[];
    nodes: RiverNodes,
    selectedNodeId: string,
}

const secondNodeId = uuid()

const firstNode = {
    entrypoint: true,
    id: uuid(),
    nextNode: secondNodeId
}

const initialState: ApplicationState = {
    styles: [],
    nodes: {
        [firstNode.id]: firstNode,
        [secondNodeId]: { id: secondNodeId }
    },
    selectedNodeId: firstNode.id
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
    // Pass any uncaught actions to sub reducers
    // --------------------------------------------------
    else {
        newState.nodes = nodeReducer(newState.nodes, action);
    }

    return newState
}

applicationReducer