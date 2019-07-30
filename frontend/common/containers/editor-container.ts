// -------------------------------------------------------------
// A react-redux container for editor-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { Editor as EditorComponent, EditorProps } from 'components/editor-component'
import { ApplicationState, Layer } from 'reducers/application-reducer';
import { Dispatch } from 'react';
import { ReduxAction, setSelectedNode, insertNode, setActiveLayer } from 'actions/application-actions';

const mapStateToProps = (state: ApplicationState) => {
    const props: Partial<EditorProps> = {
        nodes: state.nodes,
        orderedNodes: state.orderedNodes,
        activeLayer: state.activeLayer,
        selectedNodeId: state.selectedNodeId
    }
    return props
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>) => {
    const props: Partial<EditorProps> = {
        setActiveLayer: (activeLayer: Layer) => dispatch(setActiveLayer(activeLayer)),
        setSelectedNode: (nodeId: string) => dispatch(setSelectedNode(nodeId)),
        insertNode: (previousNodeId: string) => dispatch(insertNode(previousNodeId)),
    }
    return props
}

export const Editor = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorComponent)