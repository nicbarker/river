import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { VariableNodes, ValueType, searchableValueTypes, TextChain } from 'lib/interpreter'
import { createVariableNodeStyles } from 'styles/create-variable-node-styles'
import { InlineSelector } from 'components/nodes/inline-selector-component'
import TextIcon from 'ionicons/dist/ionicons/svg/ios-text.svg'
import { TextChainInput } from 'containers/text-chain-input-container';
import { colours } from 'lib/colours';

export const CreateVariableNode = (props: {
    node: VariableNodes.Create,
    innerRef: React.RefObject<any>
    focusParent: () => void
    selected?: boolean
    setCreateVariableLabel: (valueType: string) => void
    setCreateVariableValueType: (valueType: ValueType) => void
    setCreateVariableValue: (value: TextChain) => void
    selectNode: () => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(createVariableNodeStyles)
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
        props.setCreateVariableLabel(labelInputContents)
        props.focusParent()
    }

    let labelInput
    if (props.node.valueType) {
        labelInput = (
            <div className={styles.segmentOuter}>
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
            </div>
        )
    }

    let valueInputContainer
    if (props.node.label) {
        valueInputContainer = (
            <div className={styles.segmentOuter}>
                <TextChainInput
                    nodeId={props.node.id}
                    focusParent={props.focusParent}
                    textChain={props.node.value}
                    setTextChain={props.setCreateVariableValue}
                    innerRef={valueInputRef}
                    colour={colours.bruisedPink}
                />
            </div>
        )
    }

    const items = searchableValueTypes.map(type => {
        return {
            value: type.valueType,
            label: type.label,
            icon: TextIcon
        }
    })

    const typeSelector = (
        <InlineSelector
            currentSelection={props.node.valueType ? items.find(t => t.value === props.node.valueType) : undefined}
            items={items}
            setValue={(type: ValueType) => props.setCreateVariableValueType(type)}
            focusParent={() => props.innerRef.current.focus()}
            innerRef={typeInputRef}
            colour={colours.bruisedPink}
            width={120}
        />
    );

    return (
        <div className={styles.node}>
            <div className={styles.nodeLabel}>Variable</div>
            <div className={styles.nodeInner}>
                {typeSelector}
                {labelInput}
                {valueInputContainer}
            </div>
        </div>
    )
}