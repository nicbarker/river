import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { VariableNodes, ValueType, searchableValueTypes, TextChain, createRawTextChainFromString, TextBlockObjectType, RawTextBlock } from 'lib/interpreter'
import { createVariableNodeStyles } from 'styles/create-variable-node-styles'
import { InlineSelector } from 'components/inline-selector-component'
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
    const labelInputRef = React.useRef<HTMLInputElement>()
    const valueInputRef = React.useRef<HTMLInputElement>()

    let labelInput
    const updateLabel = (message: TextBlockObjectType[]) => setLabelInputContents((message[0] as RawTextBlock).value)
    const saveLabel = (message: TextBlockObjectType[]) => props.setCreateVariableLabel((message[0] as RawTextBlock).value)
    if (props.node.valueType) {
        const labelPlaceholder = labelInputContents.length === 0 ? 'Label' : null
        labelInput = (
            <div className={styles.segmentOuter}>
                <TextChainInput
                    nodeId={props.node.id}
                    focusParent={props.focusParent}
                    textChain={createRawTextChainFromString(labelInputContents || '')}
                    updateTextChain={updateLabel}
                    saveTextChain={saveLabel}
                    innerRef={labelInputRef}
                    colour={colours.bruisedPink}
                    placeholder={labelPlaceholder}
                />
            </div>
        )
    }

    let valueInputContainer
    if (props.node.label) {
        let valuePlaceholder
        if (props.node.value.length === 1 &&
            (props.node.value[0].type !== 'raw' || (props.node.value[0] as RawTextBlock).value.length === 0)) {
            valuePlaceholder = 'Value'
        }
        valueInputContainer = (
            <div className={styles.segmentOuter}>
                <TextChainInput
                    nodeId={props.node.id}
                    focusParent={props.focusParent}
                    textChain={props.node.value}
                    updateTextChain={props.setCreateVariableValue}
                    saveTextChain={props.setCreateVariableValue}
                    allowVariables={true}
                    placeholder={valuePlaceholder}
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

    const currentType = props.node.valueType ? items.find(t => t.value === props.node.valueType) : undefined
    const typeSelector = (
        <InlineSelector
            currentSelection={currentType}
            items={items}
            setValue={(type: ValueType) => props.setCreateVariableValueType(type)}
            focusParent={props.focusParent}
            innerRef={typeInputRef}
            colour={colours.bruisedPink}
            placeholder={currentType ? null: 'Type'}
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