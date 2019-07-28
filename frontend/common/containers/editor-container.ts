// -------------------------------------------------------------
// A react-redux container for editor-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { Editor as EditorComponent } from 'components/editor-component'
import { ApplicationState } from 'reducers/application-reducer';
import { Dispatch } from 'react';
import { ReduxAction, setSelectedNode, deleteNode, insertNode } from 'actions/application-actions';

const mapStateToProps = (state: ApplicationState) => {
    return { reduxState: state }
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>) => {
    return {
        setSelectedNode: (nodeId: string) => dispatch(setSelectedNode(nodeId)),
        insertNode: (previousNodeId: string) => dispatch(insertNode(previousNodeId)),
        deleteNode: (nodeId: string) => dispatch(deleteNode(nodeId))
    }
}

export const Editor = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorComponent)