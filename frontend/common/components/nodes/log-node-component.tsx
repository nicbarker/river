import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
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

    const onKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            props.setLogMessage(inputValue)
            props.focusParent()
        } else if (event.key === 'Escape') {
            setInputValue(props.node.message || '')
            props.focusParent()
        }

        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.stopPropagation()
        }
    }, [inputValue, props.node.message])

    return (
        <div className={styles.node}>
            <div className={styles.nodeLabel}>Log</div>
            <div className={styles.autoCompleteOuter}>
                <input
                    className={styles.nodeTypeInput}
                    type='text'
                    ref={props.innerRef}
                    onKeyDown={onKeyDown}
                    value={inputValue}
                    autoFocus={true}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
                    placeholder={'Log Message'}
                />
            </div>
        </div>
    )
}