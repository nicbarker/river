import * as React from 'react'
import { StylesheetContext } from 'context/stylesheet-context'
import { VariableNodes, TextChain, TextBlockObjectType } from 'lib/interpreter'
import { uuid } from 'lib/uuid'
import { textChainInputStyles } from 'styles/text-chain-input-styles'
import * as classNames from 'classnames'
import { StoreContext } from 'context/store-context'
import { InteractionContext } from 'context/interaction-context'

export type TextChainInputProps = {
    nodeId: string
    textChain: TextChain
    allowVariables?: boolean
    placeholder?: string
    colour: string
    focusState: number[]
    updateTextChain: (message: TextChain) => void
    saveTextChain: (message: TextChain) => void
}

export const TextChainInput = (props: TextChainInputProps) => {
    const { state } = React.useContext(StoreContext)
    const stylesWithColour = React.useMemo(() => textChainInputStyles(props.colour), [props.colour])
    const { createStyles } = React.useContext(StylesheetContext)
    const styles = createStyles(stylesWithColour)
    const inputRef = React.useRef<HTMLInputElement>()

    const { currentFocus, focusUtil, keyboardUtil } = React.useContext(InteractionContext)
    const [hasFocus, ancestorFocus] = focusUtil.hasFocus(props.focusState)

    React.useEffect(() => {
        hasFocus && inputRef.current.focus()
    }, [hasFocus])

    const [hiddenInputValue, setHiddenInputValue] = React.useState('')
    const [cursorPositionBeforeEditing, setCursorPositionBeforeEditing] = React.useState(0)
    const [internalCursorStartPosition, setInternalCursorStartPosition] = React.useState(0)
    const [cursorEndPosition, setCursorEndPosition] = React.useState(0)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(0)
    const canvasContext = React.useRef((() => {
        const context = document.createElement('canvas').getContext('2d')
        context.font = '16px Noto Sans HK'
        return context
    })())

    const characterPositions: number[] = [0]

    for (let i = 0; i < props.textChain.length; i++) {
        const block = props.textChain[i]
        const offset = i > 0 ? characterPositions[characterPositions.length - 1] : 0
        if (block.type === 'raw') {
            for (let j = 1; j <= block.value.length; j++) {
                characterPositions.push(offset + canvasContext.current.measureText(block.value.substr(0, j)).width)
            }
        } else if (block.type === 'variableReference') {
            const content = state.nodes[block.nodeId] ? (state.nodes[block.nodeId] as VariableNodes.Create).label : 'Deleted'
            characterPositions.push(offset + canvasContext.current.measureText(content).width + 16)
        }
    }

    // If the parent updates the text chain programatically and makes the cursor position invalid, just use 0 until the user types again
    const cursorStartPosition = characterPositions.length - 1 < internalCursorStartPosition ? 0 : internalCursorStartPosition

    let selectedTextBlockIndex: number
    const blockOffsets: number[] = [0]
    for (let i = 0; i < props.textChain.length; i++) {
        const block = props.textChain[i]
        const previousOffset = blockOffsets[i]
        if (block.type === 'raw') {
            blockOffsets[i + 1] = previousOffset + block.value.length
            if (blockOffsets[i + 1] >= cursorStartPosition || i === props.textChain.length - 1) {
                selectedTextBlockIndex = selectedTextBlockIndex == null ? i : selectedTextBlockIndex
            }
        } else if (block.type === 'variableReference') {
            blockOffsets[i + 1] = previousOffset + 1
        }
    }

    const selectedTextBlock = props.textChain[selectedTextBlockIndex]
    const selectedTextBlockOffset = blockOffsets[selectedTextBlockIndex]

    let autoCompleteSuggestions: VariableNodes.Create[] = []
    let autoCompleteMenu
    let wordStartIndex: number
    let wordEndIndex: number
    let wordHighlight
    if (selectedTextBlock.type === 'raw' && props.allowVariables) {
        const firstHalf = selectedTextBlock.value.slice(0, cursorStartPosition - selectedTextBlockOffset).split(' ').slice(-1)[0]
        const secondHalf = selectedTextBlock.value.slice(cursorStartPosition - selectedTextBlockOffset).split(' ').slice(0)[0]
        wordStartIndex = cursorStartPosition - selectedTextBlockOffset - firstHalf.length
        wordEndIndex = cursorStartPosition - selectedTextBlockOffset + secondHalf.length
        const currentWord = selectedTextBlock.value.slice(wordStartIndex, wordEndIndex)
        if (currentWord.length > 0) {
            autoCompleteSuggestions = Object.values(state.nodes).filter(n =>
                n.nodeType === 'create_variable' &&
                n.id !== props.nodeId &&
                n.label && n.label.toLowerCase().substr(0, currentWord.length) === currentWord.toLowerCase()
            ) as VariableNodes.Create[]
        }

        const autoCompleteSuggestionsRendered = autoCompleteSuggestions.map((suggestion, index) => {
            return (
                <div key={suggestion.id} className={classNames(styles.suggestion, { [styles.suggestionSelected]: selectedSuggestionIndex === index })}>{suggestion.label}</div>
            )
        })

        if (autoCompleteSuggestions.length > 0 && hasFocus) {
            autoCompleteMenu = (
                <div className={styles.autoCompleteSuggestions} style={{ left: characterPositions[wordStartIndex + selectedTextBlockOffset] + 6}}>
                    {autoCompleteSuggestionsRendered}
                    <div className={styles.autoCompleteSuggestionsArrow} />
                </div>
            )

            wordHighlight = <div className={styles.wordHighlight} style={{
                width: characterPositions[wordEndIndex + selectedTextBlockOffset] - characterPositions[wordStartIndex + selectedTextBlockOffset] + 8,
                left: characterPositions[wordStartIndex + selectedTextBlockOffset] + 6,
            }}></div>
        }
    }

    const mergeAdjacentRawTextBlocks = (textChain: TextChain) => {
        let newTextChain = textChain
        for (let i = 0; i < newTextChain.length - 1; i++) {
            const blockOne = newTextChain[i]
            const blockTwo = newTextChain[i + 1]
            if (blockOne.type === 'raw' && blockTwo.type === 'raw') {
                const merged = blockOne.value + blockTwo.value
                newTextChain = newTextChain.slice(0, i).concat([{ id: uuid(), type: 'raw', value: merged }]).concat(newTextChain.slice(i + 2))
                i--
            }
        }
        return newTextChain
    }

    const deleteTextBlock = (id: string) => {
        const index = props.textChain.findIndex(b => b.id === id)
        const newTextChain = props.textChain.slice(0, index).concat(props.textChain.slice(index + 1))
        const merged = mergeAdjacentRawTextBlocks(newTextChain)
        props.updateTextChain(merged)
        props.saveTextChain(merged)
    }

    const replaceTextBlock = (id: string, newBlock: TextBlockObjectType, insertBefore: TextBlockObjectType, insertAfter: TextBlockObjectType) => {
        const index = props.textChain.findIndex(b => b.id === id)
        const newBlocks = [insertBefore, newBlock, insertAfter].filter(b => !!b)
        const newTextChain = props.textChain.slice(0, index).concat(newBlocks).concat(props.textChain.slice(index + 1))
        props.updateTextChain(newTextChain)
        props.saveTextChain(newTextChain)
    }

    const updateRawTextBlock = (id: string, value: string, shouldBlur: boolean) => {
        const index = props.textChain.findIndex(b => b.id === id)
        const newBlock = {...props.textChain[index], ...{ value }}
        const newTextChain = props.textChain.slice(0, index).concat([newBlock]).concat(props.textChain.slice(index + 1))
        props.updateTextChain(newTextChain)
        if (shouldBlur) {
            focusUtil.setCurrentFocus(currentFocus.slice(0, currentFocus.length - 1))
            inputRef.current.blur()
            props.saveTextChain(newTextChain)
        }
    }

    // Key bindings
    React.useEffect(() => {
        // If the child input is currently in focus
        if (!hasFocus) { return }

        const arrowLeftHandler = () => {
            const newCursorPosition = Math.max(cursorStartPosition - 1, 0)
            setInternalCursorStartPosition(newCursorPosition)
            setCursorPositionBeforeEditing(newCursorPosition)
            setHiddenInputValue('')
        }

        const arrowRightHandler = () => {
            const newCursorPosition = Math.min(cursorStartPosition + 1, characterPositions.length - 1)
            setInternalCursorStartPosition(newCursorPosition)
            setCursorPositionBeforeEditing(newCursorPosition)
            setHiddenInputValue('')
        }

        const backspaceHandler = () => {
            if (selectedTextBlock.type === 'raw' && cursorStartPosition - selectedTextBlockOffset > 0) {
                const newCursorPosition = cursorStartPosition - 1
                setInternalCursorStartPosition(newCursorPosition)
                setCursorPositionBeforeEditing(newCursorPosition)
                const offsetCursorPosition = newCursorPosition - selectedTextBlockOffset
                updateRawTextBlock(selectedTextBlock.id, selectedTextBlock.value.slice(0, offsetCursorPosition) + selectedTextBlock.value.slice(offsetCursorPosition + 1), false)
            } else if (selectedTextBlock.type === 'raw' && cursorStartPosition - selectedTextBlockOffset === 0) {
                const blockIndex = props.textChain.findIndex(b => b.id === selectedTextBlock.id)
                if (blockIndex > 0) {
                    const newCursorPosition = cursorStartPosition - 1
                    setInternalCursorStartPosition(newCursorPosition)
                    setCursorPositionBeforeEditing(newCursorPosition)
                    deleteTextBlock(props.textChain[blockIndex - 1].id)
                }
            }
            setHiddenInputValue('')
        }

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

        const enterHandler = () => {
            if (selectedTextBlock.type === 'raw') {
                if (autoCompleteSuggestions.length > 0 && props.allowVariables) {
                    replaceTextBlock(
                        selectedTextBlock.id,
                        { id: uuid(), type: 'variableReference', nodeId: autoCompleteSuggestions[selectedSuggestionIndex].id },
                        { id: uuid(), type: 'raw', value: selectedTextBlock.value.substr(0, wordStartIndex) },
                        { id: uuid(), type: 'raw', value: selectedTextBlock.value.substr(wordEndIndex) }
                    )
                    const newCursorPosition = wordStartIndex + 1 + selectedTextBlockOffset
                    setInternalCursorStartPosition(newCursorPosition)
                    setCursorPositionBeforeEditing(newCursorPosition)
                    setHiddenInputValue('')
                } else {
                    updateRawTextBlock(selectedTextBlock.id, selectedTextBlock.value, true)
                }
            }
        }

        const escapeHandler = () => {
            focusUtil.setCurrentFocus(currentFocus.slice(0, currentFocus.length - 1))
            setHiddenInputValue('')
            inputRef.current.blur()
        }

        keyboardUtil.registerKeyListeners([
            { key: 'ArrowLeft', callback: arrowLeftHandler },
            { key: 'ArrowRight', callback: arrowRightHandler },
            { key: 'Backspace', callback: backspaceHandler },
            { key: 'ArrowUp', callback: arrowUpHandler },
            { key: 'ArrowDown', callback: arrowDownHandler },
            { key: 'Enter', callback: enterHandler },
            { key: 'Escape', callback: escapeHandler }
        ])

        return () => {
            keyboardUtil.deregisterKeyListeners([
                arrowLeftHandler,
                arrowRightHandler,
                enterHandler,
                backspaceHandler,
                arrowUpHandler,
                arrowDownHandler,
                escapeHandler
            ])
        }
    })

    const updateCursorPosition = (position: number) => {
        setInternalCursorStartPosition(position)
        setCursorPositionBeforeEditing(position)
        setHiddenInputValue('')
        inputRef.current.focus()
    }

    const onMouseDown = (event: React.MouseEvent, blockId: string) => {
        const index = props.textChain.findIndex(b => b.id === blockId)
        const offset = event.nativeEvent.offsetX + characterPositions[blockOffsets[index]]
        if (offset > 0) {
            for (let i = 0; i < characterPositions.length; i++) {
                const currentDiff = offset - characterPositions[i]
                const nextDiff = i === characterPositions.length - 1 ? -Infinity : offset - characterPositions[i + 1]
                if (currentDiff > 0 && nextDiff < 0) {
                    const characterIndex = currentDiff > Math.abs(nextDiff) ? i + 1 : i
                    updateCursorPosition(characterIndex)
                }
            }
        } else {
            updateCursorPosition(0)
        }

        event.stopPropagation()
        event.preventDefault()
    }

    const onHiddenInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedTextBlock.type === 'raw') {
            setHiddenInputValue(event.target.value)
            const newCursorPosition = cursorPositionBeforeEditing + event.target.value.length
            setInternalCursorStartPosition(newCursorPosition)
            const newBlockValue = selectedTextBlock.value.slice(0, cursorPositionBeforeEditing - selectedTextBlockOffset) + event.target.value + selectedTextBlock.value.slice(cursorPositionBeforeEditing + hiddenInputValue.length - selectedTextBlockOffset)
            updateRawTextBlock(selectedTextBlock.id, newBlockValue, false)
        }
    }

    const textChainClasses = classNames(styles.textChainInputOuter, {
        [styles.textChainHasFocus]: hasFocus
    })

    const blocksRendered = props.textChain.map((block) => {
        if (block.type === 'raw') {
            return <span key={block.id} className={styles.block} onMouseDown={(event) => onMouseDown(event, block.id)}>{block.value}</span>
        } else if (block.type === 'variableReference') {
            const content = state.nodes[block.nodeId] ? (state.nodes[block.nodeId] as VariableNodes.Create).label : 'Deleted'
            const variableClasses = classNames(styles.variable, styles.block, {
                [styles.brokenVariableReference]: !state.nodes[block.nodeId]
            })
            return <span key={block.id} className={variableClasses}>{content}</span>
        }
    })

    const cursor = hasFocus ? <div key={Math.random()} className={styles.cursor} style={{ left: characterPositions[cursorStartPosition] + 11 }} /> : null

    let placeholder
    if (props.placeholder) {
        placeholder = <div className={styles.placeholder}>{props.placeholder}</div>
    }

    return (
        <div className={textChainClasses} onMouseDown={(event) => { inputRef.current.focus(); event.preventDefault(); event.stopPropagation(); }}>
            <div className={styles.textChainInputInner} onMouseUp={() => {
                setCursorEndPosition(window.getSelection().focusOffset)
            }}>
                <div className={styles.inputPaddingLeft} onMouseDown={() => updateCursorPosition(0)} />
                {blocksRendered || <span dangerouslySetInnerHTML={{ __html: '&nbsp;'}} />}
                <div className={styles.inputPaddingRight} onMouseDown={() => updateCursorPosition(characterPositions.length - 1)} />
                {wordHighlight}
                {cursor}
                {placeholder}
                <input
                    ref={inputRef}
                    value={hiddenInputValue}
                    type="text"
                    className={styles.hiddenInput}
                    onChange={onHiddenInputChange}
                    tabIndex={-1}
                />
                {autoCompleteMenu}
            </div>
        </div>
    )
}