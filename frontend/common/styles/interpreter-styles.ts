import * as Color from 'color';

export const interpreterStyles = {
    container: {
        width: 500,
        background: '#EFECE4',
        padding: 20,
        flexDirection: 'column',
        alignItems: 'stretch',
        zIndex: 1,
        boxShadow: '-6px 0px 8px 0px rgba(120,120,120, 0.15)',
    },

    button: {
        border: '2px solid #ccc',
        borderRadius: 5,
        flexDirection: 'row',
        paddingTop: 10,
        paddingRight: 15,
        paddingBottom: 10,
        paddingLeft: 15,
        cursor: 'pointer'
    },

    'button:hover': {
        background: Color('#EFECE4').darken(0.05).hex()
    },

    'button:active': {
        background: Color('#EFECE4').darken(0.1).hex()
    },

    header: {
        marginBottom: 15
    },

    output: {
        flexDirection: 'column'
    },

    outputLine: {
        marginBottom: 5
    }
}