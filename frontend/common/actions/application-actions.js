// -------------------------------------------------------------
// Redux actions for interacting with the global application state.
// -------------------------------------------------------------

export const addStyleObjects = (styleObjects) => {
    return {
        type: 'ADD_STYLE_OBJECTS',
        payload: { styleObjects }
    }
}

// Set the description for meta tags
export const setPageMetadata = (pageMetadata) => {
    return {
        type: 'SET_PAGE_METADATA',
        payload: { pageMetadata }
    }
}