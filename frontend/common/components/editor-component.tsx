import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { editorStyles } from 'styles/editor-styles'
import { ApplicationState } from 'reducers/application-reducer'
import { RiverNodeComponent as RiverNode } from 'components/node-component'
import { registerKeyListener, deregisterKeyListener } from 'lib/global-keyboard-listener';

export const Editor = (props: {
    reduxState: ApplicationState,
    setSelectedNode: (id: string) => void,
    deleteNode: (id: string) => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(editorStyles);

    // Register keyboard shortcuts
    React.useEffect(() => {
        const upKeyId = registerKeyListener(38, () => {
            const currentNodeIndex = Object.keys(props.reduxState.nodes).indexOf(props.reduxState.selectedNodeId)
            if (currentNodeIndex > 0) {
                const previousNode = props.reduxState.nodes[Object.keys(props.reduxState.nodes)[currentNodeIndex - 1]]
                props.setSelectedNode(previousNode.id)
            }
        })

        const downKeyId = registerKeyListener(40, () => {
            const currentNodeIndex = Object.keys(props.reduxState.nodes).indexOf(props.reduxState.selectedNodeId)
            if (currentNodeIndex < Object.keys(props.reduxState.nodes).length - 1) {
                const nextNode = props.reduxState.nodes[Object.keys(props.reduxState.nodes)[currentNodeIndex + 1]]
                props.setSelectedNode(nextNode.id)
            }
        })

        const deleteKeyId = registerKeyListener(8, () => props.deleteNode(props.reduxState.selectedNodeId))

        return () => {
            deregisterKeyListener(upKeyId)
            deregisterKeyListener(downKeyId)
            deregisterKeyListener(deleteKeyId)
        }
    })

    const nodes = Object.values(props.reduxState.nodes).map(node => (
        <RiverNode
            key={node.id}
            node={node}
            selected={props.reduxState.selectedNodeId === node.id}
            onClick={() => props.setSelectedNode(node.id)}
        />
    ))

    return (
        <div className={styles.editorOuter}>
            {nodes}
        </div>
    )
}