import { nodeStyles } from 'styles/node-styles'
import { extendStylesheet } from 'context/stylesheet-context'
import { colours } from 'lib/colours'
import * as Color from 'color'

export const precursorNodeStyles = extendStylesheet(nodeStyles, {
    node: {
        background: colours.lightPurple,
    },

    nodeLabel: {
        background: Color(colours.lightPurple).darken(0.06).hex()
    }
})