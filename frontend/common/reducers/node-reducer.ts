import { ReduxAction } from "actions/application-actions";

export type RiverNode = {
    id: string
}

export type RiverNodes = {
    [id: string]: RiverNode
}

export const nodeReducer = (state: RiverNodes, action: ReduxAction) => {
    const newState: RiverNodes = Object.assign({}, state)
    // --------------------------------------------------
    // Adds a new river node
    // --------------------------------------------------
    if (action.type === 'ADD_RIVER_NODE') {
        newState[action.payload.node.id] = action.payload.node
    }

    return newState
}