// --------------------------------------------------
// Run a .rvr program
// --------------------------------------------------

export const nodeTypes = ['log']

export type RiverNode = {
    id: string
    nextNodeId?: string
    entryPoint?: boolean
    type?: string
}

export type LogNode = RiverNode & {
    type: 'log'
    outputType: 'internal' | 'stdout' | 'stderr'
    properties: {
        message: string
    }
}

export type RuntimeLogMessage = {
    timestamp: number,
    message: string
}

const createLogMessage = (message: string): RuntimeLogMessage => {
    return {
        timestamp: Date.now(),
        message
    }
}

export const run = (program: { nodes: { [key: string]: RiverNode} }) => {
    const output: RuntimeLogMessage[] = []
    const entryPoint = Object.values(program.nodes).find(n => n.entryPoint)
    output.push(createLogMessage('starting river program'))
    const executeNode = (node: RiverNode) => {
        output.push(createLogMessage('executing node ' + node.id.substr(0, 8)))
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