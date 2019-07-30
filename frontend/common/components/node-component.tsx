import * as React from 'react';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { nodeStyles } from 'styles/node-styles';
import classNames from 'classnames'
import { RiverNode } from 'lib/interpreter';
import { Layer } from 'reducers/application-reducer';

export const RiverNodeComponent = (props: {
    node: RiverNode,
    selected?: boolean,
    activeLayer: Layer,
    onClick: () => void
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(nodeStyles);
    const inputRef = React.useRef<HTMLInputElement>()

    React.useEffect(() => {
        if (props.selected && inputRef.current) {
            inputRef.current.focus()
        }
    }, [props.selected])

    const nodeClasses = classNames(styles.node, {
        [styles.selected]: props.selected
    })

    return (
        <div className={styles.nodeOuter}>
            <div className={nodeClasses} onClick={props.onClick}>
                <input className={styles.nodeTypeInput} type='text' ref={inputRef} onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => event.stopPropagation()} />
            </div>
        </div>
    )
}