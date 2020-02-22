import * as React from 'react'
import { textChainHasErrors, NodeType, ValueType, TextBlockObjectType, ConditionalType } from 'lib/interpreter'
import { StylesheetContext } from 'context/stylesheet-context'
import { nodeStyles } from 'styles/node-styles'
import { PrecursorNode } from './precursor-node-component'
import { LogNode } from './log-node-component'
import { CreateVariableNode } from './create-variable-node-component'
import * as classNames from 'classnames'
import { StoreContext } from 'context/store-context'
import { InteractionContext } from 'context/interaction-context'
import { Conditional } from './conditional'
import { useEffect } from 'react'

type rectangle = [number, number, number, number]

const rectanglesIntersect = (r1: rectangle, r2: rectangle) => {
    return !(r2[0] > r1[2] ||
             r2[2] < r1[0] ||
             r2[1] > r1[3] ||
             r2[3] < r1[1])
  }

export type NodeOuterProps = {
    nodeId: string
    index: number
    dragSelectionDimensions?: [number, number, number, number] // x1, y1, x2, y2 of selection rectangle
    dragSelected?: boolean
    setNodeDragSelected: (selected: boolean) => void
    focusState: number[]
}

export const NodeOuter = (props: NodeOuterProps) => {
    const { state, dispatch } = React.useContext(StoreContext)
    const { createStyles } = React.useContext(StylesheetContext)
    const styles = createStyles(nodeStyles)
    const innerRef = React.useRef<any>()
    const dragSelectionOuterRef = React.useRef<HTMLDivElement>()

    const { currentFocus, focusUtil, keyboardUtil } = React.useContext(InteractionContext)
    const [hasFocus, ancestorFocus] = focusUtil.hasFocus(props.focusState)
    const node = state.nodes[props.nodeId]
    const nodeFocusState = node.conditional ? [...props.focusState, 1] : props.focusState
    const [nodeHasFocus, _] = focusUtil.hasFocus(nodeFocusState)
    // Register keyboard handling
    useEffect(() => {
        if (!(hasFocus || (node.conditional && ancestorFocus && currentFocus.length === props.focusState.length + 1))) { return }
        const arrowRightHandler = () => focusUtil.setCurrentFocus([...currentFocus, 0])
        const arrowUpHandler = () => {
            if (currentFocus[currentFocus.length - 1] === 1) {
                focusUtil.incrementCurrentFocus(-1)
            } else {
                console.log(currentFocus)
                const upOneLevel = currentFocus.slice(0, currentFocus.length - 1)
                upOneLevel[upOneLevel.length - 1]--
                focusUtil.setCurrentFocus(upOneLevel)
            }
        }
        const arrowDownHandler = () => {
            if (currentFocus[currentFocus.length - 1] === 0) {
                focusUtil.incrementCurrentFocus(1)
            } else {
                const upOneLevel = currentFocus.slice(0, currentFocus.length - 1)
                upOneLevel[upOneLevel.length - 1]++
                focusUtil.setCurrentFocus(upOneLevel)
            }
        }
        const enterHandler = (conditional: boolean = false) => {
            if (node.conditional && ancestorFocus && currentFocus.length === props.focusState.length + 1 && nodeHasFocus) {
                dispatch({ type: 'INSERT_NODE', payload: {
                    previousNodeId: props.nodeId,
                    conditional
                }})
            }
        }

        const conditionalHandler = () => {
            const conditional = !!!node.conditional
            dispatch({ type: 'SET_NODE_CONDITIONAL', payload: { nodeId: props.nodeId, conditional }})
            if (conditional) {
                focusUtil.setCurrentFocus([...currentFocus, 0, 0])
            }
        }
    
        keyboardUtil.registerKeyListeners([
            { key: 'ArrowUp', callback: arrowUpHandler },
            { key: 'ArrowDown', callback: arrowDownHandler },
            { key: 'ArrowRight', callback: arrowRightHandler },
            { key: 'Enter', callback: enterHandler },
            { key: 'c', callback: conditionalHandler },
        ])

        return () => {
            keyboardUtil.deregisterKeyListeners([arrowRightHandler, arrowUpHandler, arrowDownHandler, enterHandler, conditionalHandler])
        }
    }, [hasFocus, focusUtil.incrementCurrentFocus, currentFocus, ancestorFocus, node, props.nodeId, props.focusState])

    // Focus on mount or type change
    React.useEffect(() => {
        focusUtil.setCurrentFocus(node.conditional ? [...props.focusState, 0, 0] : [...nodeFocusState, 0])
    }, [])

    let nodeHasErrors = false
    const selectNode = () => dispatch({ type: 'SET_SELECTED_NODE', payload: { selectedNodeId: props.nodeId } })

    let innerNode
    if (node.nodeType === 'empty') {
        innerNode = <PrecursorNode
            node={node}
            selected={hasFocus}
            setNodeType={(type: NodeType) => dispatch({ type: 'SET_NODE_TYPE', payload: { nodeId: props.nodeId, type } })}
            selectNode={selectNode}
            focusState={nodeFocusState}
        />
    } else if (node.nodeType === 'log') {
        nodeHasErrors = textChainHasErrors(state.nodes, node.message)
        innerNode = <LogNode
            node={node}
            selected={hasFocus}
            setLogMessage={(message: TextBlockObjectType[]) => dispatch({ type: 'SET_LOG_MESSAGE', payload: { nodeId: props.nodeId, message } })}
            selectNode={selectNode}
            nodes={state.nodes}
            focusState={nodeFocusState}
        />
    } else if (node.nodeType === 'create_variable') {
        if (node.valueType === 'text') {
            nodeHasErrors = textChainHasErrors(state.nodes, node.value)
        }
        innerNode = <CreateVariableNode
            node={node}
            selected={hasFocus}
            innerRef={innerRef}
            selectNode={selectNode}
            setCreateVariableLabel={(label: string) => dispatch({ type: 'SET_CREATE_VARIABLE_LABEL', payload: { nodeId: props.nodeId, label } })}
            setCreateVariableValueType={(valueType: ValueType) => dispatch({ type: 'SET_CREATE_VARIABLE_VALUE_TYPE', payload: { nodeId: props.nodeId, valueType } })}
            setCreateVariableValue={(value: TextBlockObjectType[]) => dispatch({ type: 'SET_CREATE_VARIABLE_VALUE', payload: { nodeId: props.nodeId, value } })}
            focusState={nodeFocusState}
        />
    }

    const nodeOuterStyles = classNames(styles.nodeOuter, {
        [styles.selected]: ancestorFocus,
        [styles.error]: nodeHasErrors,
        [styles.errorSelected]: nodeHasErrors && ancestorFocus
    })

    const r2 = dragSelectionOuterRef.current
    if (!props.dragSelected && props.dragSelectionDimensions && r2 && rectanglesIntersect(props.dragSelectionDimensions, [r2.offsetLeft, r2.offsetTop, r2.offsetLeft + r2.offsetWidth, r2.offsetTop + r2.offsetHeight])) {
        props.setNodeDragSelected(true)
    } else if (props.dragSelected && props.dragSelectionDimensions && !(r2 && rectanglesIntersect(props.dragSelectionDimensions, [r2.offsetLeft, r2.offsetTop, r2.offsetLeft + r2.offsetWidth, r2.offsetTop + r2.offsetHeight]))) {
        props.setNodeDragSelected(false)
    }

    let dragSelectionOverlay
    if (props.dragSelected) {
        dragSelectionOverlay = <div className={styles.dragSelectionOverlay} />
    }

    let contents = <div className={classNames(styles.subNode, { [styles.subNodeSelected]: nodeHasFocus })}>{innerNode}</div>
    if (node.conditional) {
        contents = (
            <>
                <Conditional
                    node={node}
                    focusState={[...props.focusState, 0]}
                />
                <div className={classNames(styles.subNode, { [styles.subNodeSelected]: nodeHasFocus })}>
                    {innerNode}
                </div>
            </>
        )
    }

    return (
        <div className={nodeOuterStyles} onMouseDown={selectNode}>
            {contents}
        </div>
    )
}