import * as React from 'react'
import { addStyleObjects } from 'actions/application-actions'
import { Store } from 'redux';

const noUnits = {
    'flex': true,
    'flexGrow': true,
    'flexShrink': true,
    'fontWeight': true,
    'zIndex': true,
    'opacity': true
}

const isVendorPrefix = (attribute) => {
    return attribute.match(/\-webkit/)
}

export const extendStylesheet = function (...objects) {
    // Variables
    const extended = {}

    // Merge the object into the extended object
    var merge = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    // If we're doing a deep merge and the property is an object
                    extended[prop] = extendStylesheet(true, extended[prop], obj[prop])
                } else {
                    // Otherwise, do a regular merge
                    extended[prop] = obj[prop]
                }
            }
        }
    }

    // Loop through each object and conduct a merge
    for (let i = 0; i < objects.length; i++) {
        merge(objects[i])
    }

    return extended
}

export type ClassMap = {
    [key: string]: string
}

export type StyleObjects = {
    [key: string]: string
}

export const createStylesheetHelper = (store: Store) => {
    const classMapCache: Array<any> = []
    let classMapIndex = 0

    return (styleObject: any): ClassMap => {
        const cachedMap = classMapCache.find((cached) => cached.styleObject === styleObject)
        if (cachedMap) {
            return cachedMap.classMap
        }
        const styleObjects: StyleObjects = {}
        const classMap: ClassMap = {}

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
            classMap[className] = classNameHash

            for (const attribute of Object.keys(styleObject[className])) {
                const value = styleObject[className][attribute]
                // Converts javascript styles -> real css styles. Camel case to kebab case, no units to px
                const convertedValue = `${!isVendorPrefix(attribute) ? attribute.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : attribute}:${value}${!isNaN(value) && !noUnits[attribute] ? 'px' : '' };`
                styleObjects[classNameHash] += convertedValue
            }
        }

        store.dispatch(addStyleObjects(styleObjects))
        classMapCache.push({ styleObject, classMap })
        return classMap
    }
}

export const StylesheetContext = React.createContext({ createStylesheet: createStylesheetHelper({} as Store) });