import { baseTypes, NumberType } from "./types/river_types";

const DEBUG = false;

export function dec2bin(dec: number, pad: number) {
  if (!Number.isSafeInteger(dec)) {
    throw new TypeError("value must be a safe integer");
  }

  const negative = dec < 0;
  const twosComplement = negative ? Number.MAX_SAFE_INTEGER + dec + 1 : dec;

  return twosComplement.toString(2).padStart(pad, "0");
}

export enum InstructionType {
  SCOPE,
  DEF,
  ASSIGN,
  COMPARE,
  JUMP,
  OS,
}

export enum FragmentType {
  DEF_NAME,
  DEF_TYPE,
  ASSIGN_ACTION,
  COMPARE_ACTION,
  OS_ACTION,
  JUMP_ACTION,
  VAR,
  CONST,
  MISSING,
}

export type FragmentMissing = {
  type: FragmentType.MISSING;
  name: string;
};

export type FragmentVar = {
  type: FragmentType.VAR;
  value: number;
  size: number;
  numberType: NumberType;
};

export type FragmentConst = {
  type: FragmentType.CONST;
  value: number;
  size: number;
  numberType: NumberType;
};

type ScopeOpen = {
  type: InstructionType.SCOPE;
  stackOffset: number;
  stackMemory: number;
  action: "open";
  loopCount: number;
  openInstructionIndex: number; // Todo this is a bit of a hack
  closeInstructionIndex: number;
};

type ScopeClose = {
  type: InstructionType.SCOPE;
  action: "close";
};

export type InstructionScope = ScopeOpen | ScopeClose;

export type FragmentDefName = {
  type: FragmentType.DEF_NAME;
  name: string;
};

export type FragmentDefType = {
  type: FragmentType.DEF_TYPE;
  name: string;
  size: number;
};

export type InstructionDef = {
  type: InstructionType.DEF;
  name: FragmentDefName | FragmentMissing;
  defType: FragmentDefType | FragmentMissing;
};

export type InstructionDefValid = {
  type: InstructionType.DEF;
  name: FragmentDefName;
  defType: FragmentDefType;
};

export enum AssignAction {
  EQUALS,
  ADD,
  SUBTRACT,
  MULTIPLY,
  DIVIDE,
  MOD,
  AND,
  OR,
}

export const allAssignActions = [
  AssignAction.EQUALS,
  AssignAction.ADD,
  AssignAction.SUBTRACT,
  AssignAction.MULTIPLY,
  AssignAction.DIVIDE,
  AssignAction.MOD,
  AssignAction.AND,
  AssignAction.OR,
];

export function assignActionToString(assignAction: AssignAction) {
  switch (assignAction) {
    case AssignAction.EQUALS:
      return "=";
    case AssignAction.ADD:
      return "+";
    case AssignAction.SUBTRACT:
      return "-";
    case AssignAction.MULTIPLY:
      return "*";
    case AssignAction.DIVIDE:
      return "/";
    case AssignAction.MOD:
      return "%";
    case AssignAction.AND:
      return "&";
    case AssignAction.OR:
      return "|";
  }
}

export type AssignActionFragment = {
  type: FragmentType.ASSIGN_ACTION;
  action: AssignAction;
};

export type InstructionAssign = {
  type: InstructionType.ASSIGN;
  action: AssignActionFragment | FragmentMissing;
  left: FragmentVar | FragmentMissing;
  right: FragmentVar | FragmentConst | FragmentMissing;
};

export type InstructionAssignValid = {
  type: InstructionType.ASSIGN;
  action: AssignActionFragment;
  left: FragmentVar;
  right: FragmentVar | FragmentConst;
};

export enum CompareAction {
  EQUAL, // ==
  NOT_EQUAL, // !=
  GREATER, // >
  GREATER_EQUAL, // >=
  LESS, // <
  LESS_EQUAL, // <=
}

