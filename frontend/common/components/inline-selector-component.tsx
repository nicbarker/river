import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper';
import { inlineSelectorStyles } from 'styles/inline-selector-styles';
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
    const stylesWithColour = React.useMemo(() => inlineSelectorStyles(props.colour), [props.colour])
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(stylesWithColour)

    const [inputValue, setInputValue] = React.useState(props.currentSelection && props.currentSelection.label as string || '')
    const [inputHasFocus, setInputHasFocus] = React.useState(false)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(0)

    let autoCompleteSuggestions = props.items
    if (inputValue.length > 0) {
        // If the user has typed in the box, put exact match auto complete at the top, followed by partial match
        const matches = props.items.filter(t => t.label.toLowerCase().substr(0, inputValue.length) === inputValue.toLowerCase())
            .concat(props.items.filter(t => t.label.toLowerCase().includes(inputValue.toLowerCase())))
        // Deduplicate results by creating a set
        autoCompleteSuggestions = Array.from(new Set(matches))
    }

    const onInputBlur = () => {
        setInputHasFocus(false)
    }

    const onInputFocus = (event: React.FocusEvent) => {
        // Don't fire multiple focus events up the tree
        event.stopPropagation()
        setInputHasFocus(true)
    }

    const autoCompleteSuggestionsRendered = autoCompleteSuggestions.map((suggestion, index) => {
        let icon
        if (suggestion.icon) {
            icon = <suggestion.icon className={styles.itemIcon} />
        }
        return (
            <div key={suggestion.label} className={classNames(styles.suggestion, { [styles.suggestionSelected]: selectedSuggestionIndex === index })} onMouseDown={() => props.setValue(suggestion.value)}>
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

    const onInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            setInputValue(autoCompleteSuggestions[selectedSuggestionIndex].label)
            props.setValue(autoCompleteSuggestions[selectedSuggestionIndex].value)
        } else if (event.key === 'Escape') {
            props.focusParent()
        } else if (event.key === 'ArrowUp') {
            if (selectedSuggestionIndex > 0) {
                setSelectedSuggestionIndex(selectedSuggestionIndex - 1)
            }
        } else if (event.key === 'ArrowDown') {
            if (selectedSuggestionIndex < props.items.length - 1) {
                setSelectedSuggestionIndex(selectedSuggestionIndex + 1)
            }
        }

        event.stopPropagation()
    }, [autoCompleteSuggestions, selectedSuggestionIndex])

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
        setSelectedSuggestionIndex(0)
    }

    const innerStyles = classNames(styles.autoCompleteInner, {
        [styles.autoCompleteVisible]: inputHasFocus
    })

    return (
        <div className={styles.autoCompleteOuter} style={{ width: props.width || 100 }}>
            <div className={innerStyles}>
                <input
                    className={styles.input}
                    type='text'
                    ref={props.innerRef}
                    onKeyDown={onInputKeyDown}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    value={inputValue}
                    autoFocus={true}
                    onChange={onInputChange}
                    placeholder={'Type'}
                />
                {autoCompleteMenu}
            </div>
        </div>
    )
}