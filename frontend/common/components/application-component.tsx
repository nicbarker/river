import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Editor } from 'components/editor-component';
import { Interpreter } from 'components/interpreter-component';
import { applicationStyles } from 'styles/application-styles';
import { StylesheetContext } from 'lib/stylesheet-helper';

export const Application = () => {
    const { styles: renderedStyles, createStyles } = React.useContext(StylesheetContext)
    const styles = createStyles(applicationStyles);
    return (
        <>
            <style>
                {Object.keys(renderedStyles).map(className => `.${className}{${renderedStyles[className]}}`).join('')}
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