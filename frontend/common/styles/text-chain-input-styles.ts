import { rowHeight } from 'lib/constants'
import * as Color from 'color'
import { colours } from 'lib/colours';

export const textChainInputStyles = (colour: string) => ({
    textChainInputOuter: {
        background: Color(colour).lighten(0.1).hex(),
        borderRadius: 3,
        alignItems: 'center',
        minWidth: 100
    },

    textChainHasFocus: {
        background: Color(colour).lighten(0.2).hex()
    },

    textChainInputInner: {
        outline: 'none',
        whiteSpace: 'pre',
        userSelect: 'none',
        flexGrow: 1,
        position: 'relative',
        cursor: 'text',
        paddingLeft: 10,
        paddingRight: 10,
        height: '100%',
        alignItems: 'center'
    },

    cursor: {
        position: 'absolute',
        width: 2,
        height: 25,
        '-webkit-animation': '1s blink step-end infinite',
        '-moz-animation': '1s blink step-end infinite',
        '-ms-animation': '1s blink step-end infinite',
        '-o-animation': '1s blink step-end infinite',
        animation: '1s blink step-end infinite',
        'animation-timing-function': 'ease-in-out',
        '-webkit-animation-timing-function': 'ease-in-out'
    },

    autoCompleteOuter: {
        position: 'relative',
        flexGrow: 1
    },

    input: {
        fontSize: 16,
        fontFamily: 'Noto Sans HK',
        fontWeight: 400,
        height: rowHeight - 12,
        overflow: 'hidden',
        alignItems: 'center',
        whiteSpace: 'pre',
        flexGrow: 1,
    },

    hiddenInput: {
        opacity: 0,
        position: 'absolute',
        zIndex: -10
    },

    variable: {
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 3,
        height: rowHeight - 22,
        background: colours.bruisedPink,
        outline: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center'
    },

    'variable:focus': {
        boxShadow: `0px 0px 24px 6px rgba(80,80,80,0.28)`,
        fontWeight: '600',
        transform: 'scale(1.05, 1.05)'
    },

    brokenVariableReference: {
        background: colours.errorRed,
        boxShadow: `0px 0px 24px 6px rgba(80,80,80,0.28)`,
        fontWeight: '600',
        transform: 'scale(1.05, 1.05)'
    },

    wordHighlight: {
        position: 'absolute',
        borderRadius: 3,
        height: rowHeight - 22,
        background: colours.bruisedPink,
        opacity: 0.4
    },

    autoCompleteSuggestions: {
        position: 'absolute',
        flexDirection: 'column',
        alignItems: 'stretch',
        top: '130%',
        width: 180,
        boxShadow: `0px 0px 18px 6px rgba(40,40,40,0.35)`,
        background: Color(colours.bruisedPink).darken(0.02).hex(),
        borderRadius: 3,
    },

    autoCompleteSuggestionsArrow: {
        bottom: '100%',
        left: 21,
        border: 'solid transparent',
        content: '" "',
        height: 0,
        width: 0,
        zIndex: 1,
        position: 'absolute',
        pointerEvents: 'none',
        borderColor: 'rgba(0, 0, 0, 0)',
        borderBottomColor: Color(colours.bruisedPink).darken(0.02).hex(),
        borderWidth: 12,
        marginLeft: -12,
    },

    suggestion: {
        padding: 16,
        alignItems: 'center'
    }
})