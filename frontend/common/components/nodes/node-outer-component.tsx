import * as React from 'react'
import { RiverNode, NodeType } from 'lib/interpreter';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import { PrecursorNode } from './precursor-node-component';
import { LogNode } from './log-node-component';

export type NodeOuterProps = {
    node: RiverNode,
    selected?: boolean,
    selectNode: () => void,
    deleteNode: () => void,
    setNodeType: (type: NodeType) => void,
    focusParent: () => void
}

export const NodeOuter = (props: NodeOuterProps) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles)
    const outerRef = React.useRef<HTMLDivElement>()
    const innerRef = React.useRef<any>()

    // On selection, focus the outer node to listen for keyboard events
    React.useEffect(() => {
        if (props.selected && outerRef.current) {
            outerRef.current.focus()
        }
    }, [props.selected])

    // On unmount, return focus to the parent
    React.useEffect(() => {
        // On the first mount of an empty node, focus the auto complete input
        if (!props.node.type && innerRef.current) {
            innerRef.current.focus()
        }
        return props.focusParent
    }, [])

    const onOuterKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Backspace') {
            event.stopPropagation()
            props.deleteNode()
        } else if (event.key === 'ArrowRight' && innerRef.current) {
            event.stopPropagation()
            innerRef.current.focus()
        }
    }, [])

    const focusParent = () => outerRef.current && outerRef.current.focus()

    let innerNode
    if (!props.node.type) {
        innerNode = <PrecursorNode
            key={props.node.id}
            node={props.node}
            selected={props.selected}
            setNodeType={props.setNodeType}
            deleteNode={props.deleteNode}
            focusParent={focusParent}
            innerRef={innerRef}
        />
    } else if (props.node.type === 'log') {
        innerNode = <LogNode key={props.node.id} selected={props.selected}></LogNode>
    }

    return (
        <div className={styles.nodeOuter} tabIndex={1} ref={outerRef} onKeyDown={onOuterKeyDown} onClick={props.selectNode}>
            {innerNode}
        </div>
    )
}