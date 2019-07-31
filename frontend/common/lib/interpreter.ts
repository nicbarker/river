// --------------------------------------------------
// Run a .rvr program
// --------------------------------------------------

export type NodeType = 'log' | 'empty'
export const nodeTypes: NodeType[] = ['log']

type BaseNodeProps = {
    id: string
    nextNodeId?: string
    entryPoint?: boolean
}

export type EmptyNode = BaseNodeProps & {
    type: 'empty'
}

export type LogNode = BaseNodeProps & {
    type: 'log'
    message: string
}

export type RiverNode = EmptyNode | LogNode;

export type RuntimeLogMessage = {
    timestamp: number,
    message: string,
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
        // output.push(createLogMessage('executing ' + (node.type || 'empty') + ' node ' + node.id.substr(0, 8), node.id))
        if (node.type === 'log') {
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