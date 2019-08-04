// -------------------------------------------------------------
// A react-redux container for node-outer-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { NodeOuter as NodeOuterComponent } from 'components/nodes/node-outer-component'
import { ApplicationState } from 'reducers/application-reducer';
import { Dispatch } from 'react';
import { ReduxAction, deleteNode, setNodeType, setSelectedNode, setLogMessage, setStorageCreateValueType, setStorageCreateLabel, setStorageCreateValue } from 'actions/application-actions';
import { NodeType, ValueType } from 'lib/interpreter';
import { NodeOuterProps } from 'components/nodes/node-outer-component';

const mapStateToProps = (state: ApplicationState, ownProps: { nodeId: string, focusParent: () => void, parentOwnedRef?: React.RefObject<HTMLDivElement> }) => {
    const node = state.nodes[ownProps.nodeId]
    const props: Partial<NodeOuterProps> = {
        node,
        orderedNodes: state.orderedNodes,
        selected: state.selectedNodeId === ownProps.nodeId
    }
    return props
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>, ownProps: { nodeId: string, focusParent: () => void, parentOwnedRef?: React.RefObject<HTMLDivElement> }) => {
    const props: Partial<NodeOuterProps> = {
        selectNode: () => dispatch(setSelectedNode(ownProps.nodeId)),
        deleteNode: () => dispatch(deleteNode(ownProps.nodeId)),
        setNodeType: (type: NodeType) => dispatch(setNodeType(ownProps.nodeId, type)),
        setLogMessage: (message: string) => dispatch(setLogMessage(ownProps.nodeId, message)),
        setStorageCreateLabel: (label: string)  => dispatch(setStorageCreateLabel(ownProps.nodeId, label)),
        setStorageCreateValueType: (valueType: ValueType)  => dispatch(setStorageCreateValueType(ownProps.nodeId, valueType)),
        setStorageCreateValue: (value: string)  => dispatch(setStorageCreateValue(ownProps.nodeId, value)),
    }
    return props
}

export const NodeOuter = connect(
    mapStateToProps,
    mapDispatchToProps
)(NodeOuterComponent)