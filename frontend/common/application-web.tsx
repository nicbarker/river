// -------------------------------------------------------------
// This is the outer application wrapper for River.
// It kicks off the react application.
// -------------------------------------------------------------

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Application } from 'components/application-component'
import { StylesheetProvider } from 'lib/stylesheet-helper'
import { StoreProvider } from 'reducers/reducer-context'

// Load sentry if an error occurs
const captureError = async (error: any) => {
    const { logError } = await import(/* webpackChunkName: "sentry" */ 'lib/sentry')
    logError(error)
}

window.onerror = (message, url, line, column, error) => captureError(error)
window.onunhandledrejection = (event: PromiseRejectionEvent) => captureError(event.reason)

const hydrate = () => {
    if (document.readyState !== "loading")  {
        ReactDOM.render((
            <StylesheetProvider>
                <StoreProvider>
                    <Router>
                        <Route path="/" component={Application} />
                    </Router>
                </StoreProvider>
            </StylesheetProvider>
        ), document.getElementById('container'))
    } else {
        setTimeout(() => {
            hydrate()
        }, 5)
    }
}

hydrate()