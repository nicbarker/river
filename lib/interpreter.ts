// --------------------------------------------------
// Run a .rvr program
// --------------------------------------------------

export type NodeType = 'LogNode' | 'EmptyNode' | 'CreateVariableNode'
export const searchableNodeTypes: { label: string, nodeType: NodeType }[] = [
    { label: 'Log', nodeType: 'LogNode' },
    { label: 'Create variable', nodeType: 'CreateVariableNode' }
]

export type ValueType = 'text'
export const searchableValueTypes: { label: string, valueType: ValueType }[] = [
    { label: 'Text', valueType: 'text' }
]

export type TextBlockType = 'RawTextBlock' | 'VariableReferenceTextBlock'

export type TextBlock = {
    id: string
    textBlockType: TextBlockType
}

export type RawTextBlock = TextBlock & {
    textBlockType: 'RawTextBlock',
    value: string
}

export type VariableReferenceTextBlock = TextBlock & {
    textBlockType: 'VariableReferenceTextBlock'
    nodeId: string
}

export type TextBlockObjectType = VariableReferenceTextBlock | RawTextBlock

export type TextChain = (TextBlockObjectType)[]

export type RawTextChain = [RawTextBlock]

export type ConditionalType = 'empty' | 'equals' | 'not_equals'

export const searchableConditionalTypes: { label: string, conditionalType: ConditionalType }[] = [
    { label: 'Equals', conditionalType: 'equals' },
    { label: 'Not Equals', conditionalType: 'not_equals' }
]

type BaseConditional = {
    type: ConditionalType
}

type EmptyConditional = {
    type: 'empty'
} & BaseConditional

type EqualsConditional<T = TextChain> = {
    type: 'equals'
    leftSide: T
    rightSide: T
} & BaseConditional

type NotEqualsConditional<T = TextChain> = {
    type: 'not_equals'
    leftSide: T
    rightSide: T
} & BaseConditional

type BaseNodeProps = {
    id: string
    nextNodeId?: string
    entryPoint?: boolean
    nodeType: NodeType
    conditional?: EmptyConditional | EqualsConditional | NotEqualsConditional
}

export type EmptyNode = BaseNodeProps & {
    nodeType: 'EmptyNode'
}

export type LogNode = BaseNodeProps & {
    nodeType: 'LogNode',
    message: TextChain
}

export namespace VariableNodes {
    export type Create = BaseNodeProps & {
        nodeType: 'CreateVariableNode'
        label: string,
        valueType: 'text'
        value: TextChain
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
        textBlockType: 'RawTextBlock',
        value: message
    }]
}

export const renderTextChain = (nodes: { [key: string]: RiverNode }, variableValues: { [key: string]: any }, textChain: TextChain) => {
    let currentString = ''
    for (const block of textChain) {
        if (block.textBlockType === 'RawTextBlock') {
            currentString += block.value
        } else if (block.textBlockType === 'VariableReferenceTextBlock') {
            currentString += variableValues[block.nodeId]
        }
    }
    return currentString
}

export const textChainHasErrors = (nodes: { [key: string]: RiverNode }, textChain: TextChain) => {
    for (const block of textChain) {
        if (block.textBlockType === 'VariableReferenceTextBlock' && !nodes[block.nodeId]) {
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
        if (node.conditional) {
            switch (node.conditional.type) {
                case 'equals':
                case 'not_equals': {
                    const leftSide = renderTextChain(program.nodes, variableValues, node.conditional.leftSide)
                    const rightSide = renderTextChain(program.nodes, variableValues, node.conditional.rightSide)
                    if ((leftSide !== rightSide && node.conditional.type === 'equals') || (leftSide === rightSide && node.conditional.type === 'not_equals')) {
                        if (node.nextNodeId) {
                            executeNode(program.nodes[node.nextNodeId])
                        }
                        return
                    }
                }
                case 'empty':
            }
        }

        if (node.nodeType === 'LogNode') {
            if (textChainHasErrors(program.nodes, node.message)) {
                output.push(createLogError(`Log failed because its message contains a variable that has been deleted.`, node.id))
            } else {
                output.push(createLogMessage(renderTextChain(program.nodes, variableValues, node.message), node.id))
            }
        } else if (node.nodeType === 'CreateVariableNode') {
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