export const allCompareActions = [
  CompareAction.EQUAL, // ==
  CompareAction.NOT_EQUAL, // !=
  CompareAction.GREATER, // >
  CompareAction.GREATER_EQUAL, // >=
  CompareAction.LESS, // <
  CompareAction.LESS_EQUAL, // <=
];

export function compareActionToString(compareAction: CompareAction) {
  switch (compareAction) {
    case CompareAction.EQUAL:
      return "==";
    case CompareAction.NOT_EQUAL:
      return "!=";
    case CompareAction.LESS:
      return "<";
    case CompareAction.LESS_EQUAL:
      return "<=";
    case CompareAction.GREATER:
      return ">";
    case CompareAction.GREATER_EQUAL:
      return ">=";
  }
}

export type CompareActionFragment = {
  type: FragmentType.COMPARE_ACTION;
  action: CompareAction;
};

export type InstructionCompare = {
  type: InstructionType.COMPARE;
  action: CompareActionFragment | FragmentMissing;
  left: FragmentVar | FragmentMissing;
  right: FragmentVar | FragmentConst | FragmentMissing;
};

export type InstructionCompareValid = {
  type: InstructionType.COMPARE;
  action: CompareActionFragment;
  left: FragmentVar;
  right: FragmentVar | FragmentConst;
};

export enum JumpAction {
  START,
  END,
}

export function jumpActionToString(action: JumpAction) {
  if (action === JumpAction.START) {
    return "start";
  } else {
    return "end";
  }
}

export type FragmentJumpAction = {
  type: FragmentType.JUMP_ACTION;
  action: JumpAction;
};

export type InstructionJump = {
  type: InstructionType.JUMP;
  action: FragmentJumpAction | FragmentMissing;
};

export type InstructionJumpValid = {
  type: InstructionType.JUMP;
  action: FragmentJumpAction;
  scope: ScopeOpen;
};

export enum OSAction {
  STDOUT,
}

export type OSActionFragment = {
  type: FragmentType.OS_ACTION;
} & {
  action: OSAction.STDOUT;
  varType: FragmentVar | FragmentConst | FragmentMissing;
};

export type OSActionFragmentValid = {
  type: FragmentType.OS_ACTION;
} & {
  action: OSAction.STDOUT;
  varType: FragmentVar | FragmentConst;
};

export function OSActionToString(action: OSAction) {
  switch (action) {
    case OSAction.STDOUT:
      return "stdout";
  }
}

export type InstructionOS = {
  type: InstructionType.OS;
  action: OSActionFragment;
};

export type InstructionOSValid = {
  type: InstructionType.OS;
  action: OSActionFragmentValid;
};

export type Instruction =
  | InstructionScope
  | InstructionDef
  | InstructionAssign
  | InstructionCompare
  | InstructionJump
  | InstructionOS;

export type InstructionValid =
  | InstructionScope
  | InstructionDefValid
  | InstructionAssignValid
  | InstructionCompareValid
  | InstructionJumpValid
  | InstructionOSValid;

export type Scope = {
  name: string;
  stackOffset: number;
  stackMemory: number;
  loopCount: number;
  openInstructionIndex: number;
  closeInstructionIndex: number;
};

