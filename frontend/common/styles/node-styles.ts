import * as Color from 'color'

export const nodeStyles = {
    nodeOuter: {
        position: 'relative'
    },

    logCursor: {
        position: 'absolute',
        bottom: -1,
        left: -5,
        width: 200,
        height: 2,
        background: '#0B486B'
    },

    logCursorCenterCircle: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 16,
        left: 88,
        top: -7,
        background: '#E4F1F4',
        borderWidth: 2,
        borderColor: '#0B486B',
        borderStyle: 'solid'
    },

    node: {
        marginTop: 8,
        marginBottom: 8,
        cursor: 'pointer',
        padding: 16,
        background: '#B9CFD2',
        borderRadius: 5,
        transition: 'transform 0.2s ease',
        transform: 'translate(0px)'
    },

    selected: {
        transform: 'translate(5px)',
        background: Color('#B9CFD2').darken(0.1).hex()
    },

    'node:hover': {
        background: Color('#B9CFD2').darken(0.05).hex()
    },

    'node:active': {
        background: Color('#B9CFD2').darken(0.1).hex()
    },

    nodeTypeInput: {
        fontSize: 16,
        fontFamily: 'Open Sans',
        fontWeight: 400
    }
}