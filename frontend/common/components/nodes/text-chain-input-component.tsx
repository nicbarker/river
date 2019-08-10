import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { RiverNode, RawTextBlock, VariableReferenceTextBlock, StorageNodes, TextChain, TextBlockType, ValueType, TextBlockObjectType } from 'lib/interpreter'
import { uuid } from 'lib/uuid';
import { textChainInputStyles } from 'styles/text-chain-input-styles';
import classNames = require('classnames');

const RawTextBlockComponent = (props: {
    textBlock: RawTextBlock
    nodes: { [key: string]: RiverNode }
    styles: {
        suggestion?: string
        autoCompleteSuggestions?: string
        autoCompleteOuter?: string
        input?: string
        hiddenInput?: string
    }
    replaceTextBlock: (newBlock: TextBlockObjectType, insertBefore?: TextBlockObjectType, insertAfter?: TextBlockObjectType) => void
    updateRawTextBlock: (value: string, shouldBlur: boolean) => void
    deleteTextBlock: () => void
    focusPreviousBlock: () => void
    focusNextBlock: () => void
    setInputHasFocus: (hasFocus: boolean) => void
    innerRef: React.RefObject<any>
}) => {
    const inputRef = React.useRef<HTMLInputElement>()
    const inputSizeRef = React.useRef<HTMLDivElement>()
    const [rawTextInputValue, setRawTextInputValue] = React.useState(props.textBlock.value)
    const [inputWidth, setInputWidth] = React.useState(0)
    const [inputHasFocus, setInputHasFocus] = React.useState(true)
    const [currentWordStartIndex, setCurrentWordStartIndex] = React.useState(0)
    const [currentWordEndIndex, setCurrentWordEndIndex] = React.useState(0)
    const innerRef = props.innerRef || inputRef

    React.useEffect(() => {
        const element = innerRef.current
        const resizeObserver = new ResizeObserver((entries: any[]) => {
          const entry = entries[0]
          setInputWidth(entry.contentRect.width)
        })

        resizeObserver.observe(element)
        return () => resizeObserver.unobserve(element)
    }, [innerRef])

    let autoCompleteSuggestions: StorageNodes.Create[] = []

    if (innerRef.current) {
        const firstHalf = rawTextInputValue.slice(0, innerRef.current.selectionStart).split(' ').slice(-1)[0]
        const secondHalf = rawTextInputValue.slice(innerRef.current.selectionStart).split(' ').slice(0)[0]
        const startIndex = innerRef.current.selectionStart - firstHalf.length
        const endIndex = innerRef.current.selectionStart + secondHalf.length
        if (currentWordStartIndex !== startIndex) {
            setCurrentWordStartIndex(startIndex)
        }

        if (currentWordEndIndex !== endIndex) {
            setCurrentWordEndIndex(endIndex)
        }
    }

    const currentWord = rawTextInputValue.slice(currentWordStartIndex, currentWordEndIndex)
    if (currentWord.length > 0) {
        autoCompleteSuggestions = Object.values(props.nodes).filter(
            n => n.nodeType === 'storage_create' && n.label && n.label.toLowerCase().substr(0, currentWord.length) === currentWord.toLowerCase()) as StorageNodes.Create[]
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            if (autoCompleteSuggestions.length > 0) {
                props.replaceTextBlock(
                    { id: uuid(), type: 'variableReference', nodeId: autoCompleteSuggestions[0].id },
                    currentWordStartIndex > 0 ? { id: uuid(), type: 'raw', value: rawTextInputValue.substr(0, currentWordStartIndex) } : undefined,
                    { id: uuid(), type: 'raw', value: rawTextInputValue.substr(currentWordEndIndex) }
                )
            } else {
                props.updateRawTextBlock(rawTextInputValue, true)
            }
        } else if (event.key === 'Backspace' && rawTextInputValue.length === 0) {
            props.deleteTextBlock()
        } else if (event.key === 'ArrowLeft' && innerRef.current.selectionStart === 0) {
            props.focusPreviousBlock()
        } else if (event.key === 'ArrowRight' && innerRef.current.selectionStart === rawTextInputValue.length)
            props.focusNextBlock()
        if (inputHasFocus) {
            event.stopPropagation()
        }
    }

    const autoCompleteSuggestionsRendered = autoCompleteSuggestions.map((suggestion) => {
        return (
            <div key={suggestion.nodeType} className={props.styles.suggestion}>{suggestion.label}</div>
        )
    })

    let autoCompleteMenu
    if (inputHasFocus) {
        autoCompleteMenu = (
            <div className={props.styles.autoCompleteSuggestions}>
                {autoCompleteSuggestionsRendered}
            </div>
        )
    }

    const onInputFocus = () => {
        setInputHasFocus(true)
        props.setInputHasFocus(true)
    }

    const onInputBlur = () => {
        setInputHasFocus(false)
        props.updateRawTextBlock(rawTextInputValue, false)
        props.setInputHasFocus(false)
    }

    return (
        <div className={props.styles.autoCompleteOuter}>
            <div ref={inputSizeRef} className={props.styles.input}>{rawTextInputValue}</div>
            <input
                style={{ width: inputSizeRef.current && inputSizeRef.current.scrollWidth + 20}}
                type='text'
                className={props.styles.hiddenInput}
                autoFocus={true}
                value={rawTextInputValue}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                ref={innerRef}
                onKeyDown={onKeyDown}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRawTextInputValue(event.target.value)}
            />
            {autoCompleteMenu}
        </div>
    )
}

