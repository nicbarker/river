// --------------------------------------------------
// Run a .rvr program
// --------------------------------------------------

export type RiverNode = {
    id: string,
    nextNodeId?: string
    entryPoint?: boolean
    type?: string
}

export const run = (program: { nodes: { [key: string]: RiverNode} }) => {
    const output = []
    const entryPoint = Object.values(program.nodes).find(n => n.entryPoint)
    output.push('starting river program')
    const executeNode = (node: RiverNode) => {
        output.push('executing node ' + node.id.substr(0, 8))
        if (node.nextNodeId) {
            executeNode(program.nodes[node.nextNodeId])
        }
    }
    if (entryPoint) {
        executeNode(entryPoint)
    }
    output.push('program finished')
    return output
}