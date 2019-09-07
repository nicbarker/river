import * as React from 'react'
import { RiverNode, NodeType, ValueType, TextChain, textChainHasErrors } from 'lib/interpreter';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import { PrecursorNode } from './precursor-node-component';
import { LogNode } from './log-node-component';
import { CreateVariableNode } from './create-variable-node-component';
import classNames = require('classnames');

type rectangle = [number, number, number, number]

const rectanglesIntersect = (r1: rectangle, r2: rectangle) => {
    return !(r2[0] > r1[2] ||
             r2[2] < r1[0] ||
             r2[1] > r1[3] ||
             r2[3] < r1[1]);
  }

export type NodeOuterProps = {
    node: RiverNode
    selected?: boolean
    dragSelectionDimensions?: [number, number, number, number] // x1, y1, x2, y2 of selection rectangle
    dragSelected?: boolean
    selectNode: () => void
    deleteNode: () => void
    setNodeType: (type: NodeType) => void
    focusParent: () => void
    setLogMessage: (message: TextChain) => void
    setCreateVariableLabel: (label: string) => void
    setCreateVariableValueType: (valueType: ValueType) => void
    setCreateVariableValue: (value: TextChain) => void
    setNodeDragSelected: (selected: boolean) => void
    parentOwnedRef?: React.RefObject<HTMLDivElement>
    nodes: { [key: string]: RiverNode }
}

export const NodeOuter = (props: NodeOuterProps) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles)
    const nodeRef = React.useRef<HTMLDivElement>()
    const innerRef = React.useRef<any>()
    const dragSelectionOuterRef = React.useRef<HTMLDivElement>()
    // Preferentially use the ref passed in by the parent (it's passed in if this is selected to allow for focus)
    const containerRef = props.parentOwnedRef || nodeRef

    // On selection, focus the outer node to listen for keyboard events
    React.useEffect(() => {
        if (props.selected && containerRef.current) {
            // Don't focus this outer node if the inner content (such as text input) has been focused directly by mouse click
            if (document.activeElement.tagName !== 'INPUT') {
                containerRef.current.focus()
            }
        }
    }, [props.selected])

    const onOuterKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowRight' && innerRef.current) {
            event.stopPropagation()
            innerRef.current.focus()
        }
    }, [])

    const focusParent = () => containerRef.current && containerRef.current.focus()

    let nodeHasErrors = false

    let innerNode
    if (props.node.nodeType === 'empty') {
        innerNode = <PrecursorNode
            node={props.node}
            selected={props.selected}
            setNodeType={props.setNodeType}
            deleteNode={props.deleteNode}
            focusParent={focusParent}
            innerRef={innerRef}
            selectNode={props.selectNode}
        />
    } else if (props.node.nodeType === 'log') {
        nodeHasErrors = textChainHasErrors(props.nodes, props.node.message)
        innerNode = <LogNode
            node={props.node}
            selected={props.selected}
            focusParent={focusParent}
            innerRef={innerRef}
            setLogMessage={props.setLogMessage}
            selectNode={props.selectNode}
            nodes={props.nodes}
        />
    } else if (props.node.nodeType === 'create_variable') {
        if (props.node.valueType === 'text') {
            nodeHasErrors = textChainHasErrors(props.nodes, props.node.value)
        }
        innerNode = <CreateVariableNode
            node={props.node}
            selected={props.selected}
            focusParent={focusParent}
            innerRef={innerRef}
            selectNode={props.selectNode}
            setCreateVariableLabel={props.setCreateVariableLabel}
            setCreateVariableValueType={props.setCreateVariableValueType}
            setCreateVariableValue={props.setCreateVariableValue}
        />
    }

    const nodeOuterStyles = classNames(styles.nodeOuter, {
        [styles.selected]: props.selected,
        [styles.error]: nodeHasErrors,
        [styles.errorSelected]: nodeHasErrors && props.selected
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
        if (!props.selected) {
            props.selectNode()
        }
        event.stopPropagation()
    }

    return (
        <div className={nodeOuterStyles} tabIndex={1} ref={containerRef} onKeyDown={onOuterKeyDown} onMouseDown={props.selectNode} onFocus={onFocus}>
            <div className={styles.dragSelectionOverlayOuter} ref={dragSelectionOuterRef}>
                {dragSelectionOverlay}
                {innerNode}
            </div>
        </div>
    )
}