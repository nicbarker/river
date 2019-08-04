import * as Color from 'color'
import { colours } from 'lib/colours';
import { rowHeight } from 'lib/constants';

export const nodeStyles = {
    node: {
        cursor: 'pointer',
        background: colours.lightPurple,
        borderRadius: 3,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'stretch',
        outline: 'none',
        height: rowHeight,
    },

    nodeOuter: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 18,
        paddingRight: 18,
        outline: 'none'
    },

    selected: {
        background: Color(colours.darkGreySlate).lighten(0.07).hex()
    },

    nodeLabel: {
        paddingLeft: 16,
        paddingRight: 16,
        alignItems: 'center',
        color: '#111',
        background: Color(colours.lightPurple).darken(0.1).hex()
    },

    labelIcon: {
        width: 26,
    },

    autoCompleteVisible: {
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        zIndex: 1,
    },

    nodeTypeInput: {
        fontSize: 16,
        fontFamily: 'Noto Sans HK',
        fontWeight: 400,
        padding: 10,
        margin: 6,
        borderRadius: 3,
        background: Color(colours.lightPurple).lighten(0.1).hex(),
    },

    'nodeTypeInput:focus': {
        background: Color(colours.lightPurple).lighten(0.2).hex(),
    },

    autoCompleteOuter: {
        position: 'relative'
    },

    autoCompleteSuggestions: {
        position: 'absolute',
        flexDirection: 'column',
        alignItems: 'stretch',
        top: '100%',
        width: '100%',
        background: colours.lightPurple,
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 3,
    },

    suggestion: {
        padding: 16,
        alignItems: 'center'
    }
}