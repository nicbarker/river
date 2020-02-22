import * as React from 'react'
import { interpreterStyles } from 'styles/interpreter-styles'
import { StylesheetContext } from 'context/stylesheet-context'
import { run, RuntimeLogMessage } from 'lib/interpreter'
import PlayCircleIcon from 'ionicons/dist/ionicons/svg/md-play-circle.svg'
import { StoreContext } from 'context/store-context'

export const Interpreter = () => {
    const { state, dispatch } = React.useContext(StoreContext)
    const { createStyles } = React.useContext(StylesheetContext)
    const styles = createStyles(interpreterStyles);
    const [programOutput, setProgramOutput] = React.useState<RuntimeLogMessage[]>([])

    const outputRendered = programOutput.map((line, index) => (
        <div key={index} className={styles.outputLine} onClick={line.nodeId ? () => dispatch({ type: 'SET_SELECTED_NODE', payload: { selectedNodeId: line.nodeId } }) : null}>
            <div className={styles.logTime}>{line.timestamp}</div>
            <div className={styles.logMessage}>{line.message}</div>
        </div>
    ))

    let executionTimeMessage
    if (programOutput.length > 0) {
        const executionTime = programOutput[programOutput.length - 1].timestamp - programOutput[0].timestamp
        executionTimeMessage = <>Finished in {executionTime}ms.</>
    }

    return (
        <div className={styles.container}>
            <div className={styles.interpreterHeader}>
                <div className={styles.headerButton} onClick={() => setProgramOutput(run({ nodes: state.nodes }))}>
                    <PlayCircleIcon className={styles.headerIcon} style={{ fill: '#fff' }} />Run
                </div>
            </div>
            <div className={styles.output}>
                {outputRendered}
            </div>
            <div className={styles.executionTimeMessage}>
                {executionTimeMessage}
            </div>
        </div>
    )
}