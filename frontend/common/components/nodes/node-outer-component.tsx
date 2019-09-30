import * as React from 'react'
import { textChainHasErrors, NodeType, ValueType, TextBlockObjectType } from 'lib/interpreter';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import { PrecursorNode } from './precursor-node-component';
import { LogNode } from './log-node-component';
import { CreateVariableNode } from './create-variable-node-component';
import classNames = require('classnames');
import { StoreContext } from 'reducers/reducer-context';

type rectangle = [number, number, number, number]

const rectanglesIntersect = (r1: rectangle, r2: rectangle) => {
    return !(r2[0] > r1[2] ||
             r2[2] < r1[0] ||
             r2[1] > r1[3] ||
             r2[3] < r1[1]);
  }

export type NodeOuterProps = {
    nodeId: string
    dragSelectionDimensions?: [number, number, number, number] // x1, y1, x2, y2 of selection rectangle
    dragSelected?: boolean
    parentOwnedRef?: React.RefObject<HTMLDivElement>
    focusParent: () => void
    setNodeDragSelected: (selected: boolean) => void
}

export const NodeOuter = (props: NodeOuterProps) => {
    const { state, dispatch } = React.useContext(StoreContext)
    const { createStyles } = React.useContext(StylesheetContext)
    const styles = createStyles(nodeStyles)
    const nodeRef = React.useRef<HTMLDivElement>()
    const innerRef = React.useRef<any>()
    const dragSelectionOuterRef = React.useRef<HTMLDivElement>()
    // Preferentially use the ref passed in by the parent (it's passed in if this is selected to allow for focus)
    const containerRef = props.parentOwnedRef || nodeRef

    const selected = props.nodeId === state.selectedNodeId
    const node = state.nodes[props.nodeId]

    // On selection, focus the outer node to listen for keyboard events
    React.useEffect(() => {
        if (selected && containerRef.current) {
            // Don't focus this outer node if the inner content (such as text input) has been focused directly by mouse click
            if (document.activeElement.tagName !== 'INPUT') {
                containerRef.current.focus()
            }
        }
    }, [selected])

    const onOuterKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowRight' && innerRef.current) {
            event.stopPropagation()
            innerRef.current.focus()
        }
    }, [])

    const focusParent = () => containerRef.current && containerRef.current.focus()

    let nodeHasErrors = false

    const selectNode = () => dispatch({ type: 'SET_SELECTED_NODE', payload: { selectedNodeId: props.nodeId } })
    let innerNode
    if (node.nodeType === 'empty') {
        innerNode = <PrecursorNode
            node={node}
            selected={selected}
            setNodeType={(type: NodeType) => dispatch({ type: 'SET_NODE_TYPE', payload: { nodeId: props.nodeId, type } })}
            focusParent={focusParent}
            innerRef={innerRef}
            selectNode={selectNode}
        />
    } else if (node.nodeType === 'log') {
        nodeHasErrors = textChainHasErrors(state.nodes, node.message)
        innerNode = <LogNode
            node={node}
            selected={selected}
            focusParent={focusParent}
            innerRef={innerRef}
            setLogMessage={(message: TextBlockObjectType[]) => dispatch({ type: 'SET_LOG_MESSAGE', payload: { nodeId: props.nodeId, message } })}
            selectNode={selectNode}
            nodes={state.nodes}
        />
    } else if (node.nodeType === 'create_variable') {
        if (node.valueType === 'text') {
            nodeHasErrors = textChainHasErrors(state.nodes, node.value)
        }
        innerNode = <CreateVariableNode
            node={node}
            selected={selected}
            focusParent={focusParent}
            innerRef={innerRef}
            selectNode={selectNode}
            setCreateVariableLabel={(label: string) => dispatch({ type: 'SET_CREATE_VARIABLE_LABEL', payload: { nodeId: props.nodeId, label } })}
            setCreateVariableValueType={(valueType: ValueType) => dispatch({ type: 'SET_CREATE_VARIABLE_VALUE_TYPE', payload: { nodeId: props.nodeId, valueType } })}
            setCreateVariableValue={(value: TextBlockObjectType[]) => dispatch({ type: 'SET_CREATE_VARIABLE_VALUE', payload: { nodeId: props.nodeId, value } })}
        />
    }

    const nodeOuterStyles = classNames(styles.nodeOuter, {
        [styles.selected]: selected,
        [styles.error]: nodeHasErrors,
        [styles.errorSelected]: nodeHasErrors && selected
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

    const onFocus = (event: React.FocusEvent) => {
        if (!selected) {
            selectNode()
        }
        event.stopPropagation()
    }

    return (
        <div className={nodeOuterStyles} tabIndex={1} ref={containerRef} onKeyDown={onOuterKeyDown} onMouseDown={selectNode} onFocus={onFocus}>
            <div className={styles.dragSelectionOverlayOuter} ref={dragSelectionOuterRef}>
                {dragSelectionOverlay}
                {innerNode}
            </div>
        </div>
    )
}