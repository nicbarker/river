import * as React from 'react'
import { StylesheetContext } from 'context/stylesheet-context'
import { VariableNodes, ValueType, searchableValueTypes, TextChain, createRawTextChainFromString, TextBlockObjectType, RawTextBlock } from 'lib/interpreter'
import { createVariableNodeStyles } from 'styles/create-variable-node-styles'
import { InlineSelector } from 'components/inline-selector-component'
import { TextChainInput } from 'components/nodes/text-chain-input-component';
import { colours } from 'lib/colours';
import { useEffect, useContext, useState } from 'react'
import { InteractionContext } from 'context/interaction-context'

export const CreateVariableNode = (props: {
    node: VariableNodes.Create
    innerRef: React.RefObject<any>
    selected?: boolean
    setCreateVariableLabel: (valueType: string) => void
    setCreateVariableValueType: (valueType: ValueType) => void
    setCreateVariableValue: (value: TextChain) => void
    selectNode: () => void
    focusState: number[]
}) => {
    const { createStyles } = useContext(StylesheetContext)
    const styles = createStyles(createVariableNodeStyles)
    const [labelInputContents, setLabelInputContents] = useState(props.node.label || '')
    
    const { currentFocus, focusUtil, keyboardUtil } = React.useContext(InteractionContext)
    const [hasFocus, ancestorFocus] = focusUtil.hasFocus(props.focusState)
    // Register keyboard handling
    useEffect(() => {
        if (!ancestorFocus) { return }
        const tabKeyHandler = () => {
            if (currentFocus[currentFocus.length - 1] === 0 && props.node.valueType) {
                focusUtil.incrementCurrentFocus(1)
            } else if (currentFocus[currentFocus.length - 1] === 1 && props.node.label) {
                focusUtil.incrementCurrentFocus(1)
            } else {
                focusUtil.setCurrentFocus([...currentFocus.slice(0, currentFocus.length - 1), 0])
            }
        }
        keyboardUtil.registerKeyListeners([{ key: 'Tab', callback: tabKeyHandler }])

        return () => {
            keyboardUtil.deregisterKeyListeners([tabKeyHandler])
        }
    }, [ancestorFocus, currentFocus, focusUtil.incrementCurrentFocus])

    // Focus first input on mount
    useEffect(() => {
        focusUtil.setCurrentFocus([...props.focusState, 0])
    }, [])

    const items = searchableValueTypes.map(type => {
        return {
            value: type.valueType,
            label: type.label,
            icon: () => <span className={styles.typeIcon}>Aa</span>
        }
    })

    const currentType = props.node.valueType ? items.find(t => t.value === props.node.valueType) : undefined
    const typeSelector = (
        <InlineSelector
            currentSelection={currentType}
            items={items}
            setValue={(type: ValueType) => {
                props.setCreateVariableValueType(type)
                focusUtil.incrementCurrentFocus(1)
            }}
            colour={colours.bruisedPink}
            placeholder={currentType ? null: 'Type'}
            width={120}
            nodeId={props.node.id}
            focusState={[...props.focusState, 0]}
        />
    );

    let labelInput
    const updateLabel = (message: TextBlockObjectType[]) => setLabelInputContents((message[0] as RawTextBlock).value)
    const saveLabel = (message: TextBlockObjectType[]) => props.setCreateVariableLabel((message[0] as RawTextBlock).value)
    if (props.node.valueType) {
        const labelPlaceholder = labelInputContents.length === 0 ? 'Label' : null
        labelInput = (
            <div className={styles.segmentOuter}>
                <TextChainInput
                    nodeId={props.node.id}
                    textChain={createRawTextChainFromString(labelInputContents || '')}
                    updateTextChain={updateLabel}
                    saveTextChain={(textChain) => {
                        saveLabel(textChain)
                        focusUtil.incrementCurrentFocus(1)
                    }}
                    colour={colours.bruisedPink}
                    placeholder={labelPlaceholder}
                    allowVariables={false}
                    focusState={[...props.focusState, 1]}
                />
            </div>
        )
    }

    let valueInputContainer
    if (props.node.label) {
        let valuePlaceholder
        if (props.node.value.length === 1 &&
            (props.node.value[0].textBlockType !== 'RawTextBlock' || (props.node.value[0] as RawTextBlock).value.length === 0)) {
            valuePlaceholder = 'Value'
        }
        valueInputContainer = (
            <div className={styles.segmentOuter}>
                <TextChainInput
                    nodeId={props.node.id}
                    textChain={props.node.value}
                    updateTextChain={props.setCreateVariableValue}
                    saveTextChain={props.setCreateVariableValue}
                    allowVariables={true}
                    placeholder={valuePlaceholder}
                    colour={colours.bruisedPink}
                    focusState={[...props.focusState, 2]}
                />
            </div>
        )
    }

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