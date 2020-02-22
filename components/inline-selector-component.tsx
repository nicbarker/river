import * as React from 'react'
import { StylesheetContext } from 'context/stylesheet-context';
import { inlineSelectorStyles } from 'styles/inline-selector-styles';
import * as classNames from 'classnames';
import { TextChainInput } from 'components/nodes/text-chain-input-component';
import { RawTextChain, createRawTextChainFromString, TextBlockObjectType, RawTextBlock } from 'lib/interpreter';
import { InteractionContext } from 'context/interaction-context';
import { useEffect } from 'react';

type Item<T> = {
    label: string
    value: T
    icon?: any
}

type SelectorProps<T> = {
    currentSelection?: Item<T>
    items: Item<T>[]
    value?: T
    colour: string
    width?: number
    placeholder?: string
    nodeId: string
    focusState: number[]
    setValue: (value: T) => void
}

export const InlineSelector = <T, >(props: SelectorProps<T>) => {
    const stylesWithColour = React.useMemo(() => inlineSelectorStyles(props.colour), [props.colour])
    const { createStyles } = React.useContext(StylesheetContext)
    const styles = createStyles(stylesWithColour)

    const [inputValue, setInputValue] = React.useState<RawTextChain>(createRawTextChainFromString(props.currentSelection ? props.currentSelection.label : ''))
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(0)
    const { focusUtil, keyboardUtil } = React.useContext(InteractionContext)
    const [hasFocus, ancestorFocus] = focusUtil.hasFocus(props.focusState)

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
    if (hasFocus) {
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

    // Key bindings
    React.useEffect(() => {
        // If the child input is currently in focus
        if (!hasFocus) { return }

        const arrowUpHandler = () => {
            if (selectedSuggestionIndex > 0) {
                setSelectedSuggestionIndex(selectedSuggestionIndex - 1)
            }
        }

        const arrowDownHandler = () => {
            if (selectedSuggestionIndex < autoCompleteSuggestions.length - 1) {
                setSelectedSuggestionIndex(selectedSuggestionIndex + 1)
            }
        }

        const enterHandler = () =>
            hasFocus && selectedSuggestionIndex < autoCompleteSuggestions.length 
            && setSelectedItem(autoCompleteSuggestions[selectedSuggestionIndex])
        
        keyboardUtil.registerKeyListeners([
            { key: 'ArrowUp', callback: arrowUpHandler },
            { key: 'ArrowDown', callback: arrowDownHandler },
            { key: 'Enter', callback: enterHandler }
        ])

        return () => {
            keyboardUtil.deregisterKeyListeners([enterHandler, arrowUpHandler, arrowDownHandler])
        }
    }, [selectedSuggestionIndex, autoCompleteSuggestions])

    useEffect(() => {
        if (!hasFocus && !props.currentSelection) {
            setInputValue(createRawTextChainFromString(''))
        }
    }, [hasFocus])

    const innerStyles = classNames(styles.autoCompleteInner, {
        [styles.autoCompleteVisible]: hasFocus
    })

    const setInputValueWithBlocks = (message: TextBlockObjectType[]) => {
        setInputValue([message[0] as RawTextBlock])
        setSelectedSuggestionIndex(0)
    }

    return (
        <div className={styles.autoCompleteOuter}>
            <div className={innerStyles}>
                <div style={{ height: '100%', minWidth: props.width, flexShrink: 0 }}>
                    <TextChainInput
                        nodeId={props.nodeId}
                        textChain={inputValue}
                        colour={props.colour}
                        allowVariables={false}
                        placeholder={placeholder}
                        focusState={props.focusState}
                        updateTextChain={setInputValueWithBlocks}
                        saveTextChain={setInputValueWithBlocks}
                    />
                </div>
                {autoCompleteMenu}
            </div>
        </div>
    )
}