// -------------------------------------------------------------
// This is the outer application wrapper for River.
// It kicks off the react application.
// -------------------------------------------------------------

import * as React from 'react'
import { Application } from 'components/application-component'
import { StylesheetProvider } from 'context/stylesheet-context'
import { StoreProvider } from 'context/store-context'
import { InteractionProvider } from 'context/interaction-context'
import Head from 'next/head'

// Load sentry if an error occurs
const captureError = async (error: any) => {
    const { logError } = await import(/* webpackChunkName: "sentry" */ 'lib/sentry')
    logError(error)
}

// window.onerror = (message, url, line, column, error) => captureError(error)
// window.onunhandledrejection = (event: PromiseRejectionEvent) => captureError(event.reason)

const River = () => (
    <>
        <Head>
            <link href="https://fonts.googleapis.com/css?family=Noto+Sans+HK:300,400,500&display=swap" rel="stylesheet" />
            <style>{`
                body, html, #__next {
                    width: 100%;
                    height: 100%;
                }

                body, html, div, input {
                    display: flex;
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: 'Noto Sans HK';
                }

                input, textarea {
                    outline: none;
                    border: none;
                    padding: none;
                    resize: none;
                    background: none;
                }

                a {
                    text-decoration: none;
                    color: inherit;
                    font-family: 'Noto Sans HK';
                }

                abbr {
                    display: inline;
                }

                #container {
                    width: 100%;
                    height: 100%;
                }

                @keyframes "blink" {
                    from, to {
                        background: #2e4d63;
                    }
                    50% {
                        background: transparent;
                    }
                }

                @-moz-keyframes blink {
                    from, to {
                        background: #2e4d63;
                    }
                    50% {
                        background: transparent;
                    }
                }

                @-webkit-keyframes "blink" {
                    from, to {
                        background: #2e4d63;
                    }
                    50% {
                        background: transparent;
                    }
                }

                @-ms-keyframes "blink" {
                    from, to {
                        background: #2e4d63;
                    }
                    50% {
                        background: transparent;
                    }
                }

                @-o-keyframes "blink" {
                    from, to {
                        background: #2e4d63;
                    }
                    50% {
                        background: transparent;
                    }
                }`}
            </style>
        </Head>
        <StylesheetProvider>
            <StoreProvider>
                <InteractionProvider>
                    <Application />
                </InteractionProvider>
            </StoreProvider>
        </StylesheetProvider>
    </>
)

export default River