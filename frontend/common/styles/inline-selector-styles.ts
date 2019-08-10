import { colours } from 'lib/colours'
import * as Color from 'color'
import { rowHeight } from 'lib/constants';

export const typeSelectorStyles = (colour: string) => ({
    autoCompleteOuter: {
        position: 'relative',
        paddingRight: 0
    },

    autoCompleteInner: {
        position: 'absolute',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: 3,
        overflow: 'hidden'
    },

    autoCompleteVisible: {
        boxShadow: `0px 0px 24px 6px rgba(80,80,80,0.28), inset 0px 0px 0px 1px ${Color(colour).lighten(0.3).hex()}`,
        zIndex: 10,
    },

    autoCompleteSuggestions: {
        flexDirection: 'column',
        alignItems: 'stretch',
        background: Color(colour).lighten(0.2).hex(),
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 3,
    },

    suggestion: {
        paddingLeft: 16,
        paddingRight: 16,
        height: rowHeight,
        alignItems: 'center'
    },

    itemIcon: {
        marginRight: 8,
        width: 20
    },

    typeInput: {
        fontSize: 16,
        fontFamily: 'Noto Sans HK',
        fontWeight: 400,
        paddingLeft: 16,
        paddingRight: 16,
        height: rowHeight - 12,
        width: '100%',
        background: Color(colour).lighten(0.1).hex(),
    },

    'typeInput:focus': {
        background: Color(colour).lighten(0.2).hex(),
        borderRadius: 3
    }
})