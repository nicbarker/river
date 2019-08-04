import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper';
import { StorageNodes, ValueType, searchableValueTypes } from 'lib/interpreter';
import { storageCreateNodeStyles } from 'styles/storage-create-node-styles';
import TextIcon from 'ionicons/dist/ionicons/svg/ios-text.svg'

export const StorageCreateNode = (props: {
    node: StorageNodes.Create,
    innerRef: React.RefObject<any>
    focusParent: () => void
    selected?: boolean
    setStorageCreateLabel: (valueType: string) => void
    setStorageCreateValueType: (valueType: ValueType) => void
    setStorageCreateValue: (value: string) => void
    selectNode: () => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(storageCreateNodeStyles)
    const [labelInputContents, setLabelInputContents] = React.useState(props.node.label || '')
    const [valueTypeInputContents, setValueTypeInputContents] = React.useState(props.node.valueType || '')
    const [valueTypeInputHasFocus, setValueTypeInputHasFocus] = React.useState(false)
    const [valueInputContents, setValueInputContents] = React.useState(props.node.value || '')

    let autoCompleteSuggestions = searchableValueTypes
    if (valueTypeInputContents.length > 0) {
        // If the user has typed in the box, put exact match auto complete at the top, followed by partial match
        const matches = searchableValueTypes.filter(t => t.label.toLowerCase().substr(0, valueTypeInputContents.length) === valueTypeInputContents.toLowerCase())
            .concat(searchableValueTypes.filter(t => t.label.toLowerCase().match(valueTypeInputContents.toLowerCase())))
        // Deduplicate results by creating a set
        autoCompleteSuggestions = Array.from(new Set(matches))
    }

    const onLabelInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            props.setStorageCreateLabel(labelInputContents)
            props.focusParent()
        } else if (event.key === 'Escape') {
            props.focusParent()
        }

        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.stopPropagation()
        }
    }, [labelInputContents])

    const onValueTypeInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            setValueTypeInputContents(autoCompleteSuggestions[0].label)
            props.setStorageCreateValueType(autoCompleteSuggestions[0].valueType)
            props.focusParent()
        } else if (event.key === 'Escape') {
            props.focusParent()
        }

        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.stopPropagation()
        }
    }, [autoCompleteSuggestions])

    const onValueInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            props.setStorageCreateValue(valueInputContents)
            props.focusParent()
        } else if (event.key === 'Escape') {
            props.focusParent()
        }

        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.stopPropagation()
        }
    }, [valueInputContents])

    const autoCompleteSuggestionsRendered = autoCompleteSuggestions.map((suggestion) => {
        return (
            <div key={suggestion.valueType} className={styles.suggestion} onMouseDown={() => props.setStorageCreateValueType(suggestion.valueType)}>
                <TextIcon className={styles.typeIcon} style={{ fill: '#000' }} />{suggestion.label}
            </div>
        )
    })

    if (autoCompleteSuggestionsRendered.length === 0) {
        autoCompleteSuggestionsRendered.push(<div className={styles.suggestion}>No matching results.</div>)
    }

    let autoCompleteMenu
    if (valueTypeInputHasFocus) {
        autoCompleteMenu = (
            <div className={styles.autoCompleteSuggestions}>
                {autoCompleteSuggestionsRendered}
            </div>
        )
    }

    const onValueTypeInputBlur = () => {
        setValueTypeInputHasFocus(false)
    }

    const onValueTypeInputFocus = (event: React.FocusEvent) => {
        // Don't fire multiple focus events up the tree
        event.stopPropagation()
        setValueTypeInputHasFocus(true)
    }

    let valueTypeContainer
    if (props.node.label) {
        valueTypeContainer = (
            <div className={styles.autoCompleteOuter}>
                <input
                    className={styles.valueTypeInput}
                    type='text'
                    ref={props.innerRef}
                    onKeyDown={onValueTypeInputKeyDown}
                    onFocus={onValueTypeInputFocus}
                    onBlur={onValueTypeInputBlur}
                    value={valueTypeInputContents}
                    autoFocus={true}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValueTypeInputContents(event.target.value)}
                    placeholder={'Type'}
                />
                {autoCompleteMenu}
            </div>
        )
    }

    let valueInputContainer
    if (props.node.valueType) {
        valueInputContainer = (
            <div>
                <input
                    className={styles.nodeTypeInput}
                    type='text'
                    ref={props.innerRef}
                    autoFocus={true}
                    onKeyDown={onValueInputKeyDown}
                    onBlur={() => props.node.value !== valueInputContents && props.setStorageCreateValue(valueInputContents)}
                    value={valueInputContents}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValueInputContents(event.target.value)}
                    placeholder={'Value'}
                />
            </div>
        )
    }

    return (
        <div className={styles.node}>
            <div className={styles.nodeLabel}>Variable</div>
            <div>
                <input
                    className={styles.nodeTypeInput}
                    type='text'
                    ref={props.innerRef}
                    autoFocus={true}
                    onKeyDown={onLabelInputKeyDown}
                    value={labelInputContents}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLabelInputContents(event.target.value)}
                    placeholder={'Label'}
                />
            </div>
            {valueTypeContainer}
            {valueInputContainer}
        </div>
    )
}