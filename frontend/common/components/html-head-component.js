import React from 'react'
import { Component } from 'react'

export default class HTMLHeadComponent extends Component {

    constructor (props) {
        super(props)
    }

    render () {
        return (
            <head>
                <meta charSet="UTF-8" />
                <title>{this.props.reduxState.pageMetadata.title}</title>
                <meta name="description" content={this.props.reduxState.pageMetadata.description} />

                {this.props.metaTags}

                <script async src={`${process.env.FRONTEND_URL}${this.props.reduxState.contentHashes[this.props.platformKey]['js']}`}></script>

                <link rel="apple-touch-icon" sizes="180x180" href={process.env.FRONTEND_URL + '/apple-touch-icon.png'} />
                <link rel="icon" type="image/png" sizes="32x32" href={process.env.FRONTEND_URL + '/favicon-32x32.png'} />
                <link rel="icon" type="image/png" sizes="16x16" href={process.env.FRONTEND_URL + '/favicon-16x16.png'} />
                <link rel="manifest" href={process.env.FRONTEND_URL + '/site.webmanifest'} />
                <link rel="mask-icon" href={process.env.FRONTEND_URL + '/safari-pinned-tab.svg'} color="#cdb380" />
                <meta name="msapplication-TileColor" content="#da532c" />
                <meta name="theme-color" content="#ffffff" />
                <style>
                {`
                    body, html {
                        width: 100%;
                        height: 100%;
                    }

                    body, html, div, input {
                        display: flex;
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                        font-family: 'Open Sans';
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
                        font-family: 'Open Sans';
                    }

                    abbr {
                        display: inline;
                    }

                    @-webkit-keyframes load8 {
                        0% {
                            -webkit-transform: rotate(0deg);
                            transform: rotate(0deg);
                        }
                        100% {
                            -webkit-transform: rotate(360deg);
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes load8 {
                        0% {
                            -webkit-transform: rotate(0deg);
                            transform: rotate(0deg);
                        }
                        100% {
                            -webkit-transform: rotate(360deg);
                            transform: rotate(360deg);
                        }
                    }
                `}
                </style>
                <style>
                    {Object.keys(this.props.reduxState.styles).length === 0 ? '__REACT_STYLES_PLACEHOLDER__' : Object.keys(this.props.reduxState.styles).map(className => `.${className}{${this.props.reduxState.styles[className]}}`).join('')}
                </style>
                <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400" rel="stylesheet" />
            </head>
        )
    }
}