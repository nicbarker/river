import * as React from 'react'
import { interpreterStyles } from 'styles/interpreter-styles';
import { StylesheetContext } from 'lib/stylesheet-helper';
import { ApplicationState } from 'reducers/application-reducer';
import { run } from 'lib/interpreter';

export const Interpreter = (props: {
    reduxState: ApplicationState
}) => {
    const { createStylesheet } = React.useContext(StylesheetContext)
    const styles = createStylesheet(interpreterStyles);
    const [programOutput, setProgramOutput] = React.useState<String[]>([])

    const outputRendered = programOutput.map((line, index) => (
        <div key={index} className={styles.outputLine}>{line}</div>
    ))

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.button} onClick={() => setProgramOutput(run({ nodes: props.reduxState.nodes }))}>Run</div>
            </div>
            <div className={styles.output}>
                {outputRendered}
            </div>
        </div>
    )
}