import Color from 'color'
import colours from 'lib/colours'
import commonStyles from 'common/styles/application-styles'
import { extendStylesheet } from 'lib/stylesheet-helper'

export default extendStylesheet(commonStyles, {
    'tab:hover': {
        background: Color(colours[1]).darken(0.05).hex(),
        borderBottomColor: Color(colours[1]).hex(),
    },

    'tab:active': {
        background: Color(colours[1]).darken(0.1).hex()
    },

    'dark:hover': {
        borderBottomColor: Color(colours[3]).lighten(0.3).hex(),
        background: Color(colours[3]).darken(0.08).hex()
    },

    'dropdownActive:hover': {
        background: colours[3]
    },

    // Dismiss "X" button for bar notification
    'dismiss:hover': {
        background: 'rgba(100, 100, 100, 0.15)'
    },

    'dismiss:active': {
        background: 'rgba(100, 100, 100, 0.2)'
    },

    // Dropdown menu items
    'item:hover': {
        background: Color(colours[3]).darken(0.08).hex()
    },

    'item:active': {
        background: Color(colours[3]).darken(0.12).hex()
    }
})