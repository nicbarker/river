// -------------------------------------------------------------
// A react-redux container for application-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { Application as ApplicationComponent } from 'components/application-component'

const mapStateToProps = state => {
    return { reduxState: state }
}

const mapDispatchToProps = dispatch => {
    return {}
}

export const Application = connect(
    mapStateToProps,
    mapDispatchToProps
)(ApplicationComponent)