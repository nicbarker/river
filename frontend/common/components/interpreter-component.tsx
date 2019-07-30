import * as React from 'react'
import { interpreterStyles } from 'styles/interpreter-styles';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { ApplicationState } from 'reducers/application-reducer';
import { run, RuntimeLogMessage } from 'lib/interpreter';

export const Interpreter = (props: {
    reduxState: ApplicationState
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(interpreterStyles);
    const [programOutput, setProgramOutput] = React.useState<RuntimeLogMessage[]>([])

    const outputRendered = programOutput.map((line, index) => (
        <div key={index} className={styles.outputLine}>
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
            <div className={styles.header}>
                <div className={styles.button} onClick={() => setProgramOutput(run({ nodes: props.reduxState.nodes }))}>Run</div>
            </div>
            <div className={styles.output}>
                {outputRendered}
            </div>
            <div>
                {executionTimeMessage}
            </div>
        </div>
    )
}