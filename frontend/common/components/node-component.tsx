import * as React from 'react';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import classNames from 'classnames'
import { RiverNode } from 'lib/interpreter';
import { Layer } from 'reducers/application-reducer';

export const RiverNodeComponent = (props: {
    node: RiverNode,
    selected?: boolean,
    activeLayer: Layer,
    onClick: () => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles);

    let cursor
    if (props.activeLayer === 'logs' && props.selected) {
        cursor = <div className={styles.logCursor} />
    }

    return (
        <div className={styles.nodeOuter}>
            {cursor}
            <div className={classNames(styles.node, { [styles.selected] : props.selected && props.activeLayer === 'editor' })} onClick={props.onClick}>
                Node: {props.node.id.substr(0, 8)}
            </div>
        </div>
    )
}