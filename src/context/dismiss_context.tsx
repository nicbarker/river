import React from "react";

export type DismissMap = Function[];
export const DismissContext = React.createContext<DismissMap>([]);

export const DismissProvider = DismissContext.Provider;
