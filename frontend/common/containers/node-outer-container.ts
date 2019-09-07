// -------------------------------------------------------------
// A react-redux container for node-outer-component.
// -------------------------------------------------------------

import { connect } from 'react-redux'
import { NodeOuter as NodeOuterComponent } from 'components/nodes/node-outer-component'
import { ApplicationState } from 'reducers/application-reducer';
import { Dispatch } from 'react';
import { ReduxAction, deleteNodes, setNodeType, setSelectedNode, setLogMessage, setCreateVariableValueType, setCreateVariableLabel, setCreateVariableValue } from 'actions/application-actions';
import { NodeType, ValueType, TextChain } from 'lib/interpreter';
import { NodeOuterProps } from 'components/nodes/node-outer-component';

type NodeOuterContainerProps = {
    nodeId: string
    dragSelected?: boolean
    focusParent: () => void
    parentOwnedRef?: React.RefObject<HTMLDivElement>
    dragSelectionDimensions?: [number, number, number, number]
    setNodeDragSelected: (selected: boolean) => void
}

const mapStateToProps = (state: ApplicationState, ownProps: NodeOuterContainerProps) => {
    const node = state.nodes[ownProps.nodeId]
    const props: Partial<NodeOuterProps> = {
        node,
        nodes: state.nodes,
        selected: state.selectedNodeId === ownProps.nodeId
    }
    return props
}

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>, ownProps: NodeOuterContainerProps) => {
    const props: Partial<NodeOuterProps> = {
        selectNode: () => dispatch(setSelectedNode(ownProps.nodeId)),
        deleteNode: () => dispatch(deleteNodes([ownProps.nodeId])),
        setNodeType: (type: NodeType) => dispatch(setNodeType(ownProps.nodeId, type)),
        setLogMessage: (message: TextChain) => dispatch(setLogMessage(ownProps.nodeId, message)),
        setCreateVariableLabel: (label: string)  => dispatch(setCreateVariableLabel(ownProps.nodeId, label)),
        setCreateVariableValueType: (valueType: ValueType)  => dispatch(setCreateVariableValueType(ownProps.nodeId, valueType)),
        setCreateVariableValue: (value: TextChain)  => dispatch(setCreateVariableValue(ownProps.nodeId, value)),
    }
    return props
}

export const NodeOuter = connect(
    mapStateToProps,
    mapDispatchToProps
)(NodeOuterComponent)