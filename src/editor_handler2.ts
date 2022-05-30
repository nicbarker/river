import { VisibleVariable } from "./editor";
import {
  allCompareActions,
  AssignAction,
  CompareAction,
  InstructionType,
  compareActionToString,
  Instruction,
  FragmentType,
  OSAction,
  FragmentVar,
  FragmentConst,
  JumpAction,
  Macro,
} from "./parse2";
import { EditorInstructionType, ExtendedInstruction } from "./preprocess2";
import { baseTypes, NumberType, RiverType, SolidNumberType } from "./types/river_types";

export enum FocusInputType {
  INSERT_INSTRUCTION,
  SELECT_VARIABLE_TYPE,
  SEARCH_VARIABLE,
  SEARCH_MACRO,
  SEARCH_TYPE,
  ACTION_ASSIGN,
  ACTION_COMPARE,
  ACTION_JUMP,
  CONST_ANY,
  CONST_UNSIGNED,
  CONST_SIGNED,
  CONST_FLOAT,
  GENERIC_STRING,
}

export const FocusInputConstantTypes = [
  FocusInputType.CONST_UNSIGNED,
  FocusInputType.CONST_SIGNED,
  FocusInputType.CONST_FLOAT,
];

type FocusInputStateBase = {
  text: string;
};

export enum InsertInstructionType {
  BEFORE,
  AFTER,
  REPLACE,
}

export type FocusInputStateInsertInstruction = {
  type: FocusInputType.INSERT_INSTRUCTION;
  insertInstructionType: InsertInstructionType;
};

export type FocusInputStateSelectVariableType = {
  type: FocusInputType.SELECT_VARIABLE_TYPE;
  size: number;
  numberType: NumberType;
};

export type FocusInputStateSearchVariable = {
  type: FocusInputType.SEARCH_VARIABLE;
  matchedVariables: VisibleVariable[];
};

export type FocusInputStateSearchMacro = {
  type: FocusInputType.SEARCH_MACRO;
  matchedMacros: Macro[];
};

export type FocusInputStateSearchType = {
  type: FocusInputType.SEARCH_TYPE;
  matchedTypes: RiverType[];
};

export const actionAssignRegex = /[=+\-*/%&|]/;
export type FocusInputStateActionAssign = {
  type: FocusInputType.ACTION_ASSIGN;
};

export const actionCompareRegex = /[=!><]/;
export type FocusInputStateActionCompare = {
  type: FocusInputType.ACTION_COMPARE;
  matchedCompareActions: CompareAction[];
};

export type FocusInputStateActionJump = {
  type: FocusInputType.ACTION_JUMP;
};

export type FocusInputStateConstAny = {
  type: FocusInputType.CONST_ANY;
  size: number;
};

export type FocusInputStateConstUnsigned = {
  type: FocusInputType.CONST_UNSIGNED;
  size: number;
};

export type FocusInputStateConstSigned = {
  type: FocusInputType.CONST_SIGNED;
  size: number;
};

export type FocusInputStateConstFloat = {
  type: FocusInputType.CONST_FLOAT;
  size: number;
};

export type FocusInputStateGenericString = {
  type: FocusInputType.GENERIC_STRING;
  placeholder: string;
  allow: RegExp;
};

export type FocusInputState = (
  | FocusInputStateInsertInstruction
  | FocusInputStateSelectVariableType
  | FocusInputStateSearchVariable
  | FocusInputStateSearchMacro
  | FocusInputStateSearchType
  | FocusInputStateActionAssign
  | FocusInputStateActionCompare
  | FocusInputStateActionJump
  | FocusInputStateConstAny
  | FocusInputStateConstUnsigned
  | FocusInputStateConstSigned
  | FocusInputStateConstFloat
  | FocusInputStateGenericString
) &
  FocusInputStateBase;

