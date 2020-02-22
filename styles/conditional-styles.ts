import { colours } from "lib/colours"
import * as Color from 'color'

export const conditionalStyles = {
    conditionalNode: {
        position: 'relative',
        background: Color(colours.greyYellow).darken(0.05).hex()
    },

    operator: {
        paddingLeft: 16,
        paddingRight: 16,
        alignItems: 'center',
        fontWeight: 600
    },

    connector: {
        position: 'absolute',
        height: 16,
        width: 8,
        left: 25,
        bottom: -16,
        background: Color(colours.greyYellow).darken(0.15).hex()
    }
}