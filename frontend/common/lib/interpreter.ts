// --------------------------------------------------
// Run a .rvr program
// --------------------------------------------------

export type NodeType = 'log' | 'empty' | 'create_variable'
export const searchableNodeTypes: { label: string, nodeType: NodeType }[] = [
    { label: 'Log', nodeType: 'log' },
    { label: 'Create variable', nodeType: 'create_variable' }
]

export type ValueType = 'text'
export const searchableValueTypes: { label: string, valueType: ValueType }[] = [
    { label: 'Text', valueType: 'text' }
]

export type TextBlockType = 'raw' | 'variableReference'

export type TextBlock = {
    id: string
    type: TextBlockType
}

export type RawTextBlock = TextBlock & {
    type: 'raw',
    value: string
}

export type VariableReferenceTextBlock = TextBlock & {
    type: 'variableReference'
    nodeId: string
}

export type TextBlockObjectType = VariableReferenceTextBlock | RawTextBlock

export type TextChain = (TextBlockObjectType)[]

export type RawTextChain = [RawTextBlock]

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
    message: TextChain
}

export namespace VariableNodes {
    export type Create = BaseNodeProps & {
        nodeType: 'create_variable'
        label: string,
        valueType: 'text'
        value: TextChain,
        runtimeValue: string
    }
}


export type RiverNode = EmptyNode | LogNode | VariableNodes.Create;

export type RuntimeLogMessage = {
    timestamp: number
    message: string
    nodeId?: string // Id of the node that this log message originated from
    type: 'message' | 'error'
}

export const createRawTextChainFromString = (message: string): RawTextChain => {
    return [{
        id: 'string',
        type: 'raw',
        value: message
    }]
}

export const renderTextChain = (nodes: { [key: string]: RiverNode }, variableValues: { [key: string]: any }, textChain: TextChain) => {
    let currentString = ''
    for (const block of textChain) {
        if (block.type === 'raw') {
            currentString += block.value
        } else if (block.type === 'variableReference') {
            currentString += variableValues[block.nodeId]
        }
    }
    return currentString
}

export const textChainHasErrors = (nodes: { [key: string]: RiverNode }, textChain: TextChain) => {
    for (const block of textChain) {
        if (block.type === 'variableReference' && !nodes[block.nodeId]) {
            return true
        }
    }
    return false
}

const createLogMessage = (message: string, nodeId?: string): RuntimeLogMessage => {
    return {
        timestamp: Date.now(),
        message,
        type: 'message',
        nodeId
    }
}

const createLogError = (message: string, nodeId?: string): RuntimeLogMessage => {
    return {
        timestamp: Date.now(),
        message,
        type: 'error',
        nodeId
    }
}

export const run = (program: { nodes: { [key: string]: RiverNode} }) => {
    const output: RuntimeLogMessage[] = []
    const entryPoint = Object.values(program.nodes).find(n => n.entryPoint)
    const variableValues: { [key: string]: any } = {}
    output.push(createLogMessage('starting river program'))
    const executeNode = (node: RiverNode) => {
        if (node.nodeType === 'log') {
            if (textChainHasErrors(program.nodes, node.message)) {
                output.push(createLogError(`Log failed because its message contains a variable that has been deleted.`, node.id))
            } else {
                output.push(createLogMessage(renderTextChain(program.nodes, variableValues, node.message), node.id))
            }
        } else if (node.nodeType === 'create_variable') {
            if (node.valueType === 'text') {
                if (textChainHasErrors(program.nodes, node.value)) {
                    output.push(createLogError(`Create Variable failed because its value contains another variable that has been deleted.`, node.id))
                } else {
                    variableValues[node.id] = renderTextChain(program.nodes, variableValues, node.value)
                }
            }
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