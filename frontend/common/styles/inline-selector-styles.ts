import * as Color from 'color'
import { rowHeight } from 'lib/constants';

export const inlineSelectorStyles = (colour: string) => ({
    autoCompleteOuter: {
        paddingRight: 0
    },

    autoCompleteInner: {
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: 3,
    },

    autoCompleteVisible: {
        boxShadow: `0px 0px 14px 3px rgba(0,0,0,0.28), inset 0px 0px 0px 1px ${Color(colour).lighten(0.3).hex()}`,
        zIndex: 10,
    },

    autoCompleteSuggestions: {
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'column',
        alignItems: 'stretch',
        background: Color(colour).lighten(0.2).hex(),
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 3,
        marginTop: -1
    },

    suggestion: {
        paddingLeft: 12,
        paddingRight: 12,
        height: rowHeight - 6,
        alignItems: 'center'
    },

    suggestionSelected: {
        background: Color(colour).lighten(0.3).hex()
    },

    noMatches: {
        color: Color(colour).darken(0.5).hex()
    },

    itemIcon: {
        marginRight: 8,
        width: 20,
        fill: Color(colour).darken(0.5).hex()
    }
})