function getNumberTypeFromFocusInputState(focusInputState: FocusInputState) {
  switch (focusInputState.type) {
    case FocusInputType.CONST_UNSIGNED:
      return NumberType.UINT;
    case FocusInputType.CONST_SIGNED:
      return NumberType.INT;
    case FocusInputType.CONST_FLOAT:
      return NumberType.FLOAT;
  }
}

export type ApplicationState = {
  instructions: Instruction[];
  editorInstructions: ExtendedInstruction[];
  cursorPositions: number[];
  focusInputState?: FocusInputState;
  visibleVariables: VisibleVariable[];
  macros: Macro[];
  serializedInstructions: string[];
  maxMemory: number;
  valid: boolean;
};

function handleKeyStrokeInFocusInput({ key, applicationState }: { key: string; applicationState: ApplicationState }) {
  if (!applicationState.focusInputState) {
    return;
  }

  const { editorInstructions, instructions: baseInstructions, cursorPositions, focusInputState } = applicationState;
  let currentInstruction = editorInstructions[cursorPositions[0]];
  const isBackspaceKey = key === "Backspace";

  if (isBackspaceKey) {
    focusInputState.text = focusInputState.text.slice(0, -1);
  } else if (key === "Enter" || key === " ") {
    switch (currentInstruction.type) {
      case InstructionType.DEF: {
        if (focusInputState.type === FocusInputType.GENERIC_STRING) {
          baseInstructions[currentInstruction.originalLineNumber] = {
            ...currentInstruction,
            name: {
              type: FragmentType.DEF_NAME,
              name: focusInputState.text,
            },
          };
          applicationState.focusInputState = undefined;
        } else if (focusInputState.type === FocusInputType.SEARCH_TYPE) {
          if (focusInputState.matchedTypes.length > 0) {
            const matched = focusInputState.matchedTypes[0];
            baseInstructions[currentInstruction.originalLineNumber] = {
              ...currentInstruction,
              defType: {
                type: FragmentType.DEF_TYPE,
                name: matched.name,
                size: matched.size,
              },
            };
            applicationState.focusInputState = undefined;
          }
        }
        break;
      }
      case InstructionType.COMPARE:
      case InstructionType.ASSIGN: {
        if (focusInputState.type === FocusInputType.SEARCH_VARIABLE) {
          if (focusInputState.matchedVariables.length > 0) {
            const matched = focusInputState.matchedVariables[0];
            const newVar: FragmentVar = {
              type: FragmentType.VAR,
              value: matched.offset,
              size: matched.size,
              numberType: matched.numberType,
            };
            if (cursorPositions[1] === 1) {
              currentInstruction.left = newVar;
            } else {
              currentInstruction.right = newVar;
            }
            baseInstructions[currentInstruction.originalLineNumber] = { ...currentInstruction };
            applicationState.focusInputState = undefined;
          }
        } else if (FocusInputConstantTypes.includes(focusInputState.type)) {
          const newVar: FragmentConst = {
            type: FragmentType.CONST,
            value: parseFloat(focusInputState.text),
            size: (focusInputState as FocusInputStateConstAny).size,
            numberType: getNumberTypeFromFocusInputState(focusInputState) as SolidNumberType,
          };
          currentInstruction.right = newVar;
          baseInstructions[currentInstruction.originalLineNumber] = { ...currentInstruction };
          applicationState.focusInputState = undefined;
        } else if (
          focusInputState.type === FocusInputType.ACTION_COMPARE &&
          currentInstruction.type === InstructionType.COMPARE
        ) {
          if (focusInputState.matchedCompareActions.length > 0) {
            currentInstruction.action = {
              type: FragmentType.COMPARE_ACTION,
              action: focusInputState.matchedCompareActions[0],
            };
            baseInstructions[currentInstruction.originalLineNumber] = { ...currentInstruction };
            applicationState.focusInputState = undefined;
          }
        }
        break;
      }
      case InstructionType.OS: {
        if (focusInputState.type === FocusInputType.SEARCH_VARIABLE) {
          if (focusInputState.matchedVariables.length > 0) {
            const matched = focusInputState.matchedVariables[0];
            const newVar: FragmentVar = {
              type: FragmentType.VAR,
              value: matched.offset,
              size: matched.size,
              numberType: matched.numberType,
            };
            currentInstruction.action.varType = newVar;
            baseInstructions[currentInstruction.originalLineNumber] = { ...currentInstruction };
            applicationState.focusInputState = undefined;
          }
        } else if (FocusInputConstantTypes.includes(focusInputState.type)) {
          const newVar: FragmentConst = {
            type: FragmentType.CONST,
            value: parseFloat(focusInputState.text),
            size: (focusInputState as FocusInputStateConstAny).size,
            numberType: getNumberTypeFromFocusInputState(focusInputState) as SolidNumberType,
          };
          currentInstruction.action.varType = newVar;
          baseInstructions[currentInstruction.originalLineNumber] = { ...currentInstruction };
          applicationState.focusInputState = undefined;
        }
      }
    }
  } else {
    const baseInstruction = baseInstructions[currentInstruction.originalLineNumber];
    switch (focusInputState.type) {
      case FocusInputType.INSERT_INSTRUCTION: {
        switch (key) {
          case "d":
            baseInstructions[currentInstruction.originalLineNumber] = {
              type: InstructionType.DEF,
              name: { type: FragmentType.MISSING, name: "name" },
              defType: { type: FragmentType.MISSING, name: "type" },
            };
            applicationState.focusInputState = undefined;
            break;
          case "a":
            baseInstructions[currentInstruction.originalLineNumber] = {
              type: InstructionType.ASSIGN,
              left: { type: FragmentType.VAR_MISSING, name: "target", numberType: NumberType.ANY, size: 0 }, // todo this might not be quite right
              action: { type: FragmentType.MISSING, name: "action" },
              right: { type: FragmentType.VAR_MISSING, name: "target", numberType: NumberType.ANY, size: 0 },
            };
            applicationState.focusInputState = undefined;
            break;
          case "c":
            baseInstructions[currentInstruction.originalLineNumber] = {
              type: InstructionType.COMPARE,
              left: { type: FragmentType.VAR_MISSING, name: "target", numberType: NumberType.ANY, size: 0 },
              action: { type: FragmentType.MISSING, name: "action" },
              right: { type: FragmentType.VAR_MISSING, name: "target", numberType: NumberType.ANY, size: 0 },
            };
            applicationState.focusInputState = undefined;
            break;
          case "s":
            baseInstructions[currentInstruction.originalLineNumber] = {
              type: InstructionType.SCOPE,
              action: "open",
              stackOffset: 0,
              stackMemory: 0,
              loopCount: 0,
              openInstructionIndex: currentInstruction.originalLineNumber,
              closeInstructionIndex: currentInstruction.originalLineNumber + 1,
            };
            baseInstructions[currentInstruction.originalLineNumber + 1] = {
              type: InstructionType.SCOPE,
              action: "close",
            };
            cursorPositions[0]++;
            break;
          case "j":
            baseInstructions[cursorPositions[0]] = {
              type: InstructionType.JUMP,
              action: { type: FragmentType.MISSING, name: "target" },
            };
            applicationState.focusInputState = undefined;
            break;
          case "o":
            baseInstructions[cursorPositions[0]] = {
              type: InstructionType.OS,
              action: {
                type: FragmentType.OS_ACTION,
                action: OSAction.STDOUT,
                varType: { type: FragmentType.VAR_MISSING, name: "target", numberType: NumberType.ANY, size: 0 },
              },
            };
            applicationState.focusInputState = undefined;
            break;
        }
        break;
      }
      case FocusInputType.GENERIC_STRING: {
        if (key.match(focusInputState.allow)) {
          focusInputState.text += key;
        }
        break;
      }
      case FocusInputType.ACTION_ASSIGN: {
        if (baseInstruction.type === InstructionType.ASSIGN) {
          let action: AssignAction | undefined;
          switch (key) {
            case "=":
              action = AssignAction.EQUALS;
              break;
            case "+":
              action = AssignAction.ADD;
              break;
            case "-":
              action = AssignAction.SUBTRACT;
              break;
            case "*":
              action = AssignAction.MULTIPLY;
              break;
            case "/":
              action = AssignAction.DIVIDE;
              break;
            case "%":
              action = AssignAction.MOD;
              break;
            case "&":
              action = AssignAction.AND;
              break;
            case "|":
              action = AssignAction.OR;
              break;
          }
          if (typeof action !== "undefined") {
            baseInstruction.action = {
              type: FragmentType.ASSIGN_ACTION,
              action,
            };
            applicationState.focusInputState = undefined;
          }
        }
        break;
      }
      case FocusInputType.ACTION_COMPARE: {
        if (baseInstruction.type === InstructionType.COMPARE) {
          let action: CompareAction | undefined;
          if (focusInputState.text.length === 0) {
            switch (key) {
              case "!":
                action = CompareAction.NOT_EQUAL;
                applicationState.focusInputState = undefined;
                break;
              case "=":
                action = CompareAction.EQUAL;
                applicationState.focusInputState = undefined;
                break;
              case "<":
              case ">":
                focusInputState.text = key;
                break;
            }
          } else if (key === "=") {
            if (focusInputState.text === "<") {
              action = CompareAction.LESS_EQUAL;
              applicationState.focusInputState = undefined;
            } else if (focusInputState.text === ">") {
              action = CompareAction.GREATER_EQUAL;
              applicationState.focusInputState = undefined;
            }
          }
          if (typeof action !== "undefined") {
            baseInstruction.action = {
              type: FragmentType.COMPARE_ACTION,
              action,
            };
          }
        }
        break;
      }
      case FocusInputType.ACTION_JUMP: {
        if (baseInstruction.type === InstructionType.JUMP) {
          let action: JumpAction | undefined;
          switch (key) {
            case "s":
              action = JumpAction.START;
              break;
            case "e":
              action = JumpAction.END;
              break;
          }
          if (typeof action !== "undefined") {
            baseInstruction.action = {
              type: FragmentType.JUMP_ACTION,
              action,
            };
            applicationState.focusInputState = undefined;
          }
        }
        break;
      }
      case FocusInputType.SELECT_VARIABLE_TYPE: {
        if (key === "c") {
          let type = FocusInputType.CONST_ANY;
          if (focusInputState.numberType === NumberType.UINT) {
            type = FocusInputType.CONST_UNSIGNED;
          } else if (focusInputState.numberType === NumberType.INT) {
            type = FocusInputType.CONST_SIGNED;
          } else if (focusInputState.numberType === NumberType.FLOAT) {
            type = FocusInputType.CONST_FLOAT;
          }
          applicationState.focusInputState = {
            type: type,
            size: focusInputState.size,
            numberType: focusInputState.numberType,
            text: "",
          };
        } else if (key === "v") {
          applicationState.focusInputState = {
            type: FocusInputType.SEARCH_VARIABLE,
            text: key,
            matchedVariables: applicationState.visibleVariables,
          };
        }
        break;
      }
      case FocusInputType.CONST_UNSIGNED: {
        if (key.match(/[0-9]/)) {
          focusInputState.text += key;
        }
        break;
      }
      case FocusInputType.CONST_SIGNED: {
        if ((focusInputState.text.length === 0 && key === "-") || key.match(/[0-9]/)) {
          focusInputState.text += key;
        }
        break;
      }
      case FocusInputType.CONST_FLOAT: {
        if (
          (focusInputState.text.length === 0 && key === "-") ||
          key.match(/[0-9]/) ||
          (key === "." && !focusInputState.text.includes("."))
        ) {
          focusInputState.text += key;
        }
        break;
      }
      default: {
        focusInputState.text += key;
      }
    }
  }

  if (applicationState.focusInputState) {
    switch (focusInputState.type) {
      case FocusInputType.SEARCH_TYPE: {
        focusInputState.matchedTypes = baseTypes.filter((t) => t.name.startsWith(focusInputState.text));
        break;
      }
      case FocusInputType.SEARCH_VARIABLE: {
        focusInputState.matchedVariables = applicationState.visibleVariables.filter((v) =>
          v.name.startsWith(focusInputState.text)
        );
        break;
      }
      case FocusInputType.ACTION_COMPARE: {
        focusInputState.matchedCompareActions = allCompareActions.filter((c) =>
          compareActionToString(c).startsWith(focusInputState.text)
        );
        break;
      }
    }
  }
}

export function handleKeyStroke({ key, applicationState }: { key: string; applicationState: ApplicationState }) {
  const { instructions, editorInstructions, cursorPositions, focusInputState } = applicationState;
  let currentInstruction = editorInstructions[cursorPositions[0]];
  const baseInstruction = instructions[cursorPositions[0]];
  const isBackspaceKey = key === "Backspace";
  const isAlphaNumeric = key.match(/^[ -~]$/);

  if (key.startsWith("Arrow")) {
    if (key === "ArrowLeft" || key === "ArrowRight") {
      applicationState.cursorPositions[1] += key === "ArrowLeft" ? -1 : 1;
    } else if (key === "ArrowUp" || key === "ArrowDown") {
      applicationState.cursorPositions[0] += key === "ArrowUp" ? -1 : 1;
    }
    currentInstruction = editorInstructions[cursorPositions[0]];
    if (focusInputState) {
      applicationState.focusInputState = undefined;
    }
  }

  if (focusInputState) {
    handleKeyStrokeInFocusInput({ key, applicationState });
    return;
  }

  if (isBackspaceKey && cursorPositions[1] === 0) {
    // Revert instruction back to empty
    instructions.splice(currentInstruction.originalLineNumber, 1);
    if (instructions.length === 0) {
      applicationState.focusInputState = {
        type: FocusInputType.INSERT_INSTRUCTION,
        insertInstructionType: InsertInstructionType.REPLACE,
        text: "",
      };
    }
  } else if (key === "Enter" && currentInstruction.type !== EditorInstructionType.EMPTY) {
    applicationState.focusInputState = {
      type: FocusInputType.INSERT_INSTRUCTION,
      insertInstructionType: InsertInstructionType.AFTER,
      text: "",
    };
    cursorPositions[0]++;
    cursorPositions[1] = 0;
  }
  // For other uncaught keys
  switch (currentInstruction.type) {
    // 0   1     2     3     4   5
    // def valid local valid u64 64
    case InstructionType.DEF: {
      switch (cursorPositions[1]) {
        case 1: {
          if (currentInstruction.name.type === FragmentType.MISSING || isBackspaceKey) {
            const text = isBackspaceKey || !isAlphaNumeric ? "" : key;
            applicationState.focusInputState = {
              type: FocusInputType.GENERIC_STRING,
              allow: /^[ -~]$/,
              text,
              placeholder: "name",
            };
          }
          break;
        }
        case 2: {
          if (currentInstruction.defType.type === FragmentType.MISSING || isBackspaceKey) {
            const text = isBackspaceKey || !isAlphaNumeric ? "" : key;
            applicationState.focusInputState = {
              type: FocusInputType.SEARCH_TYPE,
              text,
              matchedTypes: baseTypes.filter((t) => t.name.startsWith(text)),
            };
          }
          break;
        }
      }
      break;
    }
    // 0      1     2   3  4     5 6     7     8
    // assign valid u64 16 valid + valid const 32
    case InstructionType.ASSIGN: {
      switch (cursorPositions[1]) {
        case 1: {
          if (currentInstruction.left.type === FragmentType.VAR_MISSING || isBackspaceKey) {
            applicationState.focusInputState = {
              type: FocusInputType.SEARCH_VARIABLE,
              matchedVariables: applicationState.visibleVariables,
              text: "",
            };
          }
          break;
        }
        case 2: {
          if (currentInstruction.action.type === FragmentType.MISSING || isBackspaceKey) {
            const text = isBackspaceKey || !key.match(actionAssignRegex) ? "" : key;
            applicationState.focusInputState = {
              type: FocusInputType.ACTION_ASSIGN,
              text,
            };
          }
          break;
        }
        case 3: {
          if (
            currentInstruction.left.type !== FragmentType.VAR_MISSING &&
            (currentInstruction.right.type === FragmentType.VAR_MISSING || isBackspaceKey)
          ) {
            applicationState.focusInputState = {
              type: FocusInputType.SELECT_VARIABLE_TYPE,
              numberType: currentInstruction.left.numberType,
              size: currentInstruction.left.size,
              text: "",
            };
          }
          break;
        }
      }
      break;
    }
    // 0       1     2   3  4     5  6     7     8
    // compare valid u64 16 valid == valid const 32
    case InstructionType.COMPARE: {
      switch (cursorPositions[1]) {
        case 1: {
          if (currentInstruction.left.type === FragmentType.VAR_MISSING || isBackspaceKey) {
            applicationState.focusInputState = {
              type: FocusInputType.SEARCH_VARIABLE,
              matchedVariables: applicationState.visibleVariables,
              text: "",
            };
          }
          break;
        }
        case 2: {
          if (currentInstruction.action.type === FragmentType.MISSING || isBackspaceKey) {
            const text = isBackspaceKey || !key.match(actionAssignRegex) ? "" : key;
            applicationState.focusInputState = {
              type: FocusInputType.ACTION_COMPARE,
              text,
              matchedCompareActions: allCompareActions,
            };
          }
          break;
        }
        case 3: {
          if (
            currentInstruction.left.type !== FragmentType.VAR_MISSING &&
            (currentInstruction.right.type === FragmentType.VAR_MISSING || isBackspaceKey)
          ) {
            applicationState.focusInputState = {
              type: FocusInputType.SELECT_VARIABLE_TYPE,
              numberType: currentInstruction.left?.numberType || NumberType.ANY,
              size: currentInstruction.left?.numberType || 64,
              text: "",
            };
          }
          break;
        }
      }
      break;
    }
    // 0    1     2
    // jump valid start
    case InstructionType.JUMP: {
      switch (cursorPositions[1]) {
        case 1: {
          if (currentInstruction.action.type === FragmentType.MISSING || isBackspaceKey) {
            applicationState.focusInputState = {
              type: FocusInputType.ACTION_JUMP,
              text: "",
            };
          }
          if (baseInstruction.type === InstructionType.JUMP) {
            switch (key) {
              case "s":
                baseInstruction.action = {
                  type: FragmentType.JUMP_ACTION,
                  action: JumpAction.START,
                };
                break;
              case "e":
                baseInstruction.action = {
                  type: FragmentType.JUMP_ACTION,
                  action: JumpAction.END,
                };
                break;
            }
          }
        }
      }
      break;
    }
    // 0  1     2      3     4   5
    // os valid stdout valid u64 16
    case InstructionType.OS: {
      switch (cursorPositions[1]) {
        case 1: {
          switch (key) {
            case "s":
              currentInstruction.action = {
                type: FragmentType.OS_ACTION,
                action: OSAction.STDOUT,
                varType: { type: FragmentType.VAR_MISSING, name: "target", numberType: NumberType.ANY, size: 0 },
              };
              break;
          }
          break;
        }
        case 2: {
          if (currentInstruction.action.varType.type === FragmentType.VAR_MISSING || isBackspaceKey) {
            applicationState.focusInputState = {
              type: FocusInputType.SELECT_VARIABLE_TYPE,
              numberType: NumberType.ANY,
              size: 64, //  TODO: figure out how to size this properly
              text: "",
            };
          }
        }
      }
      break;
    }
  }
}
