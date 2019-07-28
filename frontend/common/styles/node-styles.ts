import * as Color from 'color'

export const nodeStyles = {
    node: {
        marginBottom: 15,
        cursor: 'pointer',
        padding: 15,
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
    }
}