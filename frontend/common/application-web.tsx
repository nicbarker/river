// -------------------------------------------------------------
// This is the outer application wrapper for River.
// It kicks off the react application.
// -------------------------------------------------------------

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Application } from 'containers/application-container'
import { StylesheetContext, createStylesheetHelper } from 'lib/stylesheet-helper'
import { createStore } from 'redux'
import { applicationReducer } from 'reducers/application-reducer'

const store = createStore(applicationReducer)

window.store = store

const stylesheetHelper = { createStylesheet: createStylesheetHelper(store) }

// Load sentry if an error occurs
const captureError = async (error: any) => {
    const { logError } = await import(/* webpackChunkName: "sentry" */ 'lib/sentry')
    logError(error)
}

window.onerror = (message, url, line, column, error) => captureError(error)
window.onunhandledrejection = event => captureError(event.reason)

const hydrate = () => {
    if (document.readyState !== "loading")  {
        ReactDOM.render((
            <StylesheetContext.Provider value={stylesheetHelper}>
                <Provider store={store}>
                    <Router>
                        <Route path="/" component={Application} />
                    </Router>
                </Provider>
            </StylesheetContext.Provider>
        ) as any, document.getElementById('container'))
    } else {
        setTimeout(() => {
            hydrate()
        }, 5)
    }
}

hydrate()