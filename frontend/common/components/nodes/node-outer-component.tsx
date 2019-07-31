import * as React from 'react'
import { RiverNode, NodeType } from 'lib/interpreter';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import { PrecursorNode } from './precursor-node-component';
import { LogNode } from './log-node-component';

export type NodeOuterProps = {
    node: RiverNode
    selected?: boolean
    selectNode: () => void
    deleteNode: () => void
    setNodeType: (type: NodeType) => void
    focusParent: () => void
    setLogMessage: (message: string) => void
    parentOwnedRef?: React.RefObject<HTMLDivElement>
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
    React.useEffect(() => {
        // On the first mount of an empty node, focus the auto complete input
        if ((props.node.type === 'empty' || props.node.type === 'log') && innerRef.current) {
            innerRef.current.focus()
        }
        return props.focusParent
    }, [props.node.type])

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

    let innerNode
    if (props.node.type === 'empty') {
        innerNode = <PrecursorNode
            key={props.node.id}
            node={props.node}
            selected={props.selected}
            setNodeType={props.setNodeType}
            deleteNode={props.deleteNode}
            focusParent={focusParent}
            innerRef={innerRef}
            selectNode={props.selectNode}
        />
    } else if (props.node.type === 'log') {
        innerNode = <LogNode
            node={props.node}
            key={props.node.id}
            selected={props.selected}
            focusParent={focusParent}
            innerRef={innerRef}
            setLogMessage={props.setLogMessage}
            selectNode={props.selectNode}
        />
    }

    return (
        <div className={styles.nodeOuter} tabIndex={1} ref={containerRef} onKeyDown={onOuterKeyDown} onClick={props.selectNode} onFocus={(event: React.FocusEvent) => event.stopPropagation()}>
            {innerNode}
        </div>
    )
}