// -------------------------------------------------------------
// A react-redux container for interpereter-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { Interpreter as InterpreterComponent, InterpreterProps } from 'components/interpreter-component'
import { ApplicationState } from 'reducers/application-reducer';
import { Dispatch } from 'react';
import { ReduxAction, setSelectedNode } from 'actions/application-actions';

const mapStateToProps = (state: ApplicationState): Partial<InterpreterProps> => {
    return {
        nodes: state.nodes
    }
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>): Partial<InterpreterProps> => {
    return {
        setSelectedNode: (nodeId: string) => dispatch(setSelectedNode(nodeId))
    }
}

export const Interpreter = connect(
    mapStateToProps,
    mapDispatchToProps
)(InterpreterComponent)