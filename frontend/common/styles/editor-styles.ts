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
        background: Color(colours.darkGreySlate).darken(0.4).hex(),
    },

    headerButton: {
        padding: 18,
        marginRight: 18,
        fontWeight: 600,
        cursor: 'pointer',
        color: '#eee',
        background: Color(colours.darkGreySlate).darken(0.3).hex(),
    },

    headerButtonActive: {
        cursor: 'default',
        color: '#fff',
        background: Color(colours.darkGreySlate).darken(0.02).hex(),
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
        height: '100%'
    },

    pressEnterMessage: {
        marginTop: 18,
        marginLeft: 18  ,
        fontSize: 20,
        fontWeight: 200,
        color: '#ccc'
    }
}