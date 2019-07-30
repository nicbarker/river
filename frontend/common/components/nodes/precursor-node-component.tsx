import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { nodeStyles } from 'styles/node-styles'
import classNames from 'classnames'
import { RiverNode, nodeTypes, NodeType } from 'lib/interpreter'

export const PrecursorNode = (props: {
    node: RiverNode
    selected?: boolean
    deleteNode: () => void
    setNodeType: (type: NodeType) => void
    focusParent: () => void
    innerRef: React.RefObject<any>
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles)
    const [inputValue, setInputValue] = React.useState('')
    const [inputHasFocus, setInputHasFocus] = React.useState(false)

    // On unmount, return focus to parent
    React.useEffect(() => {
        return props.focusParent
    }, [])

    let autoCompleteSuggestions: NodeType[] = nodeTypes
    if (inputValue.length > 0) {
        // If the user has typed in the box, put exact match auto complete at the top, followed by partial match
        const matches = nodeTypes.filter(n => n.substr(0, inputValue.length) === inputValue)
            .concat(nodeTypes.filter(n => n.match(inputValue)))
        // Deduplicate results by creating a set
        autoCompleteSuggestions = Array.from(new Set(matches))
    }

    const onKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Backspace' && inputValue === '') {
            props.deleteNode()
        } else if (event.key === 'Enter' && autoCompleteSuggestions.length > 0) {
            props.setNodeType(autoCompleteSuggestions[0])
        } else if (event.key === 'Escape' && props.innerRef.current) {
            props.innerRef.current.blur()
        }

        if (inputHasFocus) {
            event.stopPropagation()
        }
    }, [autoCompleteSuggestions, inputHasFocus])

    const onInputBlur = () => {
        setInputHasFocus(false)
        props.focusParent()
    }

    const autoCompleteSuggestionsRendered = autoCompleteSuggestions.map((suggestion) => {
        return (
            <div key={suggestion} className={styles.suggestion}>{suggestion}</div>
        )
    })

    let autoCompleteMenu
    if (inputHasFocus) {
        autoCompleteMenu = (
            <div className={styles.autoCompleteSuggestions}>
                {autoCompleteSuggestionsRendered}
            </div>
        )
    }

    const nodeClasses = classNames(styles.node, {
        [styles.selected]: props.selected,
        [styles.autoCompleteVisible]: inputHasFocus
    })

    return (
        <div className={nodeClasses}>
            <input
                className={styles.nodeTypeInput}
                type='text'
                ref={props.innerRef}
                onKeyDown={onKeyDown}
                onFocus={() => setInputHasFocus(true)}
                onBlur={onInputBlur}
                value={inputValue}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
                placeholder={inputHasFocus ? autoCompleteSuggestions[0] : 'Empty Node'}
            />
            {autoCompleteMenu}
        </div>
    )
}