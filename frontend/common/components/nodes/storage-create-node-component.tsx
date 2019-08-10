import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { StorageNodes, ValueType, searchableValueTypes, TextChain } from 'lib/interpreter'
import { storageCreateNodeStyles } from 'styles/storage-create-node-styles'
import { InlineSelector } from 'components/nodes/inline-selector-component'
import TextIcon from 'ionicons/dist/ionicons/svg/ios-text.svg'
import { TextChainInput } from 'containers/text-chain-input-container';
import { colours } from 'lib/colours';

export const StorageCreateNode = (props: {
    node: StorageNodes.Create,
    innerRef: React.RefObject<any>
    focusParent: () => void
    selected?: boolean
    setStorageCreateLabel: (valueType: string) => void
    setStorageCreateValueType: (valueType: ValueType) => void
    setStorageCreateValue: (value: TextChain) => void
    selectNode: () => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(storageCreateNodeStyles)
    const [labelInputContents, setLabelInputContents] = React.useState(props.node.label || '')

    const typeInputRef = React.useRef<HTMLInputElement>()
    const valueInputRef = React.useRef<HTMLInputElement>()

    const onLabelInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === 'Escape') {
            props.innerRef.current.blur()
        }

        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.stopPropagation()
        }
    }, [labelInputContents])

    const onLabelInputBlur = () => {
        props.setStorageCreateLabel(labelInputContents)
        props.focusParent()
    }

    let typeSelector
    if (props.node.label) {
        const items = searchableValueTypes.map(type => {
            return {
                value: type.valueType,
                label: type.label,
                icon: TextIcon
            }
        })
        typeSelector = (
            <div className={styles.segmentOuter}>
                <InlineSelector
                    currentSelection={props.node.valueType ? items.find(t => t.value === props.node.valueType) : undefined}
                    items={items}
                    setValue={(type: ValueType) => props.setStorageCreateValueType(type)}
                    focusParent={() => props.innerRef.current.focus()}
                    innerRef={typeInputRef}
                    colour={colours.bruisedPink}
                />
            </div>
        );
    }

    let valueInputContainer
    if (props.node.valueType) {
        valueInputContainer = (
            <div className={styles.segmentOuter}>
                <TextChainInput
                    focusParent={props.focusParent}
                    textChain={props.node.value}
                    setTextChain={props.setStorageCreateValue}
                    innerRef={valueInputRef}
                    colour={colours.bruisedPink}
                />
            </div>
        )
    }

    return (
        <div className={styles.node}>
            <div className={styles.nodeLabel}>Variable</div>
            <div className={styles.nodeInner}>
                <input
                    className={styles.genericInput}
                    type='text'
                    ref={props.innerRef}
                    autoFocus={true}
                    onKeyDown={onLabelInputKeyDown}
                    onBlur={onLabelInputBlur}
                    value={labelInputContents}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLabelInputContents(event.target.value)}
                    placeholder={'Label'}
                />
                {typeSelector}
                {valueInputContainer}
            </div>
        </div>
    )
}