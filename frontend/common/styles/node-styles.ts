import * as Color from 'color'

export const nodeStyles = {
    node: {
        marginTop: 8,
        marginBottom: 8,
        cursor: 'pointer',
        background: '#B9CFD2',
        borderRadius: 5,
        transition: 'transform 0.2s ease',
        transform: 'translate(0px)',
        flexDirection: 'column',
        alignItems: 'stretch',
        outline: 'none'
    },

    nodeOuter: {
        outline: 'none'
    },

    'node:hover': {
        background: Color('#B9CFD2').darken(0.05).hex()
    },

    'node:active': {
        background: Color('#B9CFD2').darken(0.1).hex()
    },

    selected: {
        transform: 'translate(5px)',
        background: Color('#B9CFD2').darken(0.1).hex()
    },

    'selected:hover': {
        background: Color('#B9CFD2').darken(0.1).hex()
    },

    'selected:active': {
        background: Color('#B9CFD2').darken(0.1).hex()
    },

    nodeInner: {
        padding: 16
    },

    autoCompleteVisible: {
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        zIndex: 1,
    },

    nodeTypeInput: {
        fontSize: 16,
        fontFamily: 'Open Sans',
        fontWeight: 400,
        padding: 16
    },

    autoCompleteSuggestions: {
        position: 'absolute',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderTop: '1px solid ' + Color('#B9CFD2').darken(0.2).hex(),
        top: '100%',
        width: '100%',
        background: Color('#B9CFD2').darken(0.1).hex(),
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },

    suggestion: {
        padding: 16
    }
}