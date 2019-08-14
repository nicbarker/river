import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper';
import { typeSelectorStyles } from 'styles/inline-selector-styles';
import classNames = require('classnames');

type Item<T> = {
    label: string
    value: T
    icon?: any
}

type SelectorProps<T> = {
    currentSelection?: Item<T>
    items: Item<T>[]
    setValue: (value: T) => void
    focusParent: () => void
    innerRef: React.RefObject<HTMLInputElement>
    colour: string
    width?: number
}

export const InlineSelector = <T, >(props: SelectorProps<T>) => {
    const stylesWithColour = React.useMemo(() => typeSelectorStyles(props.colour), [props.colour])
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(stylesWithColour)

    const [inputValue, setInputValue] = React.useState(props.currentSelection && props.currentSelection.label as string || '')
    const [inputHasFocus, setInputHasFocus] = React.useState(false)

    let autoCompleteSuggestions = props.items
    if (inputValue.length > 0) {
        // If the user has typed in the box, put exact match auto complete at the top, followed by partial match
        const matches = props.items.filter(t => t.label.toLowerCase().substr(0, inputValue.length) === inputValue.toLowerCase())
            .concat(props.items.filter(t => t.label.toLowerCase().includes(inputValue.toLowerCase())))
        // Deduplicate results by creating a set
        autoCompleteSuggestions = Array.from(new Set(matches))
    }

    const onTypeInputBlur = () => {
        setInputHasFocus(false)
    }

    const onTypeInputFocus = (event: React.FocusEvent) => {
        // Don't fire multiple focus events up the tree
        event.stopPropagation()
        setInputHasFocus(true)
    }

    const autoCompleteSuggestionsRendered = autoCompleteSuggestions.map((suggestion) => {
        let icon
        if (suggestion.icon) {
            icon = <suggestion.icon className={styles.itemIcon} />
        }
        return (
            <div key={suggestion.label} className={styles.suggestion} onMouseDown={() => props.setValue(suggestion.value)}>
                {icon} {suggestion.label}
            </div>
        )
    })

    if (autoCompleteSuggestionsRendered.length === 0) {
        autoCompleteSuggestionsRendered.push(<div key={'none'} className={classNames(styles.suggestion, styles.noMatches)}>No matches.</div>)
    }

    let autoCompleteMenu
    if (inputHasFocus) {
        autoCompleteMenu = (
            <div className={styles.autoCompleteSuggestions}>
                {autoCompleteSuggestionsRendered}
            </div>
        )
    }

    const onTypeInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            setInputValue(autoCompleteSuggestions[0].label)
            props.setValue(autoCompleteSuggestions[0].value)
        } else if (event.key === 'Escape') {
            props.focusParent()
        }

        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.stopPropagation()
        }
    }, [autoCompleteSuggestions])

    const innerStyles = classNames(styles.autoCompleteInner, {
        [styles.autoCompleteVisible]: inputHasFocus
    })

    return (
        <div className={styles.autoCompleteOuter} style={{ width: props.width || 100 }}>
            <div className={innerStyles}>
                <input
                    className={styles.typeInput}
                    type='text'
                    ref={props.innerRef}
                    onKeyDown={onTypeInputKeyDown}
                    onFocus={onTypeInputFocus}
                    onBlur={onTypeInputBlur}
                    value={inputValue}
                    autoFocus={true}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
                    placeholder={'Type'}
                />
                {autoCompleteMenu}
            </div>
        </div>
    )
}