import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { RiverNode, VariableNodes, TextChain, TextBlockObjectType } from 'lib/interpreter'
import { uuid } from 'lib/uuid'
import { textChainInputStyles } from 'styles/text-chain-input-styles'
import classNames = require('classnames')

export type TextChainInputProps = {
    nodeId: string,
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

    React.useEffect(() => {
        props.innerRef.current.focus()
    }, [])

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
        const index = localTextChain.findIndex(b => b.id === id)
        const newTextChain = localTextChain.slice(0, index).concat(localTextChain.slice(index + 1))
        setLocalTextChain(mergeAdjacentRawTextBlocks(newTextChain))
    }

    const [localTextChain, setLocalTextChain] = React.useState(props.textChain)
    const [inputHasFocus, setInputHasFocus] = React.useState(true)
    const [hiddenInputValue, setHiddenInputValue] = React.useState('')
    const [cursorPositionBeforeEditing, setCursorPositionBeforeEditing] = React.useState(0)
    const [cursorStartPosition, setCursorStartPosition] = React.useState(0)
    const [cursorEndPosition, setCursorEndPosition] = React.useState(0)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(0)
    const canvasContext = React.useRef((() => {
        const context = document.createElement('canvas').getContext('2d')
        context.font = '16px Noto Sans HK'
        return context
    })())

    const replaceTextBlock = (id: string, newBlock: TextBlockObjectType, insertBefore?: TextBlockObjectType, insertAfter?: TextBlockObjectType) => {
        const index = localTextChain.findIndex(b => b.id === id)
        const newBlocks = [insertBefore, newBlock, insertAfter].filter(b => !!b)
        const newTextChain = localTextChain.slice(0, index).concat(newBlocks).concat(localTextChain.slice(index + 1))
        setLocalTextChain(newTextChain)
    }

    const updateRawTextBlock = (id: string, value: string, shouldBlur: boolean) => {
        const index = localTextChain.findIndex(b => b.id === id)
        const newBlock = {...localTextChain[index], ...{ value }}
        const newTextChain = localTextChain.slice(0, index).concat([newBlock]).concat(localTextChain.slice(index + 1))
        setLocalTextChain(newTextChain)
        if (shouldBlur) {
            props.setTextChain(newTextChain)
            props.focusParent()
        }
    }

    let selectedTextBlockIndex: number
    let blockOffsets: number[] = [0]
    for (let i = 0; i < localTextChain.length; i++) {
        const block = localTextChain[i]
        const previousOffset = blockOffsets[i]
        if (block.type === 'raw') {
            blockOffsets[i + 1] = previousOffset + block.value.length
            if (blockOffsets[i + 1] >= cursorStartPosition || i === localTextChain.length - 1) {
                selectedTextBlockIndex = selectedTextBlockIndex == null ? i : selectedTextBlockIndex
            }
        } else if (block.type === 'variableReference') {
            blockOffsets[i + 1] = previousOffset + 1
        }
    }

    let characterPositions: number[] = [0]

    for (let i = 0; i < localTextChain.length; i++) {
        const block = localTextChain[i]
        const offset = i > 0 ? characterPositions[characterPositions.length - 1] : 0
        if (block.type === 'raw') {
            for (let j = 1; j <= block.value.length; j++) {
                characterPositions.push(offset + canvasContext.current.measureText(block.value.substr(0, j)).width)
            }
        } else if (block.type === 'variableReference') {
            const content = props.nodes[block.nodeId] ? (props.nodes[block.nodeId] as VariableNodes.Create).label : 'Deleted'
            characterPositions.push(offset + canvasContext.current.measureText(content).width + 16)
        }
    }

    const selectedTextBlock = localTextChain[selectedTextBlockIndex]
    const selectedTextBlockOffset = blockOffsets[selectedTextBlockIndex]

    let autoCompleteSuggestions: VariableNodes.Create[] = []
    let autoCompleteMenu
    let wordStartIndex: number
    let wordEndIndex: number
    let wordHighlight
    if (selectedTextBlock.type === 'raw') {
        const firstHalf = selectedTextBlock.value.slice(0, cursorStartPosition - selectedTextBlockOffset).split(' ').slice(-1)[0]
        const secondHalf = selectedTextBlock.value.slice(cursorStartPosition - selectedTextBlockOffset).split(' ').slice(0)[0]
        wordStartIndex = cursorStartPosition - selectedTextBlockOffset - firstHalf.length
        wordEndIndex = cursorStartPosition - selectedTextBlockOffset + secondHalf.length
        const currentWord = selectedTextBlock.value.slice(wordStartIndex, wordEndIndex)
        if (currentWord.length > 0) {
            autoCompleteSuggestions = Object.values(props.nodes).filter(n =>
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

        if (autoCompleteSuggestions.length > 0) {
            autoCompleteMenu = (
                <>
                    <div className={styles.autoCompleteSuggestions} style={{ left: characterPositions[wordStartIndex + selectedTextBlockOffset] + 6}}>
                        {autoCompleteSuggestionsRendered}
                        <div className={styles.autoCompleteSuggestionsArrow} />
                    </div>
                </>
            )

            wordHighlight = <div className={styles.wordHighlight} style={{
                width: characterPositions[wordEndIndex + selectedTextBlockOffset] - characterPositions[wordStartIndex + selectedTextBlockOffset] + 8,
                left: characterPositions[wordStartIndex + selectedTextBlockOffset] + 6,
            }}></div>
        }
    }

    const onInputFocus = () => {
        setInputHasFocus(true)
    }

    const onInputBlur = () => {
        setInputHasFocus(false)
        setHiddenInputValue('')
        props.setTextChain(localTextChain)
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
            const newCursorPosition = Math.max(cursorStartPosition - 1, 0)
            setCursorStartPosition(newCursorPosition)
            setCursorPositionBeforeEditing(newCursorPosition)
            setHiddenInputValue('')
        } else if (event.key === 'ArrowRight') {
            const newCursorPosition = Math.min(cursorStartPosition + 1, characterPositions.length - 1)
            setCursorStartPosition(newCursorPosition)
            setCursorPositionBeforeEditing(newCursorPosition)
            setHiddenInputValue('')
        } else if (event.key === 'Backspace') {
            if (selectedTextBlock.type === 'raw' && cursorStartPosition - selectedTextBlockOffset > 0) {
                const newCursorPosition = cursorStartPosition - 1
                setCursorStartPosition(newCursorPosition)
                setCursorPositionBeforeEditing(newCursorPosition)
                const offsetCursorPosition = newCursorPosition - selectedTextBlockOffset
                updateRawTextBlock(selectedTextBlock.id, selectedTextBlock.value.slice(0, offsetCursorPosition) + selectedTextBlock.value.slice(offsetCursorPosition + 1), false)
            } else if (selectedTextBlock.type === 'raw' && cursorStartPosition - selectedTextBlockOffset === 0) {
                const blockIndex = localTextChain.findIndex(b => b.id === selectedTextBlock.id)
                if (blockIndex > 0) {
                    const newCursorPosition = cursorStartPosition - 1
                    setCursorStartPosition(newCursorPosition)
                    setCursorPositionBeforeEditing(newCursorPosition)
                    deleteTextBlock(localTextChain[blockIndex - 1].id)
                }
            }
            setHiddenInputValue('')
        } else if (event.key === 'Enter' && selectedTextBlock.type === 'raw') {
            if (autoCompleteSuggestions.length > 0) {
                replaceTextBlock(
                    selectedTextBlock.id,
                    { id: uuid(), type: 'variableReference', nodeId: autoCompleteSuggestions[selectedSuggestionIndex].id },
                    wordStartIndex > 0 ? { id: uuid(), type: 'raw', value: selectedTextBlock.value.substr(0, wordStartIndex) } : undefined,
                    { id: uuid(), type: 'raw', value: selectedTextBlock.value.substr(wordEndIndex) }
                )
                const newCursorPosition = wordStartIndex + 1 + selectedTextBlockOffset
                setCursorStartPosition(newCursorPosition)
                setCursorPositionBeforeEditing(newCursorPosition)
                setHiddenInputValue('')
            } else {
                updateRawTextBlock(selectedTextBlock.id, selectedTextBlock.value, true)
            }
        } else if (event.key === 'ArrowUp') {
            if (selectedSuggestionIndex > 0) {
                setSelectedSuggestionIndex(selectedSuggestionIndex - 1)
            }
        } else if (event.key === 'ArrowDown') {
            if (selectedSuggestionIndex < autoCompleteSuggestions.length - 1) {
                setSelectedSuggestionIndex(selectedSuggestionIndex + 1)
            }
        }

        event.stopPropagation()
    }

    const onMouseDown = (event: React.MouseEvent, blockId: string) => {
        const index = localTextChain.findIndex(b => b.id === blockId)
        const offset = event.nativeEvent.offsetX + characterPositions[blockOffsets[index]]
        if (offset > 0) {
            for (let i = 0; i < characterPositions.length; i++) {
                const currentDiff = offset - characterPositions[i]
                const nextDiff = i === characterPositions.length - 1 ? -Infinity : offset - characterPositions[i + 1]
                if (currentDiff > 0 && nextDiff < 0) {
                    const characterIndex = currentDiff > Math.abs(nextDiff) ? i + 1 : i
                    setCursorStartPosition(characterIndex)
                    setCursorPositionBeforeEditing(characterIndex)
                    setHiddenInputValue('')
                    props.innerRef.current.focus()
                }
            }
        } else {
            setCursorStartPosition(0)
            setCursorPositionBeforeEditing(0)
            setHiddenInputValue('')
            props.innerRef.current.focus()
        }

        event.stopPropagation()
        event.preventDefault()
    }

    const onHiddenInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedTextBlock.type === 'raw') {
            setHiddenInputValue(event.target.value)
            const newCursorPosition = cursorPositionBeforeEditing + event.target.value.length
            setCursorStartPosition(newCursorPosition)
            const newBlockValue = selectedTextBlock.value.slice(0, cursorPositionBeforeEditing - selectedTextBlockOffset) + event.target.value + selectedTextBlock.value.slice(cursorPositionBeforeEditing + hiddenInputValue.length - selectedTextBlockOffset)
            updateRawTextBlock(selectedTextBlock.id, newBlockValue, false)
        }
    }

    const textChainClasses = classNames(styles.textChainInputOuter, {
        [styles.textChainHasFocus]: inputHasFocus
    })

    const blocksRendered = localTextChain.map((block) => {
        if (block.type === 'raw') {
            return <span key={block.id} onMouseDown={(event) => onMouseDown(event, block.id)}>{block.value}</span>
        } else if (block.type === 'variableReference') {
            const content = props.nodes[block.nodeId] ? (props.nodes[block.nodeId] as VariableNodes.Create).label : 'Deleted'
            const variableClasses = classNames(styles.variable, {
                [styles.brokenVariableReference]: !props.nodes[block.nodeId]
            })
            return <span key={block.id} className={variableClasses}>{content}</span>
        }
    })

    const cursor = inputHasFocus ? <div key={Math.random()} className={styles.cursor} style={{ left: characterPositions[cursorStartPosition] + 10 }} /> : null

    return (
        <div className={textChainClasses} onMouseDown={(event) => { props.innerRef.current.focus(); event.preventDefault(); event.stopPropagation(); }}>
            <div className={styles.textChainInputInner} onKeyDown={onKeyDown} onMouseUp={() => {
                setCursorEndPosition(window.getSelection().focusOffset)
            }}>
                {blocksRendered || <span dangerouslySetInnerHTML={{ __html: '&nbsp;'}} />}
                {wordHighlight}
                {cursor}
                <input
                    ref={props.innerRef}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    value={hiddenInputValue}
                    type="text"
                    className={styles.hiddenInput}
                    onChange={onHiddenInputChange}
                />
                {autoCompleteMenu}
            </div>
        </div>
    )
}