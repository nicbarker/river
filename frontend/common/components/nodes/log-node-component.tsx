import * as React from 'react'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { LogNode as LogNodeType, RiverNode, TextChain } from 'lib/interpreter'
import { TextChainInput } from 'containers/text-chain-input-container';
import { colours } from 'lib/colours';
import { logNodeStyles } from 'styles/log-node-styles';

export const LogNode = (props: {
    node: LogNodeType
    innerRef: React.RefObject<any>
    focusParent: () => void
    selected?: boolean
    setLogMessage: (message: TextChain) => void
    selectNode: () => void
    nodes: { [key: string]: RiverNode }
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(logNodeStyles)
    const [textChain, setTextChain] = React.useState(props.node.message)
    React.useEffect(() => {
        props.innerRef.current.focus()
    }, [])

    return (
        <div className={styles.node}>
            <div className={styles.nodeLabel} ref={props.innerRef}>Log</div>
            <div className={styles.nodeInner}>
                <TextChainInput
                    nodeId={props.node.id}
                    focusParent={props.focusParent}
                    textChain={textChain}
                    updateTextChain={setTextChain}
                    saveTextChain={props.setLogMessage}
                    innerRef={props.innerRef}
                    colour={colours.lightPurple}
                    allowVariables={true}
                />
            </div>
        </div>
    )
}