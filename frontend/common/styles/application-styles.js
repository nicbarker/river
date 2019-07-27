import colours from 'lib/colours'
import Color from 'color'

export default {
    html: {
        fontFamily: 'Open Sans',
        height: '100%',
        width: '100%',
    },

    body: {
        width: '100%',
        flexGrow: 1,
        alignItems: 'stretch',
    },

    container: {
        width: '100%',
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
    },

    tabBar: {
        background: colours[1],
        flexShrink: 0,
        height: 50,
        alignItems: 'stretch',
    },

    tab: {
        position: 'relative',
        paddingTop: 0,
        paddingRight: 15,
        paddingBottom: 0,
        paddingLeft: 15,
        cursor: 'pointer',
        background: colours[1],
        borderBottomStyle: 'solid',
        borderBottomWidth: 5,
        borderBottomColor: Color(colours[1]).lighten(0.05).hex(),
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex'
    },

    home: {
        color: colours[3],
        fontSize: 26,
        paddingTop: 0,
        paddingRight: 10,
        paddingBottom: 0,
        paddingLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        background: colours[2],
        borderBottomStyle: 'solid',
        borderBottomWidth: 5,
        borderBottomColor: Color(colours[2]).lighten(0.05).hex(),
        display: 'flex'
    },

    dark: {
        borderBottomColor: Color(colours[3]).lighten(0.4).hex(),
        color: colours[1],
        background: colours[3]
    },

    notificationBubble: {
        position: 'absolute',
        top: -1,
        right: -4,
        borderRadius: 24,
        width: 22,
        height: 22,
        background: colours[7],
        fontSize: 10,
        fontWeight: 400,
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
    },

    noBackground: {
        background: 'none',
    },

    link: {
        textDecoration: 'none',
        color: colours[4],
    },

    divider: {
        paddingTop: 10,
        paddingRight: 0,
        paddingBottom: 10,
        paddingLeft: 0,
        flexGrow: 1,
        borderBottomStyle: 'solid',
        borderBottomWidth: 5,
        borderBottomColor: Color(colours[1]).lighten(0.05).hex(),
    },

    small: {
        flexGrow: 0,
        width: 15,
    },

    dropdown: {
        position: 'relative',
        padding: 0
    },

    dropdownActive: {
        background: colours[3]
    },

    dropdownIcon: {
        width: 26,
        height: '100%',
        paddingLeft: 15,
        paddingRight: 15
    },

    dropdownIconActive: {
        color: '#fff'
    },

    menu: {
        position: 'absolute',
        top: '100%',
        flexDirection: 'column',
        border: 'none',
        color: '#fff',
        right: 0,
        margin: 0,
        zIndex: 10,
        width: 180,
        background: colours[3],
        width: 180,
    },

    menuHeader: {
        color: '#fff',
        fontSize: 14,
        paddingTop: 15,
        paddingRight: 10,
        paddingBottom: 15,
        paddingLeft: 10,
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: Color(colours[3]).lighten(0.4).hex(),
    },

    menuInner: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },

    item: {
        display: 'block',
        fontWeight: 200,
        textAlign: 'left',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative',
        fontSize: 14,
        paddingTop: 15,
        paddingRight: 10,
        paddingBottom: 15,
        paddingLeft: 10,
        background: colours[3]
    },

    itemIcon: {
        fontSize: 17,
        marginRight: 15,
        width: 20,
        height: 20,
    },

    barNotification: {
        alignItems: 'stretch',
        flexDirection: 'row',
        flexShrink: 0
    },

    message: {
        flexGrow: 1,
        textDecoration: 'none',
        color: colours[5],
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        textAlign: 'center',
        paddingTop: 8,
        paddingRight: 15,
        paddingBottom: 8,
        paddingLeft: 15,
        minHeight: 32
    },

    info: {
        background: colours[6],
    },

    error: {
        background: colours[7],
    },

    dismiss: {
        alignItems: 'center',
        paddingTop: 0,
        paddingRight: 10,
        paddingBottom: 0,
        paddingLeft: 10,
        marginRight: 15,
        cursor: 'pointer',
    },

    dismissIcon: {
        width: 35,
        height: 35,
    },

    lower: {
        flexGrow: 1,
        minHeight: 0, // This limits the container to the height of the screen on firefox / chromium
    },
}