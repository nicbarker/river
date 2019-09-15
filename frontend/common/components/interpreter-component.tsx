import * as React from 'react'
import { interpreterStyles } from 'styles/interpreter-styles'
import { StylesheetContext } from 'lib/stylesheet-helper'
import { run, RuntimeLogMessage, RiverNode } from 'lib/interpreter'
import PlayCircleIcon from 'ionicons/dist/ionicons/svg/ios-play-circle.svg'

export type InterpreterProps = {
    nodes: { [id: string]: RiverNode },
    setSelectedNode: (nodeId: string) => void
}

export const Interpreter = (props: InterpreterProps) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(interpreterStyles);
    const [programOutput, setProgramOutput] = React.useState<RuntimeLogMessage[]>([])

    const outputRendered = programOutput.map((line, index) => (
        <div key={index} className={styles.outputLine} onClick={line.nodeId ? () => props.setSelectedNode(line.nodeId) : null}>
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
                <div className={styles.headerButton} onClick={() => setProgramOutput(run({ nodes: props.nodes }))}>
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