const VariableReferenceBlockComponent = (props: {
    textBlock: VariableReferenceTextBlock
    referencedNode?: StorageNodes.Create
    setInputHasFocus: (focus: boolean) => void
    deleteTextBlock: () => void
    focusPreviousBlock: () => void
    focusNextBlock: () => void
    innerRef: React.RefObject<any>
    styles: any
}) => {
    const [hasFocus, setHasFocus] = React.useState(false)

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (hasFocus) {
            if (event.key === 'Backspace') {
                props.deleteTextBlock()
                event.stopPropagation()
                event.preventDefault()
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.key === 'ArrowLeft' ? props.focusPreviousBlock() : props.focusNextBlock()
            }
        }
    }

    const onFocus = () => {
        setHasFocus(true)
        props.setInputHasFocus(true)
    }

    return (
        <div className={props.styles.variable} onFocus={onFocus} tabIndex={-1} onKeyDown={onKeyDown} ref={props.innerRef}>
            {props.referencedNode.label}
        </div>
    )
}

export type TextChainInputProps = {
    textChain: TextChain
    innerRef: React.RefObject<any>
    focusParent: () => void
    setTextChain: (message: TextChain) => void
    nodes: { [key: string]: RiverNode }
    colour: string
}

export const TextChainInput = (props: TextChainInputProps) => {
    const stylesWithColour = React.useMemo(() => textChainInputStyles(props.colour), [props.colour])
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(stylesWithColour)
    const [innerInputHasFocus, setInnerInputHasFocus] = React.useState(false)
    const [blockIndexWithFocus, setBlockIndexWithFocus] = React.useState(0)
    const [preferredCursorPosition, setPreferredCursorPosition] = React.useState(0)

    React.useEffect(() => {
        props.innerRef.current.focus()
        props.innerRef.current.selectionStart = preferredCursorPosition
        props.innerRef.current.selectionEnd = preferredCursorPosition
    }, [blockIndexWithFocus])

    const mergeAdjacentRawTextBlocks = (textChain: TextChain) => {
        let newTextChain = textChain
        for (let i = 0; i < newTextChain.length - 1; i++) {
            const blockOne = newTextChain[i]
            const blockTwo = newTextChain[i + 1]
            if (blockOne.type === 'raw' && blockTwo.type === 'raw') {
                const merged = blockOne.value + blockTwo.value
                newTextChain = newTextChain.slice(0, i).concat([{ id: uuid(), type: 'raw', value: merged }]).concat(newTextChain.slice(i + 2))
                setPreferredCursorPosition(blockOne.value.length)
                i--
            }
        }
        return newTextChain
    }

    const replaceTextBlockAtIndex = (index: number, newBlock: TextBlockObjectType, insertBefore?: TextBlockObjectType, insertAfter?: TextBlockObjectType) => {
        const newBlocks = [insertBefore, newBlock, insertAfter].filter(b => !!b)
        const newTextChain = props.textChain.slice(0, index).concat(newBlocks).concat(props.textChain.slice(index + 1))
        setBlockIndexWithFocus(index + newBlocks.length - 1)
        setPreferredCursorPosition(0)
        props.setTextChain(newTextChain)
    }

    const updateRawTextBlockAtIndex = (index: number, value: string, shouldBlur: boolean) => {
        const newBlock = {...props.textChain[index], ...{ value }}
        const newTextChain = props.textChain.slice(0, index).concat([newBlock]).concat(props.textChain.slice(index + 1))
        props.setTextChain(newTextChain)
        if (shouldBlur) {
            props.focusParent()
        }
    }

    const deleteTextBlockAtIndex = (index: number) => {
        const newTextChain = props.textChain.slice(0, index).concat(props.textChain.slice(index + 1))
        setBlockIndexWithFocus(Math.max(index - 1, 0))
        props.setTextChain(mergeAdjacentRawTextBlocks(newTextChain))
    }

    const focusBlockAtIndex = (index: number, next: boolean) => {
        const node = props.textChain[index]
        if (next) {
            setPreferredCursorPosition(0)
        } else if (!next && node.type === 'raw') {
            setPreferredCursorPosition(node.value.length)
        }
        setBlockIndexWithFocus(index)
    }

    let textBlocks = []
    if (props.textChain) {
        for (let i = 0; i < props.textChain.length; i++) {
            const block = props.textChain[i]
            if (block.type === 'raw') {
                textBlocks.push(<RawTextBlockComponent
                    key={block.id}
                    textBlock={block}
                    nodes={props.nodes}
                    styles={styles}
                    replaceTextBlock={replaceTextBlockAtIndex.bind(null, i)}
                    updateRawTextBlock={updateRawTextBlockAtIndex.bind(null, i)}
                    deleteTextBlock={deleteTextBlockAtIndex.bind(null, i)}
                    focusPreviousBlock={i > 0 ? focusBlockAtIndex.bind(null, i - 1, false) : () => void 0}
                    focusNextBlock={i < props.textChain.length - 1 ? focusBlockAtIndex.bind(null, i + 1, true) : () => void 0}
                    setInputHasFocus={setInnerInputHasFocus}
                    innerRef={i === blockIndexWithFocus ? props.innerRef : null}
                />)
            } else if (block.type === 'variableReference') {
                textBlocks.push(<VariableReferenceBlockComponent
                    key={block.id}
                    textBlock={block}
                    referencedNode={props.nodes[block.nodeId] as StorageNodes.Create}
                    setInputHasFocus={setInnerInputHasFocus}
                    deleteTextBlock={deleteTextBlockAtIndex.bind(null, i)}
                    focusPreviousBlock={i > 0 ? focusBlockAtIndex.bind(null, i - 1, false) : () => void 0}
                    focusNextBlock={i < props.textChain.length - 1 ? focusBlockAtIndex.bind(null, i + 1, true) : () => void 0}
                    styles={styles}
                    innerRef={i === blockIndexWithFocus ? props.innerRef : null}
                />)
            }
        }
    }

    const textChainClasses = classNames(styles.textChainInputOuter, {
        [styles.textChainHasFocus]: innerInputHasFocus
    })

    return (
        <div className={textChainClasses}>
            {textBlocks}
        </div>
    )
}