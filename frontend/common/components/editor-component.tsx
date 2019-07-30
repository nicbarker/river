import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { editorStyles } from 'styles/editor-styles'
import { ApplicationState, Layer } from 'reducers/application-reducer'
import { RiverNodeComponent as RiverNode } from 'components/node-component'
import classNames = require('classnames')

export const Editor = (props: {
    reduxState: ApplicationState,
    setActiveLayer: (activeLayer: Layer) => void,
    setSelectedNode: (id: string) => void,
    insertNode: (previousNodeId: string) => void,
    deleteNode: (id: string) => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(editorStyles)
    const editorRef = React.useRef<HTMLDivElement>()
    React.useEffect(() => editorRef.current && editorRef.current.focus(), [])

    // Register keyboard shortcuts
    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            props.insertNode(props.reduxState.selectedNodeId)
        } else if (event.key === 'ArrowUp') {
            const previousNode = Object.values(props.reduxState.nodes).find(n => n.nextNodeId === props.reduxState.selectedNodeId)
            if (previousNode) {
                props.setSelectedNode(previousNode.id)
            }
        } else if (event.key === 'ArrowDown') {
            if (props.reduxState.nodes[props.reduxState.selectedNodeId].nextNodeId) {
                props.setSelectedNode(props.reduxState.nodes[props.reduxState.selectedNodeId].nextNodeId)
            }
        } else if (event.key === 'Backspace') {
            props.deleteNode(props.reduxState.selectedNodeId)
        } else if (event.key === 'e') {
            props.setActiveLayer('editor')
        } else if (event.key === 'd') {
            props.setActiveLayer('docs')
        } else if (event.key === 'l') {
            props.setActiveLayer('logs')
        }
    }

    const renderedNodes = Object.values(props.reduxState.orderedNodes).map(node => (
        <RiverNode
            key={node.id}
            node={node}
            selected={props.reduxState.selectedNodeId === node.id}
            activeLayer={props.reduxState.activeLayer}
            onClick={() => props.setSelectedNode(node.id)}
        />
    ))

    const pressEnterMessage = renderedNodes.length === 0 ? <div className={styles.pressEnterMessage}>Press Enter to create a new Node</div> : null

    return (
        <div className={styles.editorOuter} onKeyDown={handleKeyPress} ref={editorRef} tabIndex={1}>
            <div className={styles.editorHeader}>
                <div className={classNames(styles.headerButton, { [styles.headerButtonActive]: props.reduxState.activeLayer === 'editor'})} onClick={() => props.setActiveLayer('editor')}>Editor</div>
                <div className={classNames(styles.headerButton, { [styles.headerButtonActive]: props.reduxState.activeLayer === 'docs'})} onClick={() => props.setActiveLayer('docs')}>Docs</div>
                <div className={classNames(styles.headerButton, { [styles.headerButtonActive]: props.reduxState.activeLayer === 'logs'})} onClick={() => props.setActiveLayer('logs')}>Logs</div>
            </div>
            <div className={styles.nodes}>
                {renderedNodes}
                {pressEnterMessage}
            </div>
        </div>
    )
}