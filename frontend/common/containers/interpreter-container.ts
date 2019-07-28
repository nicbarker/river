// -------------------------------------------------------------
// A react-redux container for interpereter-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { Interpreter as InterpreterComponent } from 'components/interpreter-component'
import { ApplicationState } from 'reducers/application-reducer';
import { Dispatch } from 'react';
import { ReduxAction } from 'actions/application-actions';

const mapStateToProps = (state: ApplicationState) => {
    return { reduxState: state }
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>) => {
    return {}
}

export const Interpreter = connect(
    mapStateToProps,
    mapDispatchToProps
)(InterpreterComponent)