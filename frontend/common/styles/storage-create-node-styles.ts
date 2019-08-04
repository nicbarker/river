import { nodeStyles } from "styles/node-styles"
import { extendStylesheet } from "lib/stylesheet-helper"
import { colours } from "lib/colours"
import * as Color from 'color'

export const storageCreateNodeStyles = extendStylesheet(nodeStyles, {
    node: {
        background: colours.bruisedPink,
        paddingRight: 6,
    },

    nodeLabel: {
        background: Color(colours.bruisedPink).darken(0.06).hex()
    },

    nodeTypeInput: {
        background: Color(colours.bruisedPink).lighten(0.1).hex(),
        marginRight: 0
    },

    'nodeTypeInput:focus': {
        background: Color(colours.bruisedPink).lighten(0.2).hex(),
    },

    autoCompleteSuggestions: {
        background: colours.bruisedPink,
    },

    autoCompleteOuter: {
        background: colours.bruisedPink
    },

    valueTypeInput: {
        fontSize: 16,
        fontFamily: 'Noto Sans HK',
        fontWeight: 400,
        padding: 10,
        margin: 6,
        marginRight: 0,
        width: 100,
        background: Color(colours.bruisedPink).lighten(0.1).hex(),
    },

    'valueTypeInput:focus': {
        background: Color(colours.bruisedPink).lighten(0.2).hex(),
        borderRadius: 3
    },

    typeIcon: {
        marginRight: 8,
        width: 20
    }
})