import * as React from 'react'
import { StylesheetContext } from 'context/stylesheet-context'
import { editorStyles } from 'styles/editor-styles'
import * as classNames from 'classnames'
import { RiverNode } from 'lib/interpreter'
import { NodeOuter } from 'components/nodes/node-outer-component'
import DownloadIcon from 'ionicons/dist/ionicons/svg/md-cloud-download.svg'
import UploadIcon from 'ionicons/dist/ionicons/svg/md-cloud-upload.svg'
import { StoreContext } from 'context/store-context'
import { InteractionContext } from 'context/interaction-context'
import { useEffect, useState, useContext, useRef } from 'react'

export const Editor = () => {
    const { createStyles } = useContext(StylesheetContext)
    const { state, dispatch } = useContext(StoreContext)
    const styles = createStyles(editorStyles)
    const nodesContainerRef = useRef<HTMLDivElement>()
    const fileInputRef = useRef<HTMLInputElement>()

    const [fileMenuVisible, setFileMenuVisible] = useState(false)
    const [editorMouseDown, setEditorMouseDown] = useState(false)
    const [dragStartPosition, setDragStartPosition] = useState([0, 0])
    const [dragEndPosition, setDragEndPosition] = useState([0, 0])
    const [dragSelectedNodes, setDragSelectedNodes] = useState<{ [key: string]: RiverNode }>({})

    const { currentFocus, focusUtil, keyboardUtil } = useContext(InteractionContext)
    const [hasFocus, ancestorFocus] = focusUtil.hasFocus([])

    useEffect(() => {
        focusUtil.setCurrentFocus([]);
    }, [])

    useEffect(() => {
        if (!ancestorFocus || currentFocus.length > 1) { return }
        const currentNode = state.orderedNodes[currentFocus[0]]

        const backspaceHandler = () => {
            if (Object.values(dragSelectedNodes).length > 0) {
                dispatch({ type: 'DELETE_NODES', payload: { nodeIds: Object.values(dragSelectedNodes).map(n => n.id) } })
            } else if (currentFocus.length === 1) {
                dispatch({ type: 'DELETE_NODES', payload: { nodeIds: [state.orderedNodes[currentFocus[0]].id] } })
                if (state.orderedNodes.length === 1) {
                    focusUtil.setCurrentFocus([])
                } else if (currentFocus[0] === state.orderedNodes.length - 1) {
                    focusUtil.incrementCurrentFocus(-1)
                }
            }
        }

        const arrowUpHandler = () => focusUtil.incrementCurrentFocus(-1)
        const arrowDownHandler = () => focusUtil.incrementCurrentFocus(1)
        const enterHandler = (conditional: boolean = false) => {
            dispatch({ type: 'INSERT_NODE', payload: {
                previousNodeId: currentFocus.length === 1 ? state.orderedNodes[currentFocus[0]].id : undefined,
                conditional
            }})
        }
        const createConditionalHandler = () => enterHandler(true)

        keyboardUtil.registerKeyListeners([
            { key: 'Backspace', callback: backspaceHandler },
            { key: 'ArrowUp', callback: arrowUpHandler },
            { key: 'ArrowDown', callback: arrowDownHandler },
            { key: 'Enter', callback: enterHandler },
            { key: 'C', callback: createConditionalHandler }
        ])

        return () => {
            keyboardUtil.deregisterKeyListeners([ enterHandler, backspaceHandler, arrowDownHandler, arrowUpHandler, createConditionalHandler ])
        }
    }, [hasFocus, ancestorFocus, currentFocus, state.orderedNodes, focusUtil.incrementCurrentFocus])

    useEffect(() => {
        if (currentFocus.length === 1) {
            if (currentFocus[0] > Object.values(state.orderedNodes).length - 1) {
                focusUtil.setCurrentFocus([Object.values(state.orderedNodes).length - 1])
            } else if (currentFocus[0] < 0) {
                focusUtil.setCurrentFocus([0])
            }
        }
    }, [currentFocus])

    const onEditorMouseDown = (event: React.MouseEvent) => {
        setFileMenuVisible(false)
        setEditorMouseDown(true)
        setDragSelectedNodes({})
        setDragStartPosition([event.clientX - nodesContainerRef.current.offsetLeft, event.clientY - nodesContainerRef.current.offsetTop])
        setDragEndPosition([event.clientX - nodesContainerRef.current.offsetLeft, event.clientY - nodesContainerRef.current.offsetTop])
    }

    const onEditorMouseMove = (event: React.MouseEvent) => {
        setDragEndPosition([event.clientX - nodesContainerRef.current.offsetLeft, event.clientY - nodesContainerRef.current.offsetTop])
    }

    let dragSelection
    let dragSelectionDimensions: [number, number, number, number]
    if (editorMouseDown) {
        const minXPosition = Math.min(dragStartPosition[0], dragEndPosition[0])
        const maxXPosition = Math.max(dragStartPosition[0], dragEndPosition[0])
        const minYPosition = Math.min(dragStartPosition[1], dragEndPosition[1])
        const maxYPosition = Math.max(dragStartPosition[1], dragEndPosition[1])
        // If the drag selection is wider or taller than 10 pixels
        if (maxXPosition - minXPosition > 5 || maxYPosition - minYPosition > 5) {
            dragSelection = <div className={styles.dragSelection} style={{
                left: minXPosition,
                top: minYPosition,
                width: maxXPosition - minXPosition,
                height: maxYPosition - minYPosition
            }}/>
            dragSelectionDimensions = [minXPosition, minYPosition, maxXPosition, maxYPosition]
        }
    }

    const renderedNodes = Object.values(state.orderedNodes).map((node, index) => {
        const setNodeDragSelected = (selected: boolean) => {
            if (selected) {
                dragSelectedNodes[node.id] = node
            } else {
                delete dragSelectedNodes[node.id]
            }
            setDragSelectedNodes(dragSelectedNodes)
        }
        return <NodeOuter
            key={node.id}
            index={index}
            nodeId={node.id}
            dragSelectionDimensions={dragSelectionDimensions}
            setNodeDragSelected={setNodeDragSelected}
            dragSelected={!!dragSelectedNodes[node.id]}
            focusState={[index]}
        />
    })

    const pressEnterMessage = renderedNodes.length === 0 ? <div className={styles.pressEnterMessage}>Press Enter to create a new Node.</div> : null

    const downloadProgram = () => {
        const element = document.createElement('a')
        element.setAttribute('href', 'data:text/textcharset=utf-8,' + encodeURI(JSON.stringify(state.nodes)))
        element.setAttribute('download', "program.rvr")
        element.click()
    }

    const openProgram  = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files.length > 0) {
            const reader = new FileReader()
            reader.onload = () => {
                const program = JSON.parse(reader.result as string)
                dispatch({ type: 'SET_PROGRAM_NODES', payload: { nodes: program } })
                setFileMenuVisible(false)
            }
            reader.readAsText(event.target.files[0])
        }
    }

    let fileMenuOptions
    if (fileMenuVisible) {
        fileMenuOptions = (
            <div className={styles.headerDropdownOuter}>
                <div className={styles.headerDropdownButtonBehind}></div>
                <div className={styles.dropdownItems} onMouseDown={(event) => event.stopPropagation()}>
                    <div className={styles.dropdownItem} onClick={() => fileInputRef.current.click()}>
                        <input type="file" onChange={openProgram} style={{ display: 'none' }} ref={fileInputRef}></input>
                        <UploadIcon className={styles.fileMenuIcon} />
                        Open program
                    </div>
                    <div className={styles.dropdownItem} onClick={downloadProgram}>
                        <DownloadIcon className={styles.fileMenuIcon} />
                        Save program
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.editorOuter}>
            <div className={styles.editorHeader}>
                <div className={styles.headerButton} onClick={() => dispatch({ type: 'SET_ACTIVE_LAYER', payload: { activeLayer: 'editor' } })}>
                    <div className={classNames(styles.headerButtonText, { [styles.active]: state.activeLayer === 'editor'})} style={{ borderTopLeftRadius: 5 }} >Editor</div>
                </div>
                <div className={styles.headerButton}>
                    <div
                        className={classNames(styles.headerButtonText, { [styles.dropdownVisible]: fileMenuVisible})}
                        onMouseDown={(event) => { event.stopPropagation(); setFileMenuVisible(true) }}
                    >File</div>
                    {fileMenuOptions}
                </div>
            </div>
            <div
                className={styles.nodesScrollContainer}
                onMouseUp={() => setEditorMouseDown(false)}
                onMouseMove={editorMouseDown ? onEditorMouseMove : undefined}
                onMouseDown={onEditorMouseDown}
                ref={nodesContainerRef}
            >
                {dragSelection}
                <div className={styles.nodes}>
                    {renderedNodes}
                    {pressEnterMessage}
                </div>
            </div>
        </div>
    )
}