const initialState = {
    contentHashes: {},
    styles: {},
    authenticatedUser: null,
    userSettings: {},
    barNotification: null,
    decks: [],
    cards: [],
    reviews: [],
    reviewSessions: [],
    currentlyLoading: {},
    userCardCount: 0,
    cardsAddedTodayCount: 0,
    pageMetadata: {
        title: 'River',
        description: 'River is an experimental non text-based programming language and development environment.'
    },
    nextReviewTime: null
}

export const applicationReducer = (state = initialState, action) => {
    let newState = Object.assign({}, state)
    // --------------------------------------------------
    // Adds style objects to be rendered into the <head> tag
    // --------------------------------------------------
    if (action.type === 'ADD_STYLE_OBJECTS') {
        newState.styles = Object.assign({}, newState.styles, action.payload.styleObjects)
    }
    // --------------------------------------------------
    // Description for meta tags
    // --------------------------------------------------
    else if (action.type === 'SET_PAGE_METADATA') {
        newState.pageMetadata = Object.assign(newState.pageMetadata, action.payload.pageMetadata)
    }

    return newState
}

applicationReducer