// --------------------------------------------------
// Run a .rvr program
// --------------------------------------------------

export type NodeType = 'log' | 'empty' | 'storage_create'
export const searchableNodeTypes: { label: string, nodeType: NodeType }[] = [
    { label: 'Log', nodeType: 'log' },
    { label: 'Create variable', nodeType: 'storage_create' }
]

export type ValueType = 'text'
export const searchableValueTypes: { label: string, valueType: ValueType }[] = [
    { label: 'Text', valueType: 'text' }
]

type BaseNodeProps = {
    id: string
    nextNodeId?: string
    entryPoint?: boolean
    nodeType: NodeType
}

export type EmptyNode = BaseNodeProps & {
    nodeType: 'empty'
}

export type LogNode = BaseNodeProps & {
    nodeType: 'log'
    message: string
}

export namespace StorageNodes {
    export type Create = BaseNodeProps & {
        nodeType: 'storage_create'
        label: string,
        valueType: 'text'
        value: string
    }
}


export type RiverNode = EmptyNode | LogNode | StorageNodes.Create;

export type RuntimeLogMessage = {
    timestamp: number
    message: string
    nodeId?: string // Id of the node that this log message originated from
}

const createLogMessage = (message: string, nodeId?: string): RuntimeLogMessage => {
    return {
        timestamp: Date.now(),
        message,
        nodeId
    }
}

export const run = (program: { nodes: { [key: string]: RiverNode} }) => {
    const output: RuntimeLogMessage[] = []
    const entryPoint = Object.values(program.nodes).find(n => n.entryPoint)
    output.push(createLogMessage('starting river program'))
    const executeNode = (node: RiverNode) => {
        if (node.nodeType === 'log') {
            output.push(createLogMessage(node.message, node.id))
        }
        if (node.nextNodeId) {
            executeNode(program.nodes[node.nextNodeId])
        }
    }
    if (entryPoint) {
        executeNode(entryPoint)
    }
    output.push(createLogMessage('program finished'))
    return output
}