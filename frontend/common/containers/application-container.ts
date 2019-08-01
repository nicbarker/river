// -------------------------------------------------------------
// A react-redux container for application-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { Application as ApplicationComponent } from 'components/application-component'
import { ApplicationState } from 'reducers/application-reducer';
import { Dispatch } from 'react';
import { ReduxAction } from 'actions/application-actions';

const mapStateToProps = (state: ApplicationState) => {
    return { reduxState: state }
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>) => {
    return {}
}

export const Application = connect(
    mapStateToProps,
    mapDispatchToProps
)(ApplicationComponent)