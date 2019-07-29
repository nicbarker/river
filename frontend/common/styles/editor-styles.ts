export const editorStyles = {
    editorOuter: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        background: '#E4F1F4',
        borderRight: '1px solid #eee',
        overflowY: 'scroll'
    },

    editorHeader: {
        padding: 15,
    },

    headerButton: {
        marginRight: 15,
        fontWeight: 600,
        cursor: 'pointer',
        color: '#aaa'
    },

    'headerButton:hover': {
        color: '#999'
    },

    headerButtonActive: {
        color: '#3B8686',
        textDecoration: 'underline',
        cursor: 'default'
    },

    'headerButtonActive:hover': {
        color: '#3B8686',
    },

    nodes: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 15
    },

    pressEnterMessage: {
        fontSize: 20,
        fontWeight: 200,
        color: '#ccc'
    }
}