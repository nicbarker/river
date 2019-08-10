import { rowHeight } from 'lib/constants'
import * as Color from 'color'
import { colours } from 'lib/colours';

export const textChainInputStyles = (colour: string) => ({
    textChainInputOuter: {
        background: Color(colour).lighten(0.1).hex(),
        borderRadius: 3,
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        minWidth: 100
    },

    textChainHasFocus: {
        background: Color(colour).lighten(0.2).hex()
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
        position: 'absolute',
        fontSize: 16,
        fontFamily: 'Noto Sans HK',
        fontWeight: 400,
        height: rowHeight - 12,
        overflow: 'hidden',
        alignItems: 'center',
        color: 'rgba(0,0,0,0)',
        caretColor: '#000',
        flexGrow: 1,
    },

    variable: {
        padding: 8,
        borderRadius: 3,
        alignItems: 'center',
        height: rowHeight - 22,
        background: colours.bruisedPink,
        outline: 'none',
        userSelect: 'none'
    },

    'variable:focus': {
        boxShadow: `0px 0px 24px 6px rgba(80,80,80,0.28)`,
        fontWeight: '600',
        transform: 'scale(1.05, 1.05)'
    },

    autoCompleteSuggestions: {
        position: 'absolute',
        flexDirection: 'column',
        alignItems: 'stretch',
        top: '100%',
        width: '100%',
        background: colour,
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 3,
    },

    suggestion: {
        padding: 16,
        alignItems: 'center'
    }
})