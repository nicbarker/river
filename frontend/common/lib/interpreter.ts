// --------------------------------------------------
// Run a .rvr program
// --------------------------------------------------

export type RiverNode = {
    id: string,
    nextNodeId?: string
    entryPoint?: boolean
    type?: string
}

export type LogMessage = {
    timestamp: number,
    message: string
}

const createLogMessage = (message: string): LogMessage => {
    return {
        timestamp: Date.now(),
        message
    }
}

export const run = (program: { nodes: { [key: string]: RiverNode} }) => {
    const output: LogMessage[] = []
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