import { nodeStyles } from 'styles/node-styles'
import { extendStylesheet } from 'context/stylesheet-context'
import { colours } from 'lib/colours'
import * as Color from 'color'

export const createVariableNodeStyles = extendStylesheet(nodeStyles, {
    node: {
        background: colours.bruisedPink,
    },

    nodeLabel: {
        background: Color(colours.bruisedPink).darken(0.06).hex()
    },

    segmentOuter: {
        marginLeft: 6
    },

    typeIcon: {
        marginRight: 6,
    },

    'nodeTypeInput:focus': {
        background: Color(colours.bruisedPink).lighten(0.2).hex(),
    },

    genericInput: {
        background: Color(colours.bruisedPink).lighten(0.1).hex(),
    },

    genericInputFocus: {
        background: Color(colours.bruisedPink).lighten(0.2).hex(),
    }
})