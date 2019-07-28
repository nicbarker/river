import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { initialize } from 'lib/global-keyboard-listener'
import { Editor } from 'containers/editor-container';
import { ApplicationState } from 'reducers/application-reducer';
// Application components

export const Application = (props: { reduxState: ApplicationState }) => {
    React.useEffect(initialize, [])
    return (
        <>
            <style>
                {Object.keys(props.reduxState.styles).map(className => `.${className}{${props.reduxState.styles[className as any]}}`).join('')}
            </style>
            <Switch>
                <Route path='/'>
                    <Editor />
                </Route>
            </Switch>
        </>
    )
}