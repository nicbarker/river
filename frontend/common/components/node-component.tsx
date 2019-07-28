import * as React from 'react';
import { RiverNode } from '../reducers/node-reducer';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import classNames from 'classnames'

export const RiverNodeComponent = (props: {
    node: RiverNode,
    selected?: boolean,
    onClick: () => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles);

    return (
        <div className={classNames(styles.node, { [styles.selected] : props.selected })} onClick={props.onClick}>
            Node: {props.node.id}
        </div>
    )
}