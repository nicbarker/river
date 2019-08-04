import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { nodeStyles } from 'styles/node-styles'
import classNames from 'classnames'
import { RiverNode, nodeTypes, NodeType } from 'lib/interpreter'
import MoreIcon from 'ionicons/dist/ionicons/svg/ios-more.svg'

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
    const styles = createStylesheet(nodeStyles)
    const [inputValue, setInputValue] = React.useState('')
    const [inputHasFocus, setInputHasFocus] = React.useState(true)

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
        if (event.key === 'Enter' && autoCompleteSuggestions.length > 0) {
            props.setNodeType(autoCompleteSuggestions[0])
        } else if (event.key === 'Escape' && props.innerRef.current) {
            props.innerRef.current.blur()
            props.focusParent()
        }

        if (inputHasFocus) {
            event.stopPropagation()
        }
    }, [autoCompleteSuggestions, inputHasFocus])

    const onInputBlur = () => {
        setInputHasFocus(false)
    }

    const onInputFocus = (event: React.FocusEvent) => {
        // Don't fire multiple focus events up the tree
        event.stopPropagation()
        setInputHasFocus(true)
    }

    const autoCompleteSuggestionsRendered = autoCompleteSuggestions.map((suggestion) => {
        return (
            <div key={suggestion} className={styles.suggestion} onMouseDown={() => props.setNodeType(suggestion)}>{suggestion}</div>
        )
    })

    let autoCompleteMenu
    if (inputHasFocus && autoCompleteSuggestions.length > 0) {
        autoCompleteMenu = (
            <div className={styles.autoCompleteSuggestions}>
                {autoCompleteSuggestionsRendered}
            </div>
        )
    }

    const nodeClasses = classNames(styles.node, {
        [styles.selected]: props.selected,
        [styles.autoCompleteVisible]: inputHasFocus && autoCompleteSuggestions.length > 0
    })

    return (
        <div className={nodeClasses}>
            <div className={styles.nodeLabel}><MoreIcon className={styles.labelIcon} style={{ fill: '#000' }} /></div>
            <div className={styles.autoCompleteOuter}>
                <input
                    className={styles.nodeTypeInput}
                    type='text'
                    ref={props.innerRef}
                    onKeyDown={onKeyDown}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    value={inputValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
                    placeholder={inputHasFocus ? autoCompleteSuggestions[0] : 'Empty Node'}
                />
                {autoCompleteMenu}
            </div>
        </div>
    )
}