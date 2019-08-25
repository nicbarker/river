import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { editorStyles } from 'styles/editor-styles'
import { Layer } from 'reducers/application-reducer'
import classNames = require('classnames')
import { NodeType, RiverNode } from 'lib/interpreter';
import { NodeOuter } from 'containers/node-outer-container';
import DownloadIcon from 'ionicons/dist/ionicons/svg/md-cloud-download.svg'
import UploadIcon from 'ionicons/dist/ionicons/svg/md-cloud-upload.svg'

export type EditorProps = {
    nodes: { [id: string]: RiverNode }
    orderedNodes: RiverNode[]
    activeLayer: Layer
    selectedNodeId: string

    setActiveLayer: (activeLayer: Layer) => void
    setSelectedNode: (nodeId: string) => void
    insertNode: (previousNodeId: string) => void
    setNodeType: (nodeId: string, type: NodeType) => void
    setProgramNodes: (nodes: { [id: string]: RiverNode }) => void
    deleteNodes: (nodeIds: string[]) => void
    undo: () => void
    redo: () => void
}

export const Editor = (props: EditorProps) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(editorStyles)
    const editorRef = React.useRef<HTMLDivElement>()
    const nodesContainerRef = React.useRef<HTMLDivElement>()
    const selectedNodeRef = React.useRef<HTMLDivElement>()
    const fileInputRef = React.useRef<HTMLInputElement>()
    const focusEditor = () => editorRef.current && editorRef.current.focus()
    React.useEffect(() => focusEditor(), [])

    const [fileMenuVisible, setFileMenuVisible] = React.useState(false)
    const [editorMouseDown, setEditorMouseDown] = React.useState(false)
    const [dragStartPosition, setDragStartPosition] = React.useState([0, 0])
    const [dragEndPosition, setDragEndPosition] = React.useState([0, 0])
    const [dragSelectedNodes, setDragSelectedNodes] = React.useState<RiverNode[]>([])

    // Register keyboard shortcuts
    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            props.insertNode(props.selectedNodeId)
        } else if (event.key === 'ArrowUp') {
            const previousNode = Object.values(props.nodes).find(n => n.nextNodeId === props.selectedNodeId)
            if (previousNode) {
                props.setSelectedNode(previousNode.id)
            }
        } else if (event.key === 'ArrowDown') {
            if (props.nodes[props.selectedNodeId].nextNodeId) {
                props.setSelectedNode(props.nodes[props.selectedNodeId].nextNodeId)
            }
        } else if (event.key === 'e') {
            props.setActiveLayer('editor')
        } else if (event.key === 'Backspace') {
            if (dragSelectedNodes.length > 0) {
                props.deleteNodes(dragSelectedNodes.map(n => n.id))
            } else {
                props.deleteNodes([props.selectedNodeId])
            }
        } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') {
            props.redo()
            event.preventDefault()
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            props.undo()
            event.preventDefault()
        }
    }

    const onEditorMouseDown = (event: React.MouseEvent) => {
        setFileMenuVisible(false)
        setEditorMouseDown(true)
        setDragSelectedNodes([])
        setDragStartPosition([event.clientX - nodesContainerRef.current.offsetLeft, event.clientY - nodesContainerRef.current.offsetTop])
        setDragEndPosition([event.clientX - nodesContainerRef.current.offsetLeft, event.clientY - nodesContainerRef.current.offsetTop])
    }

    const onEditorMouseMove = (event: React.MouseEvent) => {
        setDragEndPosition([event.clientX - nodesContainerRef.current.offsetLeft, event.clientY - nodesContainerRef.current.offsetTop])
        setDragSelectedNodes([])
    }

    let dragSelection
    let dragSelectionDimensions: [number, number, number, number]
    if (editorMouseDown) {
        const minXPosition = Math.min(dragStartPosition[0], dragEndPosition[0]);
        const maxXPosition = Math.max(dragStartPosition[0], dragEndPosition[0]);
        const minYPosition = Math.min(dragStartPosition[1], dragEndPosition[1]);
        const maxYPosition = Math.max(dragStartPosition[1], dragEndPosition[1]);
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

    const renderedNodes = Object.values(props.orderedNodes).map((node) => {
        const setNodeDragSelected = () => {
            if (!dragSelectedNodes.includes(node)) {
                setDragSelectedNodes(dragSelectedNodes.concat([node]))
            }
        }
        return <NodeOuter
            key={node.id}
            nodeId={node.id}
            focusParent={focusEditor}
            parentOwnedRef={node.id === props.selectedNodeId ? selectedNodeRef : undefined}
            dragSelectionDimensions={dragSelectionDimensions}
            setNodeDragSelected={setNodeDragSelected}
            dragSelected={dragSelectedNodes.includes(node)}
        />
    })

    const pressEnterMessage = renderedNodes.length === 0 ? <div className={styles.pressEnterMessage}>Press Enter to create a new Node.</div> : null

    const downloadProgram = () => {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/text;charset=utf-8,' + encodeURI(JSON.stringify(props.nodes)));
        element.setAttribute('download', "program.rvr");
        element.click();
    }

    const openProgram  = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                const program = JSON.parse(reader.result as string)
                props.setProgramNodes(program)
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
        <div className={styles.editorOuter}
            onKeyDown={handleKeyPress}
            ref={editorRef}
            tabIndex={1}
            onFocus={() => { selectedNodeRef.current && selectedNodeRef.current.focus() }}
        >
            <div className={styles.editorHeader}>
                <div className={styles.headerButton} onClick={() => props.setActiveLayer('editor')}>
                    <div className={classNames(styles.headerButtonText, { [styles.active]: props.activeLayer === 'editor'})} style={{ borderTopLeftRadius: 5 }} >Editor</div>
                </div>
                <div className={styles.headerButton}>
                    <div className={classNames(styles.headerButtonText, { [styles.dropdownVisible]: fileMenuVisible})} onMouseDown={(event) => { event.stopPropagation(); setFileMenuVisible(true) }}>File</div>
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