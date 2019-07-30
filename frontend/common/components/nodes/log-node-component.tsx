import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import classNames = require('classnames');

export const LogNode = (props: {
    selected?: boolean
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles)

    const nodeClasses = classNames(styles.node, {
        [styles.selected]: props.selected
    })

    return (
        <div className={nodeClasses}>
            <div className={styles.nodeInner}>Log Node</div>
        </div>
    )
}