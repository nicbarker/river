import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper';
import { inlineSelectorStyles } from 'styles/inline-selector-styles';
import classNames = require('classnames');
import { TextChainInput } from 'containers/text-chain-input-container';
import { RawTextChain, createRawTextChainFromString, TextBlockObjectType, RawTextBlock } from 'lib/interpreter';

type Item<T> = {
    label: string
    value: T
    icon?: any
}

type SelectorProps<T> = {
    currentSelection?: Item<T>
    items: Item<T>[]
    value?: T
    setValue: (value: T) => void
    focusParent: () => void
    innerRef: React.RefObject<HTMLInputElement>
    colour: string
    width?: number
    placeholder?: string
}

export const InlineSelector = <T, >(props: SelectorProps<T>) => {
    const stylesWithColour = React.useMemo(() => inlineSelectorStyles(props.colour), [props.colour])
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(stylesWithColour)

    const [inputHasFocus, setInputHasFocus] = React.useState(false)
    const [inputValue, setInputValue] = React.useState<RawTextChain>(createRawTextChainFromString(props.currentSelection ? props.currentSelection.label : ''))
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(0)

    const setSelectedItem = (item: Item<T>) => {
        setInputValue(createRawTextChainFromString(item.label))
        props.setValue(item.value)
    }

    let autoCompleteSuggestions = props.items
    const inputValueString = inputValue[0].value
    if (inputValueString.length > 0) {
        // If the user has typed in the box, put exact match auto complete at the top, followed by partial match
        const matches = props.items.filter(t => t.label.toLowerCase().substr(0, inputValueString.length) === inputValueString.toLowerCase())
            .concat(props.items.filter(t => t.label.toLowerCase().includes(inputValueString.toLowerCase())))
        // Deduplicate results by creating a set
        autoCompleteSuggestions = Array.from(new Set(matches))
    }

    const autoCompleteSuggestionsRendered = autoCompleteSuggestions.map((suggestion, index) => {
        let icon
        if (suggestion.icon) {
            icon = <suggestion.icon className={styles.itemIcon} />
        }
        return (
            <div key={suggestion.label}
                className={classNames(styles.suggestion, { [styles.suggestionSelected]: selectedSuggestionIndex === index })}
                onMouseDown={() => setSelectedItem(suggestion)}
            >
                {icon} {suggestion.label}
            </div>
        )
    })

    if (autoCompleteSuggestionsRendered.length === 0) {
        autoCompleteSuggestionsRendered.push(<div key={'none'} className={classNames(styles.suggestion, styles.noMatches)}>No matches.</div>)
    }

    let autoCompleteMenu
    let placeholder
    if (inputHasFocus) {
        autoCompleteMenu = (
            <div className={styles.autoCompleteSuggestions}>
                {autoCompleteSuggestionsRendered}
            </div>
        )
        if (autoCompleteSuggestions.length > 0) {
            if (inputValueString.length === 0) {
                placeholder = autoCompleteSuggestions[selectedSuggestionIndex].label
            } else if (autoCompleteSuggestions[selectedSuggestionIndex].label.toLowerCase().substr(0, inputValueString.length) === inputValueString.toLowerCase()) {
                placeholder = inputValueString + autoCompleteSuggestions[selectedSuggestionIndex].label.substr(inputValueString.length)
            }
        }
    } else {
        placeholder = props.placeholder
    }

    const onInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            setSelectedItem(autoCompleteSuggestions[selectedSuggestionIndex])
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

    const innerStyles = classNames(styles.autoCompleteInner, {
        [styles.autoCompleteVisible]: inputHasFocus
    })

    const setInputValueWithBlocks = (message: TextBlockObjectType[]) => {
        setInputValue([message[0] as RawTextBlock])
        setSelectedSuggestionIndex(0)
    }

    const onBlur = () => {
        setInputHasFocus(false)
        setInputValue(createRawTextChainFromString(props.currentSelection ? props.currentSelection.label : ''))
    }

    return (
        <div className={styles.autoCompleteOuter}>
            <div className={innerStyles} onFocus={() => setInputHasFocus(true)} onBlur={onBlur}>
                <div style={{ height: '100%', minWidth: props.width, flexShrink: 0 }}>
                    <TextChainInput
                        nodeId={'input'}
                        focusParent={props.focusParent}
                        textChain={inputValue}
                        onInputKeyDown={onInputKeyDown}
                        updateTextChain={setInputValueWithBlocks}
                        saveTextChain={setInputValueWithBlocks}
                        innerRef={props.innerRef}
                        colour={props.colour}
                        allowVariables={true}
                        placeholder={placeholder}
                    />
                </div>
                {autoCompleteMenu}
            </div>
        </div>
    )
}