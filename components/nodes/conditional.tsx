import { useContext, useEffect, useState } from "react"
import { StylesheetContext } from "context/stylesheet-context"
import { nodeStyles as nodeClasses } from "styles/node-styles"
import HelpIcon from 'ionicons/dist/ionicons/svg/md-help-circle-outline.svg'
import * as classNames from 'classnames'
import { RiverNode, searchableConditionalTypes, ConditionalType, createRawTextChainFromString, RawTextBlock } from "lib/interpreter"
import { InlineSelector } from "components/inline-selector-component"
import { colours } from "lib/colours"
import * as Color from 'color'
import { conditionalStyles } from 'styles/conditional-styles'
import { InteractionContext } from "context/interaction-context"
import { TextChainInput } from "./text-chain-input-component"
import { StoreContext } from "context/store-context"

export const Conditional = (props: {
    node: RiverNode,
    focusState: number[]
}) => {
    const { createStyles } = useContext(StylesheetContext)
    const nodeStyles = createStyles(nodeClasses)
    const styles = createStyles(conditionalStyles)

    const { dispatch } = useContext(StoreContext)
    const { currentFocus, focusUtil, keyboardUtil } = useContext(InteractionContext)
    const [hasFocus, ancestorFocus] = focusUtil.hasFocus(props.focusState)
    const [leftSideInputContents, setLeftSideInputContents] = 
        useState((props.node.conditional.conditionalType !== 'EmptyConditional' && props.node.conditional.leftSide || createRawTextChainFromString('')))
    const [rightSideInputContents, setRightSideInputContents] = 
        useState((props.node.conditional.conditionalType !== 'EmptyConditional' && props.node.conditional.rightSide || createRawTextChainFromString('')))

    // Register keyboard handling
    useEffect(() => {
        if (!ancestorFocus) { return }
        const tabKeyHandler = () => {
            if (currentFocus[currentFocus.length - 1] === 0) {
                focusUtil.incrementCurrentFocus(1)
            } else if (currentFocus[currentFocus.length - 1] === 1) {
                focusUtil.setCurrentFocus([...currentFocus.slice(0, currentFocus.length - 1), 0])
            }
        }
        keyboardUtil.registerKeyListeners([{ key: 'Tab', callback: tabKeyHandler }])

        return () => {
            keyboardUtil.deregisterKeyListeners([tabKeyHandler])
        }
    }, [ancestorFocus, currentFocus, focusUtil.incrementCurrentFocus])

    let content: React.ReactNode
    if (props.node.conditional?.conditionalType === 'EmptyConditional') {
        const items = searchableConditionalTypes.map(c => {
            return {
                label: c.label,
                value: c.conditionalType
            }
        })

        content = <InlineSelector
            nodeId={props.node.id}
            items={items}
            setValue={(type: ConditionalType) => {
                focusUtil.setCurrentFocus([...props.focusState, 0])
                dispatch({ type: 'SET_CONDITIONAL_TYPE', payload: { nodeId: props.node.id, type } })
            }}
            colour={colours.greyYellow}
            width={150}
            focusState={[...props.focusState, 0]}
        />
    } else if (props.node.conditional.conditionalType === 'EqualsConditional' || props.node.conditional.conditionalType === 'NotEqualsConditional') {
        let leftSidePlaceholder
        if (leftSideInputContents.length === 1 &&
            (leftSideInputContents[0].textBlockType !== 'RawTextBlock' || (leftSideInputContents[0] as RawTextBlock).value.length === 0)) {
            leftSidePlaceholder = 'Value'
        }
        let rightSidePlaceholder
        if (rightSideInputContents.length === 1 &&
            (rightSideInputContents[0].textBlockType !== 'RawTextBlock' || (rightSideInputContents[0] as RawTextBlock).value.length === 0)) {
            rightSidePlaceholder = 'Value'
        }
        const getOperator = () => {
            switch (props.node.conditional.conditionalType) {
                case 'EqualsConditional': return '='
                case 'NotEqualsConditional': return '!='
            }
        }
        content = (
            <>
                <div>
                    <TextChainInput
                        nodeId={props.node.id}
                        textChain={leftSideInputContents}
                        updateTextChain={setLeftSideInputContents}
                        saveTextChain={(leftSide) => {
                            dispatch({ type: 'SET_CONDITIONAL_LEFT_SIDE', payload: { nodeId: props.node.id, leftSide  } })
                            focusUtil.incrementCurrentFocus(1)
                        }}
                        colour={colours.greyYellow}
                        placeholder={leftSidePlaceholder}
                        allowVariables={true}
                        focusState={[...props.focusState, 0]}
                    />
                </div>
                <div className={styles.operator}>
                    {getOperator()}
                </div>
                <div>
                    <TextChainInput
                        nodeId={props.node.id}
                        textChain={rightSideInputContents}
                        updateTextChain={setRightSideInputContents}
                        saveTextChain={(rightSide) => {
                            dispatch({ type: 'SET_CONDITIONAL_RIGHT_SIDE', payload: { nodeId: props.node.id, rightSide  } })
                        }}
                        colour={colours.greyYellow}
                        placeholder={rightSidePlaceholder}
                        allowVariables={true}
                        focusState={[...props.focusState, 1]}
                    />
                </div>
            </>
        )
    }
    
    return (
        <div className={classNames(nodeStyles.subNode, { [nodeStyles.subNodeSelected]: ancestorFocus })}>
            <div className={classNames(nodeStyles.node, styles.conditionalNode)}>
                <div className={nodeStyles.nodeLabel} style={{ background: Color(colours.greyYellow).darken(0.15).hex() }}>
                    <HelpIcon className={nodeStyles.labelIcon} style={{ fill: '#000' }} />
                </div>
                <div className={styles.connector} />
                <div className={nodeStyles.nodeInner}>
                    {content}
                </div>
            </div>
        </div>
    )
}