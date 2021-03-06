import * as Color from 'color'
import { colours } from 'lib/colours'
import { rowHeight } from 'lib/constants';

export const interpreterStyles = {
    container: {
        width: 500,
        background: Color(colours.darkGreySlate).lighten(0.1).hex(),
        flexDirection: 'column',
        alignItems: 'stretch',
        zIndex: 1,
        overflowY: 'scroll',
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        flexShrink: 0
    },

    interpreterHeader: {
        height: rowHeight,
        background: Color(colours.lightPurple).darken(0.5).hex(),
    },

    headerButton: {
        padding: 18,
        marginRight: 18,
        fontWeight: 500,
        cursor: 'pointer',
        color: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        background: Color(colours.lightPurple).darken(0.4).hex(),
    },

    'headerButton:hover': {
        background: Color(colours.lightPurple).darken(0.41).hex(),
    },

    'headerButton:active': {
        background: Color(colours.lightPurple).darken(0.45).hex(),
    },

    headerIcon: {
        width: 26,
        marginRight: 8
    },

    output: {
        flexDirection: 'column',
        marginBottom: 15,
        padding: 20,
    },

    outputLine: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        cursor: 'pointer',
    },

    'outputLine:hover': {
        fontWeight: 500
    },

    logTime: {
        fontSize: 12,
        color: '#ccc',
        marginRight: 16,
        paddingTop: 4
    },

    logMessage: {
        color: '#fff'
    },

    executionTimeMessage: {
        color: '#fff',
        paddingLeft: 20,
    }
}