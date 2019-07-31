import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import classNames = require('classnames');
import { LogNode as LogNodeType } from 'lib/interpreter';

export const LogNode = (props: {
    node: LogNodeType
    innerRef: React.RefObject<any>
    focusParent: () => void
    selected?: boolean
    setLogMessage: (message: string) => void
    selectNode: () => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles)
    const [inputValue, setInputValue] = React.useState(props.node.message || '')

    // On unmount, return focus to parent
    React.useEffect(() => {
        return props.focusParent
    }, [])

    const onKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            props.setLogMessage(inputValue)
            props.focusParent()
        } else if (event.key === 'Escape') {
            props.focusParent()
        }

        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.stopPropagation()
        }
    }, [inputValue])


    const nodeClasses = classNames(styles.node, {
        [styles.selected]: props.selected
    })

    return (
        <div className={nodeClasses}>
            <div className={styles.nodeLabel}>Write Message: </div>
            <input
                className={styles.nodeTypeInput}
                type='text'
                ref={props.innerRef}
                onKeyDown={onKeyDown}
                value={inputValue}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
                placeholder={'Log Message'}
            />
        </div>
    )
}