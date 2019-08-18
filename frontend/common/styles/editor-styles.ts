import { colours } from 'lib/colours'
import * as Color from 'color'
import { rowHeight } from 'lib/constants';

export const editorStyles = {
    editorOuter: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        background: Color(colours.darkGreySlate).darken(0.02).hex(),
        outline: 'none',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        width: 0
    },

    editorHeader: {
        height: rowHeight,
        flexShrink: 0,
        background: Color(colours.darkGreySlate).darken(0.4).hex(),
    },

    headerButton: {
        fontWeight: 600,
        position: 'relative',
        userSelect: 'none'
    },

    headerButtonText: {
        paddingLeft: 18,
        paddingRight: 18,
        height: rowHeight,
        alignItems: 'center',
        color: '#eee',
        cursor: 'pointer',
        background: Color(colours.darkGreySlate).darken(0.3).hex(),
    },

    'headerButton:hover': {
        background: Color(colours.darkGreySlate).darken(0.25).hex(),
    },

    active: {
        cursor: 'default',
        background: Color(colours.darkGreySlate).darken(0.02).hex(),
    },

    'active:hover': {
        background: Color(colours.darkGreySlate).darken(0.02).hex(),
    },

    dropdownVisible: {
        zIndex: 11,
        cursor: 'pointer',
        background: Color(colours.lightPurple).darken(0.1).hex(),
    },

    headerDropdownOuter: {
        position: 'absolute',
        top: 0,
        width: 210,
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 3,
    },

    headerDropdownButtonBehind: {
        background: Color(colours.lightPurple).darken(0.1).hex(),
        height: rowHeight,
        paddingLeft: 18,
        paddingRight: 18,
        alignItems: 'center',
        zIndex: 9,
        boxShadow:  '0px 0px 14px 3px rgba(0,0,0,0.28)'
    },

    dropdownItems: {
        background: Color(colours.lightPurple).darken(0.1).hex(),
        flexDirection: 'column',
        alignItems: 'stretch',
        boxShadow:  '0px 0px 14px 3px rgba(0,0,0,0.28)',
        zIndex: 10
    },

    dropdownItem: {
        color: '#fff',
        height: rowHeight,
        alignItems: 'center',
        paddingLeft: 18,
        paddingRight: 18,
        cursor: 'pointer'
    },

    'dropdownItem:hover': {
        background: Color(colours.lightPurple).darken(0.2).hex(),
    },

    'dropdownItem:active': {
        background: Color(colours.lightPurple).darken(0.3).hex(),
    },

    fileMenuIcon: {
        fill: '#fff',
        marginRight: 14,
        width: 29,
    },

    nodes: {
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingTop: 18,
        paddingBottom: 18
    },

    nodesScrollContainer: {
        overflow: 'auto',
        userSelect: 'none',
        height: '100%',
        position: 'relative'
    },

    pressEnterMessage: {
        marginTop: 18,
        marginLeft: 18,
        fontSize: 20,
        fontWeight: 200,
        color: '#ccc'
    },

    dragSelection: {
        position: 'absolute',
        background: Color(colours.lightBlue).fade(0.7).rgb().toString(),
        border: `2px solid ${colours.lightBlue}`,
        zIndex: 12
    }
}