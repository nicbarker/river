import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import classNames = require('classnames');

export const LogNode = (props: {
    innerRef: React.RefObject<any>,
    focusParent: () => void,
    selected?: boolean,
    setLogMessage: (message: string) => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles)
    const [inputValue, setInputValue] = React.useState('')

    const onKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            props.setLogMessage(inputValue)
            props.focusParent()
        } else if (event.key === 'Escape' && props.innerRef.current) {
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
            <div className={styles.nodeLabel}>Log: </div>
            <input
                className={styles.nodeTypeInput}
                type='text'
                ref={props.innerRef}
                onKeyDown={onKeyDown}
                onBlur={props.focusParent}
                value={inputValue}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
                placeholder={'Log Message'}
            />
        </div>
    )
}