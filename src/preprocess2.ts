import { VisibleVariable } from "./editor";
import { ApplicationState, FocusInputType } from "./editor_handler2";
import {
  FragmentDefName,
  FragmentDefType,
  FragmentType,
  Instruction,
  InstructionAssign,
  InstructionCompare,
  InstructionDef,
  InstructionOS,
  InstructionType,
} from "./parse2";
import { baseTypes, RiverType } from "./types/river_types";

export enum EditorInstructionType {
  // Use a high value enum to prevent conflicts with InstructionType
  EMPTY = 100,
}

// Extend parsed types with extra editor only attributes, such as hydrated types
export type EditorInstructionDef = InstructionDef & { riverType: RiverType };
export type EditorInstructionAssign = InstructionAssign & {
  leftVariable: VisibleVariable;
  rightVariable: VisibleVariable;
};
export type EditorInstructionCompare = InstructionCompare & {
  leftVariable: VisibleVariable;
  rightVariable: VisibleVariable;
};
export type EditorInstructionOS = InstructionOS & {
  variable: VisibleVariable;
};
export type ExtendedInstruction = (
  | Exclude<Instruction, InstructionDef | InstructionAssign | InstructionCompare | InstructionOS>
  | { type: EditorInstructionType.EMPTY }
  | EditorInstructionDef
  | EditorInstructionAssign
  | EditorInstructionCompare
  | EditorInstructionOS
) & { originalLineNumber: number; indent: number };

function validate(instruction: Instruction) {
  switch (instruction.type) {
    case InstructionType.DEF: {
      return instruction.name.type !== FragmentType.MISSING && instruction.defType.type !== FragmentType.MISSING;
    }
    case InstructionType.COMPARE:
    case InstructionType.ASSIGN: {
      return (
        instruction.action.type !== FragmentType.MISSING &&
        instruction.left.type !== FragmentType.MISSING &&
        instruction.right.type !== FragmentType.MISSING
      );
    }
    case InstructionType.JUMP: {
      return instruction.action.type !== FragmentType.MISSING;
    }
    case InstructionType.SCOPE: {
      return true;
    }
  }
  return true;
}

export function preprocess(applicationState: ApplicationState) {
  const editorInstructions: ExtendedInstruction[] = [];
  const visibleVariables: VisibleVariable[] = [];
  const serializedInstructions: string[] = [];
  let allValid = true;
  let variableOffset = 0;
  let scopeOffsets = [0];
  for (let i = 1; i < applicationState.instructions.length - 1; i++) {
    const instruction = applicationState.instructions[i];
    const valid = validate(instruction);
    allValid = allValid && valid;
    const serialized = JSON.stringify(instruction);
    switch (instruction.type) {
      case InstructionType.DEF: {
        let riverType: RiverType | undefined;
        if (valid) {
          const defName = instruction.name as FragmentDefName;
          const defType = instruction.defType as FragmentDefType;
          riverType = baseTypes.find((t) => t.name === defType.name);
          if (riverType) {
            visibleVariables.push({
              name: defName.name,
              offset: variableOffset,
              size: defType.size,
              numberType: riverType.numberType,
            });
          }
          variableOffset += defType.size;
        }
        editorInstructions.push({
          ...instruction,
          riverType: riverType as RiverType,
          originalLineNumber: i,
          indent: scopeOffsets.length - 1,
        });
        break;
      }

      case InstructionType.COMPARE:
      case InstructionType.ASSIGN: {
        let leftVariable: VisibleVariable | undefined, rightVariable: VisibleVariable | undefined;
        if (instruction.left.type !== FragmentType.MISSING) {
          const leftVar = instruction.left;
          leftVariable = visibleVariables.find((v) => v.offset === leftVar.value);
        } else {
          leftVariable = undefined;
        }
        if (instruction.right && instruction.right.type === FragmentType.VAR) {
          const rightVar = instruction.right;
          rightVariable = visibleVariables.find((v) => v.offset === rightVar.value);
        } else {
          rightVariable = undefined;
        }
        editorInstructions.push({
          ...instruction,
          leftVariable: leftVariable as VisibleVariable,
          rightVariable: rightVariable as VisibleVariable,
          originalLineNumber: i,
          indent: scopeOffsets.length - 1,
        });
        break;
      }

      case InstructionType.SCOPE: {
        if (instruction.action === "close") {
          const previousOffset = scopeOffsets.pop();
          if (typeof previousOffset != "undefined") {
            variableOffset = previousOffset;
          }
        }
        editorInstructions.push({
          ...instruction,
          originalLineNumber: i,
          indent: scopeOffsets.length - 1,
        });
        if (instruction.action === "open") {
          scopeOffsets.push(variableOffset);
        }
        break;
      }

      case InstructionType.OS: {
        let variable: VisibleVariable | undefined;
        if (instruction.action.varType.type === FragmentType.VAR) {
          const leftVar = instruction.action.varType;
          variable = visibleVariables.find((v) => v.offset === leftVar.value);
        }
        editorInstructions.push({
          ...instruction,
          variable: variable as VisibleVariable,
          originalLineNumber: i,
          indent: scopeOffsets.length - 1,
        });
        break;
      }

      default: {
        editorInstructions.push({
          ...instruction,
          originalLineNumber: i,
          indent: scopeOffsets.length - 1,
        });
      }
    }
    serializedInstructions.push(serialized);
  }

  if (applicationState.focusInputState?.type === FocusInputType.INSERT_INSTRUCTION) {
    let currentInstruction = editorInstructions[applicationState.cursorPositions[0]] || {
      type: EditorInstructionType.EMPTY,
      originalLineNumber: applicationState.cursorPositions[0] === 0 ? 0 : applicationState.instructions.length,
      indent: scopeOffsets.length - 1,
    };
    editorInstructions.splice(applicationState.cursorPositions[0], 0, {
      type: EditorInstructionType.EMPTY,
      originalLineNumber: currentInstruction.originalLineNumber,
      indent: currentInstruction.indent,
    });
  }
  applicationState.editorInstructions = editorInstructions;
  applicationState.visibleVariables = visibleVariables;
  applicationState.serializedInstructions = serializedInstructions;
  applicationState.valid = allValid;
}
