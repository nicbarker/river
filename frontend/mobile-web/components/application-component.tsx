import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { initialize } from 'lib/global-keyboard-listener'
// Application components

export const Application = (props: {
    reduxState: any
}) => {
    React.useEffect(initialize, [])

return (
        <Switch>
            <Route path='/'>
                <div>Hello World</div>
            </Route>
        </Switch>
    )
}