export function parse(file: string) {
  const lines = file.length === 0 ? [] : file.split("\n");
  const scopes: [number, ScopeOpen][] = [];
  const instructions: Instruction[] = [];
  let maxMemory = 0;

  function openScope(originalInstructionIndex: number, closeInstructionIndex?: number) {
    const stackOffset =
      scopes.length > 0 ? scopes[scopes.length - 1][1].stackOffset + scopes[scopes.length - 1][1].stackMemory : 0;
    const instruction: InstructionScope & { action: "open" } = {
      type: InstructionType.SCOPE,
      action: "open",
      stackOffset,
      stackMemory: 0,
      loopCount: 0,
      openInstructionIndex: originalInstructionIndex,
      closeInstructionIndex: closeInstructionIndex || -1,
    };
    scopes.push([originalInstructionIndex, instruction]);
    instructions.push(instruction);
  }

  openScope(-1, lines.length);

  DEBUG && console.log("PARSING ------------------------------------");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    DEBUG && console.log(`parsing line ${i}: ${line}`);
    const tokens = line.split(" ");
    switch (tokens[0]) {
      // 0     1
      // scope open
      case "scope": {
        if (tokens[1] === "open") {
          openScope(i);
          break;
        } else if (tokens[1] === "close") {
          const popped = scopes.pop();
          if (popped && popped[1].action === "open") {
            popped[1].closeInstructionIndex = i;
          }
          instructions.push({
            type: InstructionType.SCOPE,
            action: "close",
          });
        }
        break;
      }
      // 0   1     2   3
      // def local u64 64
      case "def": {
        const scope = scopes[scopes.length - 1];
        const memory = parseInt(tokens[3], 10);
        maxMemory += memory;
        scope[1].stackMemory += memory;
        instructions.push({
          type: InstructionType.DEF,
          defType: {
            type: FragmentType.DEF_TYPE,
            name: tokens[2],
            size: parseInt(tokens[3], 10),
          },
          name: {
            type: FragmentType.DEF_NAME,
            name: tokens[1],
          },
        });
        break;
      }
      // 0      1   2  3 4     5
      // assign u64 16 + const 32
      case "assign": {
        const leftType = baseTypes.find((t) => t.name === tokens[1]);
        let action = AssignAction.EQUALS;
        switch (tokens[3]) {
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
        const instruction: InstructionAssign = {
          type: InstructionType.ASSIGN,
          action: {
            type: FragmentType.ASSIGN_ACTION,
            action,
          },
          left: {
            type: FragmentType.VAR,
            value: parseFloat(tokens[2]),
            size: leftType ? leftType.size : 0,
            numberType: leftType ? leftType.numberType : NumberType.UINT,
          },
          right: {
            type: tokens[4] === "const" ? FragmentType.CONST : FragmentType.VAR,
            value: parseFloat(tokens[5]),
            size: 0,
            numberType: leftType ? leftType.numberType : NumberType.UINT,
          },
        };
        if (instruction.left.type === FragmentType.VAR && instruction.right.type !== FragmentType.MISSING) {
          const rightType = baseTypes.find((t) => t.name === tokens[4]);
          instruction.right.size = rightType ? rightType.size : 0;
          instruction.right.numberType = rightType ? rightType.numberType : NumberType.UINT;
        }
        instructions.push(instruction);
        break;
      }
      case "jump": {
        let jump: InstructionJump = {
          type: InstructionType.JUMP,
          action: { type: FragmentType.JUMP_ACTION, action: tokens[1] === "start" ? JumpAction.START : JumpAction.END },
        };
        if (jump.action.type === FragmentType.JUMP_ACTION) {
          const scope = scopes[scopes.length - 1][1];
          (jump as InstructionJumpValid).scope = scope;
          if (jump.action.action === JumpAction.START) {
            scope.loopCount++;
          }
        }
        instructions.push(jump);
        break;
      }
      // 0       1   2  3  4  5
      // compare u64 16 == u8 32
      case "compare": {
        let action = CompareAction.EQUAL;
        switch (tokens[3]) {
          case "!=":
            action = CompareAction.NOT_EQUAL;
            break;
          case ">":
            action = CompareAction.GREATER;
            break;
          case ">=":
            action = CompareAction.GREATER_EQUAL;
            break;
          case "<":
            action = CompareAction.LESS;
            break;
          case "<=":
            action = CompareAction.LESS_EQUAL;
            break;
        }
        // TODO: fix const floats and signed ints
        const leftType = baseTypes.find((t) => t.name === tokens[1]);
        const rightType =
          tokens[4] === "const"
            ? { size: leftType!.size, numberType: leftType!.numberType }
            : baseTypes.find((t) => t.name === tokens[4]);
        const instruction: InstructionCompare = {
          type: InstructionType.COMPARE,
          action: {
            type: FragmentType.COMPARE_ACTION,
            action,
          },
          left: {
            type: FragmentType.VAR,
            value: parseInt(tokens[2], 10),
            size: leftType ? leftType.size : 0,
            numberType: leftType ? leftType.numberType : NumberType.UINT,
          },
          right: {
            type: tokens[4] === "const" ? FragmentType.CONST : FragmentType.VAR,
            value: parseInt(tokens[5], 10),
            size: rightType ? rightType.size : 0,
            numberType: rightType ? rightType.numberType : NumberType.UINT,
          },
        };
        instructions.push(instruction);
        break;
      }
      // 0  1      2  3
      // os stdout u8 48
      case "os": {
        switch (tokens[1]) {
          case "stdout": {
            const stdoutType =
              tokens[2] === "const"
                ? { size: 64, numberType: NumberType.UINT }
                : baseTypes.find((t) => t.name === tokens[2])!;
            const instruction: InstructionOS = {
              type: InstructionType.OS,
              action: {
                type: FragmentType.OS_ACTION,
                action: OSAction.STDOUT,
                varType: {
                  type: tokens[2] === "const" ? FragmentType.CONST : FragmentType.VAR,
                  value: parseInt(tokens[3], 10),
                  size: stdoutType.size,
                  numberType: stdoutType.numberType,
                },
              },
            };
            instructions.push(instruction);
            break;
          }
          default:
            break;
        }
        break;
      }
      default:
        break;
    }
  }

  instructions.push({
    type: InstructionType.SCOPE,
    action: "close",
  });

  // We add 2 for the automatic outer scope open and scope close
  if (lines.length + 2 !== instructions.length) {
    throw new Error("Line count and instruction count don't match");
  }

  return [instructions, maxMemory] as const;
}

