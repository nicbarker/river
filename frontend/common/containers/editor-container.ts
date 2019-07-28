// -------------------------------------------------------------
// A react-redux container for editor-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { Editor as EditorComponent } from 'components/editor-component'
import { ApplicationState } from 'reducers/application-reducer';
import { Dispatch } from 'react';
import { ReduxAction, setSelectedNode } from 'actions/application-actions';

const mapStateToProps = (state: ApplicationState) => {
    return { reduxState: state }
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>) => {
    return {
        setSelectedNode: (nodeId: string) => {
            dispatch(setSelectedNode(nodeId))
        }
    }
}

export const Editor = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorComponent)