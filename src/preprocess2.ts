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
  InstructionMacro,
  InstructionOS,
  InstructionType,
  Macro,
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
        instruction.left.type !== FragmentType.VAR_MISSING &&
        instruction.right.type !== FragmentType.VAR_MISSING
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

// Returns true if two instructions are equal from a macro perspective (including placeholder or block instructions etc)
function instructionsAreEquivalent(instruction: Instruction, macroInstruction: InstructionMacro) {
  switch (instruction.type) {
    case InstructionType.SCOPE:
      return macroInstruction.type === InstructionType.SCOPE && instruction.action === macroInstruction.action;
    case InstructionType.DEF:
      return (
        macroInstruction.type === InstructionType.DEF &&
        instruction.name === macroInstruction.name &&
        instruction.defType.type === FragmentType.DEF_TYPE &&
        macroInstruction.defType.type === FragmentType.DEF_TYPE &&
        instruction.defType.size === macroInstruction.defType.size &&
        instruction.defType.name === macroInstruction.defType.name
      );
    case InstructionType.ASSIGN:
      return (
        macroInstruction.type === InstructionType.ASSIGN &&
        (macroInstruction.action.type === FragmentType.PLACEHOLDER ||
          (instruction.action.type !== FragmentType.MISSING &&
            instruction.action.action === macroInstruction.action.action)) &&
        (macroInstruction.left.type === FragmentType.VAR_PLACEHOLDER ||
          (instruction.left.type !== FragmentType.VAR_MISSING &&
            instruction.left.numberType === macroInstruction.left.numberType &&
            instruction.left.size === macroInstruction.left.size &&
            instruction.left.value === macroInstruction.left.value)) &&
        (macroInstruction.right.type === FragmentType.VAR_PLACEHOLDER ||
          (instruction.right.type !== FragmentType.VAR_MISSING &&
            instruction.right.numberType === macroInstruction.right.numberType &&
            instruction.right.size === macroInstruction.right.size &&
            instruction.right.value === macroInstruction.right.value))
      );
    case InstructionType.COMPARE:
      return (
        macroInstruction.type === InstructionType.COMPARE &&
        (macroInstruction.action.type === FragmentType.PLACEHOLDER ||
          (instruction.action.type !== FragmentType.MISSING &&
            instruction.action.action === macroInstruction.action.action)) &&
        (macroInstruction.left.type === FragmentType.VAR_PLACEHOLDER ||
          (instruction.left.type !== FragmentType.VAR_MISSING &&
            instruction.left.numberType === macroInstruction.left.numberType &&
            instruction.left.size === macroInstruction.left.size &&
            instruction.left.value === macroInstruction.left.value)) &&
        (macroInstruction.right.type === FragmentType.VAR_PLACEHOLDER ||
          (instruction.right.type !== FragmentType.VAR_MISSING &&
            instruction.right.numberType === macroInstruction.right.numberType &&
            instruction.right.size === macroInstruction.right.size &&
            instruction.right.value === macroInstruction.right.value))
      );
    case InstructionType.JUMP:
      return macroInstruction.type === InstructionType.JUMP && instruction.action === macroInstruction.action;
    case InstructionType.OS:
      return (
        macroInstruction.type === InstructionType.OS &&
        macroInstruction.action.type === instruction.action.type &&
        (macroInstruction.action.varType.type === FragmentType.VAR_PLACEHOLDER ||
          (instruction.action.varType.type !== FragmentType.VAR_MISSING &&
            instruction.action.varType.numberType === macroInstruction.action.varType.numberType &&
            instruction.action.varType.size === macroInstruction.action.varType.size &&
            instruction.action.varType.value === macroInstruction.action.varType.value))
      );
  }
}

function findMatchingMacros(instruction: Instruction, macros: Macro[]) {
  for (const macro of macros) {
    if (instructionsAreEquivalent(instruction, macro.instructions[0])) {
    }
  }
}

export function preprocess(applicationState: ApplicationState) {
  const editorInstructions: ExtendedInstruction[] = [];
  const visibleVariables: VisibleVariable[] = [];
  const serializedInstructions: string[] = [];
  let allValid = true;
  let variableOffset = 0;
  let scopeOffsets = [0];
  for (let i = 0; i < applicationState.instructions.length; i++) {
    const instruction = applicationState.instructions[i];
    const valid = validate(instruction);
    allValid = allValid && valid;
    const serialized = JSON.stringify(instruction);

    // First, check if the current instruction matches any macros
    const matching = findMatchingMacros(instruction, applicationState.macros);
    console.log(matching);

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
        if (instruction.left.type !== FragmentType.VAR_MISSING) {
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
