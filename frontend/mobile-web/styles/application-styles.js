import colours from 'lib/colours'
import Color from 'color'
import { extendStylesheet } from 'lib/stylesheet-helper'
import commonStyles from 'common/styles/application-styles'

export default extendStylesheet(commonStyles, {
    mobileMenu: {
        zIndex: 7,
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        background: colours[1],
        flexDirection: 'column',
        padding: 30,
        paddingTop: 50,
    },

    tab: {
        paddingLeft: 13,
        paddingRight: 13
    },

    home: {
        fontSize: 22,
        paddingLeft: 8,
        paddingRight: 8
    },

    message: {
        textAlign: 'left'
    },

    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 50,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        color: colours[4],
        fontSize: 24,
    },

    menuUpper: {
        paddingBottom: 20,
        borderBottomStyle: 'solid',
        borderBottomWidth: 2,
        borderBottomColor: '#fff',
        marginBottom: 15,
        flexDirection: 'column',
    },

    menuMessage: {
        textAlign: 'left',
    },

    menuTitle: {
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 5,
    },

    cardCount: {
        fontSize: 14,
        color: colours[3],
    },

    menuButton: {
        height: 50,
        color: colours[4],
        alignItems: 'center',
        background: colours[1],
        position: 'relative',
        display: 'flex'
    },

    menuButtonText: {
        flexGrow: 1,
    },

    menuButtonIcon: {
        width: 22,
        marginRight: 15,
        color: Color(colours[4]).lighten(0.4).hex(),
    },

    empty: {
        visibility: 'hidden',
    },

    dismissIcon: {
        width: 40,
        height: 40
    },

    dismiss: {
        marginRight: 0,
    },
})