import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { editorStyles } from 'styles/editor-styles'
import { Layer } from 'reducers/application-reducer'
import classNames = require('classnames')
import { NodeType, RiverNode } from 'lib/interpreter';
import { NodeOuter } from 'containers/node-outer-container';

export type EditorProps = {
    nodes: { [id: string]: RiverNode },
    orderedNodes: RiverNode[],
    activeLayer: Layer,
    selectedNodeId: string,

    setActiveLayer: (activeLayer: Layer) => void,
    setSelectedNode: (nodeId: string) => void,
    insertNode: (previousNodeId: string) => void,
    setNodeType: (nodeId: string, type: NodeType) => void,
}

export const Editor = (props: EditorProps) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(editorStyles)
    const editorRef = React.useRef<HTMLDivElement>()
    const focusEditor = () => editorRef.current && editorRef.current.focus()
    React.useEffect(() => focusEditor, [])

    // Register keyboard shortcuts
    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            props.insertNode(props.selectedNodeId)
        } else if (event.key === 'ArrowUp') {
            const previousNode = Object.values(props.nodes).find(n => n.nextNodeId === props.selectedNodeId)
            if (previousNode) {
                props.setSelectedNode(previousNode.id)
            }
        } else if (event.key === 'ArrowDown') {
            if (props.nodes[props.selectedNodeId].nextNodeId) {
                props.setSelectedNode(props.nodes[props.selectedNodeId].nextNodeId)
            }
        } else if (event.key === 'e') {
            props.setActiveLayer('editor')
        } else if (event.key === 'd') {
            props.setActiveLayer('docs')
        } else if (event.key === 'l') {
            props.setActiveLayer('logs')
        }
    }

    const renderedNodes = Object.values(props.orderedNodes).map(node => <NodeOuter key={node.id} nodeId={node.id} focusParent={focusEditor} />)

    const pressEnterMessage = renderedNodes.length === 0 ? <div className={styles.pressEnterMessage}>Press Enter to create a new Node</div> : null

    return (
        <div className={styles.editorOuter} onKeyDown={handleKeyPress} ref={editorRef} tabIndex={1}>
            <div className={styles.editorHeader}>
                <div className={classNames(styles.headerButton, { [styles.headerButtonActive]: props.activeLayer === 'editor'})} onClick={() => props.setActiveLayer('editor')}>Editor</div>
                <div className={classNames(styles.headerButton, { [styles.headerButtonActive]: props.activeLayer === 'docs'})} onClick={() => props.setActiveLayer('docs')}>Docs</div>
                <div className={classNames(styles.headerButton, { [styles.headerButtonActive]: props.activeLayer === 'logs'})} onClick={() => props.setActiveLayer('logs')}>Logs</div>
            </div>
            <div className={styles.nodes}>
                {renderedNodes}
                {pressEnterMessage}
            </div>
        </div>
    )
}