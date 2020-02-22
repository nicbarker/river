import * as React from 'react'
import { StylesheetContext } from 'context/stylesheet-context'
import { LogNode as LogNodeType, RiverNode, TextChain } from 'lib/interpreter'
import { TextChainInput } from 'components/nodes/text-chain-input-component';
import { colours } from 'lib/colours';
import { logNodeStyles } from 'styles/log-node-styles';

export const LogNode = (props: {
    node: LogNodeType
    selected?: boolean
    setLogMessage: (message: TextChain) => void
    selectNode: () => void
    nodes: { [key: string]: RiverNode }
    focusState: number[]
}) => {
    const { createStyles } = React.useContext(StylesheetContext)
    const styles = createStyles(logNodeStyles)
    const [textChain, setTextChain] = React.useState(props.node.message)

    return (
        <div className={styles.node}>
            <div className={styles.nodeLabel}>Log</div>
            <div className={styles.nodeInner}>
                <TextChainInput
                    nodeId={props.node.id}
                    textChain={textChain}
                    updateTextChain={setTextChain}
                    saveTextChain={props.setLogMessage}
                    colour={colours.lightPurple}
                    allowVariables={true}
                    focusState={[...props.focusState, 0]}
                />
            </div>
        </div>
    )
}