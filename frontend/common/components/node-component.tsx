import * as React from 'react';
import { RiverNode } from '../reducers/node-reducer';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';

export const RiverNodeComponent = (props: { node: RiverNode, selected?: boolean }) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles);

    return (
        <div className={styles.node}>
            Node: {props.node.id}{props.selected ? ' (Selected)' : null}
        </div>
    )
}