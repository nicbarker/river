// -------------------------------------------------------------
// A react-redux container for interpereter-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { TextChainInput as TextChainInputComponent, TextChainInputProps } from 'components/nodes/text-chain-input-component'
import { Dispatch } from 'react';
import { ReduxAction } from 'actions/application-actions';
import { ApplicationState } from 'reducers/application-reducer';
import { TextChain, TextBlockType } from 'lib/interpreter';

const mapStateToProps = (state: ApplicationState, ownProps: {
    textChain: TextChain
    nodeId: string,
    focusParent: () => void
    innerRef: React.RefObject<any>
    onInputKeyDown?: (event: React.KeyboardEvent) => void
    updateTextChain: (message: TextChain) => void
    saveTextChain: (message: TextChain) => void
    allowVariables?: boolean
    placeholder?: string
    colour: string
}): Partial<TextChainInputProps> => {
    return {
        nodes: state.nodes
    }
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>): Partial<TextChainInputProps> => {
    return {}
}

export const TextChainInput = connect(
    mapStateToProps,
    mapDispatchToProps
)(TextChainInputComponent)