import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { editorStyles } from 'styles/editor-styles'
import { ApplicationState, Layer } from 'reducers/application-reducer'
import { RiverNodeComponent as RiverNode } from 'components/node-component'
import { registerKeyListener, deregisterKeyListener } from 'lib/global-keyboard-listener';
import classNames = require('classnames');

export const Editor = (props: {
    reduxState: ApplicationState,
    setActiveLayer: (activeLayer: Layer) => void,
    setSelectedNode: (id: string) => void,
    insertNode: (previousNodeId: string) => void,
    deleteNode: (id: string) => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(editorStyles);

    // Register keyboard shortcuts
    React.useEffect(() => {
        const upKeyId = registerKeyListener(38, () => {
            const previousNode = Object.values(props.reduxState.nodes).find(n => n.nextNodeId === props.reduxState.selectedNodeId)
            if (previousNode) {
                props.setSelectedNode(previousNode.id)
            }
        })

        const downKeyId = registerKeyListener(40, () => {
            if (props.reduxState.nodes[props.reduxState.selectedNodeId].nextNodeId) {
                props.setSelectedNode(props.reduxState.nodes[props.reduxState.selectedNodeId].nextNodeId)
            }
        })

        const enterKeyId = registerKeyListener(13, () => props.insertNode(props.reduxState.selectedNodeId))
        const backspaceKeyId = registerKeyListener(8, () => props.deleteNode(props.reduxState.selectedNodeId))

        return () => {
            deregisterKeyListener(upKeyId)
            deregisterKeyListener(downKeyId)
            deregisterKeyListener(enterKeyId)
            deregisterKeyListener(backspaceKeyId)
        }
    })

    const renderedNodes = Object.values(props.reduxState.orderedNodes).map(node => (
        <RiverNode
            key={node.id}
            node={node}
            selected={props.reduxState.selectedNodeId === node.id}
            onClick={() => props.setSelectedNode(node.id)}
        />
    ))

    const pressEnterMessage = renderedNodes.length === 0 ? <div className={styles.pressEnterMessage}>Press Enter to create a new Node</div> : null

    return (
        <div className={styles.editorOuter}>
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