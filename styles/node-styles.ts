import * as Color from 'color'
import { colours } from 'lib/colours';
import { rowHeight } from 'lib/constants';

export const nodeStyles = {
    nodeOuter: {
        outline: 'none',
        flexDirection: 'column',
        alignItems: 'stretch'
    },

    subNode: {
        flexDirection: 'column',
        alignItems: 'flex-start'
    },

    subNodeSelected: {
        background: Color(colours.darkGreySlate).lighten(0.3).hex()
    },

    node: {
        cursor: 'pointer',
        borderRadius: 3,
        flexDirection: 'row',
        alignItems: 'stretch',
        outline: 'none',
        height: rowHeight,
        marginTop: 8,
        marginBottom: 8,
        marginLeft: 18,
        marginRight: 18,
    },

    nodeInner: {
        alignItems: 'stretch',
        padding: 6
    },

    selected: {
        background: Color(colours.darkGreySlate).lighten(0.2).hex()
    },

    error: {
        background: Color(colours.errorRed).fade(0.8).rgb().toString()
    },

    errorSelected: {
        background: Color(colours.errorRed).fade(0.6).rgb().toString()
    },

    dragSelectionOverlayOuter: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative'
    },

    dragSelectionOverlay: {
        background: Color(colours.lightBlue).fade(0.7).rgb().toString(),
        zIndex: 11,
        width: '100%',
        height: '100%',
        position: 'absolute',
        borderRadius: 3
    },

    nodeLabel: {
        paddingLeft: 16,
        paddingRight: 16,
        alignItems: 'center',
        color: '#111',
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3
    },

    labelIcon: {
        width: 26,
    },

    genericInput: {
        fontSize: 16,
        fontFamily: 'Noto Sans HK',
        fontWeight: 400,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        borderRadius: 3,
    }
}