function variableToText(variable: FragmentVar | FragmentConst) {
  const numberType =
    variable.numberType === NumberType.FLOAT ? "f" : variable.numberType === NumberType.INT ? "i" : "u";
  return (variable.type === FragmentType.CONST ? "const" : `${numberType}${variable.size}`) + ` ${variable.value}`;
}

export function instructionsToText(instructions: Instruction[]) {
  // eslint-disable-next-line array-callback-return
  return instructions.map(function (instruction) {
    switch (instruction.type) {
      case InstructionType.DEF:
        return `def ${
          instruction.name.type === FragmentType.MISSING ? `_${instruction.name.name}` : `${instruction.name.name}`
        } ${instruction.defType.type === FragmentType.MISSING ? `_${instruction.defType.name}` : `${instruction.defType.name} ${instruction.defType.size}`}`;
      case InstructionType.ASSIGN:
        return `assign ${
          instruction.left.type === FragmentType.MISSING
            ? `_${instruction.left.name}`
            : variableToText(instruction.left)
        } ${instruction.action.type === FragmentType.MISSING ? `_${instruction.action.name}` : assignActionToString(instruction.action.action)} ${instruction.right.type === FragmentType.MISSING ? `_${instruction.right.name}` : variableToText(instruction.right)}`;
      case InstructionType.COMPARE:
        return `assign ${
          instruction.left.type === FragmentType.MISSING
            ? `_${instruction.left.name}`
            : variableToText(instruction.left)
        } ${instruction.action.type === FragmentType.MISSING ? `_${instruction.action.name}` : compareActionToString(instruction.action.action)} ${instruction.right.type === FragmentType.MISSING ? `_${instruction.right.name}` : variableToText(instruction.right)}`;
      case InstructionType.JUMP:
        return `jump ${
          instruction.action.type === FragmentType.MISSING
            ? `_${instruction.action.name}`
            : jumpActionToString(instruction.action.action)
        }`;
      case InstructionType.SCOPE:
        return `scope ${instruction.action}`;
      case InstructionType.OS:
        return `os ${OSActionToString(
          instruction.action.action
        )} ${instruction.action.varType.type === FragmentType.MISSING ? `_${instruction.action.varType.name}` : variableToText(instruction.action.varType)}`;
    }
  });
}
