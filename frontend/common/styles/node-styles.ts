import * as Color from 'color'
import { colours } from 'lib/colours';
import { rowHeight } from 'lib/constants';

export const nodeStyles = {
    nodeOuter: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 18,
        paddingRight: 18,
        outline: 'none'
    },

    node: {
        cursor: 'pointer',
        borderRadius: 3,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'stretch',
        outline: 'none',
        height: rowHeight,
    },

    nodeInner: {
        alignItems: 'stretch',
        padding: 6
    },

    selected: {
        background: Color(colours.darkGreySlate).lighten(0.07).hex()
    },

    nodeLabel: {
        paddingLeft: 16,
        paddingRight: 16,
        alignItems: 'center',
        color: '#111',
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