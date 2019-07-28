import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { initialize } from 'lib/global-keyboard-listener'
import { Editor } from 'containers/editor-container';
import { Interpreter } from 'containers/interpreter-container';
import { ApplicationState } from 'reducers/application-reducer';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { applicationStyles } from 'styles/application-styles';
// Application components

export const Application = (props: { reduxState: ApplicationState }) => {
    React.useEffect(initialize, [])
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(applicationStyles);
    return (
        <>
            <style>
                {Object.keys(props.reduxState.styles).map(className => `.${className}{${props.reduxState.styles[className as any]}}`).join('')}
            </style>
            <Switch>
                <Route path='/'>
                    <div className={styles.container}>
                        <Editor />
                        <Interpreter />
                    </div>
                </Route>
            </Switch>
        </>
    )
}