import * as React from 'react'
import { StylesheetContext } from 'context/stylesheet-context'
import { RiverNode, searchableNodeTypes, NodeType } from 'lib/interpreter'
import MenuIcon from 'ionicons/dist/ionicons/svg/md-more.svg'
import { InlineSelector } from '../inline-selector-component'
import { colours } from 'lib/colours'
import { precursorNodeStyles } from 'styles/precursor-node-styles'
import { InteractionContext } from 'context/interaction-context'

export const PrecursorNode = (props: {
    node: RiverNode
    selected?: boolean
    setNodeType: (type: NodeType) => void
    selectNode: () => void
    focusState: number[]
}) => {
    const { createStyles } = React.useContext(StylesheetContext)
    const styles = createStyles(precursorNodeStyles)
    const { currentFocus, focusUtil } = React.useContext(InteractionContext)


    const items = searchableNodeTypes.map(n => {
        return {
            label: n.label,
            value: n.nodeType
        }
    })

    return (
        <div className={styles.node}>
            <div className={styles.nodeLabel}><MenuIcon className={styles.labelIcon} style={{ fill: '#000' }} /></div>
            <div className={styles.nodeInner}>
                <InlineSelector
                    nodeId={props.node.id}
                    items={items}
                    setValue={(type: NodeType) => {
                        props.setNodeType(type)
                        focusUtil.setCurrentFocus(currentFocus)
                    }}
                    colour={colours.lightPurple}
                    width={150}
                    focusState={[...props.focusState, 0]}
                />
            </div>
        </div>
    )
}