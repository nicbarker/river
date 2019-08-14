import * as React from 'react'
import { RiverNode, NodeType, ValueType, TextChain, textChainHasErrors } from 'lib/interpreter';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import { PrecursorNode } from './precursor-node-component';
import { LogNode } from './log-node-component';
import { StorageCreateNode } from './storage-create-node-component';
import classNames = require('classnames');

export type NodeOuterProps = {
    node: RiverNode
    selected?: boolean
    selectNode: () => void
    deleteNode: () => void
    setNodeType: (type: NodeType) => void
    focusParent: () => void
    setLogMessage: (message: TextChain) => void
    setStorageCreateLabel: (label: string) => void
    setStorageCreateValueType: (valueType: ValueType) => void
    setStorageCreateValue: (value: TextChain) => void
    parentOwnedRef?: React.RefObject<HTMLDivElement>
    nodes: { [key: string]: RiverNode }
}

export const NodeOuter = (props: NodeOuterProps) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles)
    const nodeRef = React.useRef<HTMLDivElement>()
    const innerRef = React.useRef<any>()
    // Preferentially use the ref passed in by the parent (it's passed in if this is selected to allow for focus)
    const containerRef = props.parentOwnedRef || nodeRef
    // On selection, focus the outer node to listen for keyboard events
    React.useEffect(() => {
        if (props.selected && containerRef.current) {
            // Don't focus this outer node if the inner content (such as text input) has been focused directly by mouse click
            if (document.activeElement !== innerRef.current) {
                containerRef.current.focus()
            }
        }
    }, [props.selected])

    // On unmount, return focus to the parent
    React.useEffect(() => props.focusParent, [])

    const onOuterKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Backspace') {
            event.stopPropagation()
            props.deleteNode()
        } else if (event.key === 'ArrowRight' && innerRef.current) {
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
    } else if (props.node.nodeType === 'storage_create') {
        innerNode = <StorageCreateNode
            node={props.node}
            selected={props.selected}
            focusParent={focusParent}
            innerRef={innerRef}
            selectNode={props.selectNode}
            setStorageCreateLabel={props.setStorageCreateLabel}
            setStorageCreateValueType={props.setStorageCreateValueType}
            setStorageCreateValue={props.setStorageCreateValue}
        />
    }

    const nodeOuterStyles = classNames(styles.nodeOuter, {
        [styles.selected]: props.selected,
        [styles.error]: nodeHasErrors,
        [styles.errorSelected]: nodeHasErrors && props.selected
    })

    return (
        <div className={nodeOuterStyles} tabIndex={1} ref={containerRef} onKeyDown={onOuterKeyDown} onMouseDown={props.selectNode} onFocus={(event: React.FocusEvent) => { event.stopPropagation() }}>
            {innerNode}
        </div>
    )
}