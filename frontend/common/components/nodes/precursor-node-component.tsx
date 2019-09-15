import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { RiverNode, searchableNodeTypes, NodeType } from 'lib/interpreter'
import MoreIcon from 'ionicons/dist/ionicons/svg/ios-more.svg'
import { InlineSelector } from '../inline-selector-component';
import { colours } from 'lib/colours';
import { precursorNodeStyles } from 'styles/precursor-node-styles';

export const PrecursorNode = (props: {
    node: RiverNode
    selected?: boolean
    deleteNode: () => void
    setNodeType: (type: NodeType) => void
    focusParent: () => void
    innerRef: React.RefObject<any>
    selectNode: () => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(precursorNodeStyles)

    const items = searchableNodeTypes.map(n => {
        return {
            label: n.label,
            value: n.nodeType
        }
    })

    return (
        <div className={styles.node}>
            <div className={styles.nodeLabel}><MoreIcon className={styles.labelIcon} style={{ fill: '#000' }} /></div>
            <div className={styles.nodeInner}>
                <InlineSelector
                    items={items}
                    setValue={(type: NodeType) => props.setNodeType(type)}
                    focusParent={props.focusParent}
                    innerRef={props.innerRef}
                    colour={colours.lightPurple}
                    width={150}
                />
            </div>
        </div>
    )
}