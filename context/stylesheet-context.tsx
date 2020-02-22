import * as React from 'react'

const noUnits: { [key: string]: boolean } = {
    'flex': true,
    'flexGrow': true,
    'flexShrink': true,
    'fontWeight': true,
    'zIndex': true,
    'opacity': true
}

const isVendorPrefix = (attribute: string) => {
    return attribute.match(/\-webkit/)
}

export const extendStylesheet = <A extends StyleObject, B extends StyleObject>(baseStyles: A, extendedStyles: B): A & B => {
    // Variables
    let extended: A & B  = {} as A & B

    // Merge the object into the extended object
    var merge = function (obj: A | B) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                extended = {...extended, ...{ [prop]: { ...extended[prop], ...obj[prop] } } }
            }
        }
    }

    merge(baseStyles)
    merge(extendedStyles)

    return extended
}

export type ClassMap = {
    [key: string]: string
}

export type StyleObjects = {
    [key: string]: string
}

export type StyleObject = {
    [key: string]: {
        [key in keyof React.CSSProperties]: string | number
    }
}

const createStylesheetHelper = (dispatch: React.Dispatch<StyleObjects>) => {
    const classMapCache: Array<any> = []
    let classMapIndex = 0

    return <T extends StyleObject, K extends keyof T>(styleObject: T): { [U in keyof T]?: string } => {
        const cachedMap = classMapCache.find((cached) => JSON.stringify(cached.styleObject) === JSON.stringify(styleObject))
        if (cachedMap) {
            return cachedMap.classMap
        }
        const styleObjects: StyleObjects = {}
        const classMap: { [k in keyof T]?: string } = {}

        const classNames = Object.keys(styleObject)
        for (let i = 0; i < classNames.length; i++) {
            let className = classNames[i]
            let classNameHash

            const split = className.split(':')
            if (split.length > 1) {
                classNameHash = `${classMap[split[0]]}` + ':' + split[1]
            } else {
                classNameHash = `${className}_${classMapIndex++}`
            }

            styleObjects[classNameHash] = ''
            classMap[className as K] = classNameHash

            for (const attribute of Object.keys(styleObject[className])) {
                const value = styleObject[className][attribute]
                // Converts javascript styles -> real css styles. Camel case to kebab case, no units to px
                const convertedValue = `${!isVendorPrefix(attribute) ? attribute.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : attribute}:${value}${!isNaN(value as number) && !noUnits[attribute] ? 'px' : '' };`
                styleObjects[classNameHash] += convertedValue
            }
        }

        dispatch(styleObjects)
        classMapCache.push({ styleObject, classMap })
        return classMap
    }
}

const reducer = (state: StyleObjects, newStyles: StyleObjects) => Object.assign({}, state, newStyles)

export const StylesheetContext = React.createContext({ styles: {} as StyleObjects, createStyles: createStylesheetHelper(() => void 0) });

export const StylesheetProvider = ({ children }: { children: React.ReactElement}) => {
    const [state, dispatch] = React.useReducer(reducer, {})
    const createStyles = React.useRef(createStylesheetHelper(dispatch))
    return (
        <StylesheetContext.Provider value={{ styles: state, createStyles: createStyles.current }}>
            {children}
        </StylesheetContext.Provider>
    );
};