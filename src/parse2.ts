import { baseTypes, NumberType, numberWithSizeToString, RiverTypeBase } from "./types/river_types";

const DEBUG = true;

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
  PLACEHOLDER,
}

export function InstructionTypeToString(instructionType: InstructionType) {
  switch (instructionType) {
    case InstructionType.SCOPE:
      return "SCOPE";
    case InstructionType.DEF:
      return "DEF";
    case InstructionType.ASSIGN:
      return "ASSIGN";
    case InstructionType.COMPARE:
      return "COMPARE";
    case InstructionType.JUMP:
      return "JUMP";
    case InstructionType.OS:
      return "OS";
    case InstructionType.PLACEHOLDER:
      return "MISSING";
  }
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
  PLACEHOLDER,
  VAR_PLACEHOLDER,
  VAR_MISSING,
}

function fragmentValidityToString(fragmentType: FragmentType) {
  switch (fragmentType) {
    case FragmentType.MISSING:
      return "missing";
    case FragmentType.PLACEHOLDER:
      return "placeholder";
    case FragmentType.VAR_PLACEHOLDER:
      return "placeholder";
    case FragmentType.VAR_MISSING:
      return "missing";
    default:
      return "valid";
  }
}

export type FragmentMissing = {
  type: FragmentType.MISSING;
  name: string;
};

export type FragmentPlaceholder = {
  type: FragmentType.PLACEHOLDER;
  name: string;
};

type FragmentVarPlaceholderMissing =
  | {
      numberType: NumberType.COPY;
    }
  | {
      numberType: Exclude<NumberType, NumberType.COPY>;
      size: number;
    };

export type FragmentVarPlaceholder = {
  type: FragmentType.VAR_PLACEHOLDER;
  name: string;
} & FragmentVarPlaceholderMissing;

export type FragmentVarMissing = {
  type: FragmentType.VAR_MISSING;
  name: string;
} & FragmentVarPlaceholderMissing;

export type FragmentVar = {
  type: FragmentType.VAR;
  value: number;
  size: number;
  numberType: Exclude<NumberType, NumberType.COPY | NumberType.ANY>;
};

export type FragmentConst = {
  type: FragmentType.CONST;
  value: number;
  size: number;
  numberType: Exclude<NumberType, NumberType.COPY | NumberType.ANY>;
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

export type FragmentAssignAction = {
  type: FragmentType.ASSIGN_ACTION;
  action: AssignAction;
};

export type InstructionAssign = {
  type: InstructionType.ASSIGN;
  action: FragmentAssignAction | FragmentMissing;
  left: FragmentVar | FragmentVarMissing;
  right: FragmentVar | FragmentConst | FragmentVarMissing;
};

export type InstructionAssignMacro = {
  type: InstructionType.ASSIGN;
  action: FragmentAssignAction | FragmentPlaceholder;
  left: FragmentVar | FragmentVarPlaceholder;
  right: FragmentVar | FragmentConst | FragmentVarPlaceholder;
};

export type InstructionAssignValid = {
  type: InstructionType.ASSIGN;
  action: FragmentAssignAction;
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

export type FragmentCompareAction = {
  type: FragmentType.COMPARE_ACTION;
  action: CompareAction;
};

export type InstructionCompare = {
  type: InstructionType.COMPARE;
  action: FragmentCompareAction | FragmentMissing;
  left: FragmentVar | FragmentVarMissing;
  right: FragmentVar | FragmentConst | FragmentVarMissing;
};

export type InstructionCompareMacro = {
  type: InstructionType.COMPARE;
  action: FragmentCompareAction | FragmentPlaceholder;
  left: FragmentVar | FragmentVarPlaceholder;
  right: FragmentVar | FragmentConst | FragmentVarPlaceholder;
};

export type InstructionCompareValid = {
  type: InstructionType.COMPARE;
  action: FragmentCompareAction;
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
  action: OSAction.STDOUT;
  varType: FragmentVar | FragmentConst | FragmentVarMissing;
};

export type OSActionFragmentMacro = {
  type: FragmentType.OS_ACTION;
  action: OSAction.STDOUT;
  varType: FragmentVar | FragmentConst | FragmentVarPlaceholder;
};

export type OSActionFragmentValid = {
  type: FragmentType.OS_ACTION;
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

export type InstructionOSMacro = {
  type: InstructionType.OS;
  action: OSActionFragmentMacro;
};

export type InstructionOSValid = {
  type: InstructionType.OS;
  action: OSActionFragmentValid;
};

export type InstructionPlaceholder = {
  type: InstructionType.PLACEHOLDER;
  name: string;
};

export type Instruction =
  | InstructionScope
  | InstructionDef
  | InstructionAssign
  | InstructionCompare
  | InstructionJump
  | InstructionOS
  | InstructionPlaceholder;

export type InstructionValid =
  | InstructionScope
  | InstructionDefValid
  | InstructionAssignValid
  | InstructionCompareValid
  | InstructionJumpValid
  | InstructionOSValid
  | InstructionPlaceholder;

export type InstructionMacro =
  | InstructionScope
  | InstructionDef
  | InstructionAssignMacro
  | InstructionCompareMacro
  | InstructionJump
  | InstructionOSMacro
  | InstructionPlaceholder;

export type Scope = {
  name: string;
  stackOffset: number;
  stackMemory: number;
  loopCount: number;
  openInstructionIndex: number;
  closeInstructionIndex: number;
};

export type Macro = {
  name: string;
  instructions: InstructionMacro[];
  inline: boolean;
};

function parseVariable(
  category: string,
  baseType: string,
  value: string,
  defaultType?: RiverTypeBase,
  allowConst: boolean = true
): { var: FragmentVar | FragmentConst | FragmentVarPlaceholder | FragmentVarMissing; type?: RiverTypeBase } {
  let parsedVar: FragmentVar | FragmentConst | FragmentVarPlaceholder | FragmentVarMissing;
  const varType = baseTypes.find((t) => t.name === baseType);
  if (category === "valid") {
    if (allowConst && baseType === "const") {
      parsedVar = {
        type: FragmentType.CONST,
        value: parseFloat(value),
        size: varType!.size,
        numberType: varType!.numberType,
      };
    } else {
      parsedVar = {
        type: FragmentType.VAR,
        value: parseInt(value),
        size: varType!.size,
        numberType: varType!.numberType,
      };
    }
  } else {
    if (baseType === "copy") {
      parsedVar = {
        type: category === "placeholder" ? FragmentType.VAR_PLACEHOLDER : FragmentType.VAR_MISSING,
        name: value,
        numberType: NumberType.COPY,
      };
    } else {
      if (defaultType) {
        parsedVar = {
          type: category === "placeholder" ? FragmentType.VAR_PLACEHOLDER : FragmentType.VAR_MISSING,
          name: value,
          size: defaultType.size,
          numberType: defaultType.numberType,
        };
      } else {
        throw Error("Error: parseVariable fell through to default type but defaultType was undefined");
      }
    }
  }
  return { var: parsedVar, type: varType };
}

export function parse({ file, macro }: { file: string; macro?: boolean }) {
  const lines = file.length === 0 ? [] : file.split(/\r\n|\r|\n/);
  const scopes: [number, ScopeOpen][] = [];
  const instructions: (Instruction | InstructionMacro)[] = [];
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
      // 0      1     2   3  4     5 6     7     8
      // assign valid u64 16 valid + valid const 32
      case "assign": {
        let action: FragmentAssignAction | FragmentPlaceholder | FragmentMissing = {
          type: FragmentType.ASSIGN_ACTION,
          action: AssignAction.EQUALS,
        };
        if (tokens[4] === "valid") {
          switch (tokens[3]) {
            case "+":
              action.action = AssignAction.ADD;
              break;
            case "-":
              action.action = AssignAction.SUBTRACT;
              break;
            case "*":
              action.action = AssignAction.MULTIPLY;
              break;
            case "/":
              action.action = AssignAction.DIVIDE;
              break;
            case "%":
              action.action = AssignAction.MOD;
              break;
            case "&":
              action.action = AssignAction.AND;
              break;
            case "|":
              action.action = AssignAction.OR;
              break;
          }
        } else if (tokens[4] === "placeholder") {
          action = {
            type: FragmentType.PLACEHOLDER,
            name: tokens[5],
          };
        } else if (tokens[4] === "missing") {
          action = {
            type: FragmentType.MISSING,
            name: tokens[5],
          };
        }

        const left = parseVariable(tokens[1], tokens[2], tokens[3], undefined, false);

        const right = parseVariable(tokens[6], tokens[7], tokens[8], left.type);

        const instruction = {
          type: InstructionType.ASSIGN,
          action,
          left: left.var,
          right: right.var,
        };
        instructions.push(instruction as Instruction);
        break;
      }
      // 0       1     2   3  4     5 6     7     8
      // compare valid u64 16 valid + valid const 32
      case "compare": {
        // const leftType = baseTypes.find((t) => t.name === tokens[1]);
        // ACTION --------------------
        let action: FragmentCompareAction | FragmentPlaceholder | FragmentMissing = {
          type: FragmentType.COMPARE_ACTION,
          action: CompareAction.EQUAL,
        };
        if (tokens[4] === "valid") {
          switch (tokens[3]) {
            case "!=":
              action.action = CompareAction.NOT_EQUAL;
              break;
            case ">":
              action.action = CompareAction.GREATER;
              break;
            case ">=":
              action.action = CompareAction.GREATER_EQUAL;
              break;
            case "<":
              action.action = CompareAction.LESS;
              break;
            case "<=":
              action.action = CompareAction.LESS_EQUAL;
              break;
          }
        } else if (tokens[4] === "placeholder") {
          action = {
            type: FragmentType.PLACEHOLDER,
            name: tokens[5],
          };
        } else if (tokens[4] === "missing") {
          action = {
            type: FragmentType.MISSING,
            name: tokens[5],
          };
        }

        const left = parseVariable(tokens[1], tokens[2], tokens[3], undefined, false);

        const right = parseVariable(tokens[6], tokens[7], tokens[8], left.type);

        const instruction = {
          type: InstructionType.ASSIGN,
          action,
          left: left.var,
          right: right.var,
        };
        instructions.push(instruction as Instruction);
        break;
      }
      // 0    1     2
      // jump valid start
      case "jump": {
        let action: FragmentJumpAction | FragmentMissing;
        if (tokens[1] === "valid") {
          action = {
            type: FragmentType.JUMP_ACTION,
            action: tokens[2] === "start" ? JumpAction.START : JumpAction.END,
          };
        } else {
          // tokens[1] === 'missing'
          action = {
            type: FragmentType.MISSING,
            name: tokens[2],
          };
        }
        let jump: InstructionJump = {
          type: InstructionType.JUMP,
          action,
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
      // 0  1     2      3     4  5
      // os valid stdout valid u8 48
      case "os": {
        if (tokens[1] !== "valid") {
          break;
        }
        switch (tokens[2]) {
          case "stdout": {
            const varType = parseVariable(tokens[3], tokens[4], tokens[5]);

            const instruction = {
              type: InstructionType.OS,
              action: {
                type: FragmentType.OS_ACTION,
                action: OSAction.STDOUT,
                varType: varType.var,
              },
            };
            instructions.push(instruction as InstructionMacro);
            break;
          }
          default:
            break;
        }
        break;
      }
      case "placeholder": {
        instructions.push({
          type: InstructionType.PLACEHOLDER,
          name: tokens[1],
        });
        break;
      }
    }
  }

  instructions.push({
    type: InstructionType.SCOPE,
    action: "close",
  });

  // We add 2 for the automatic outer scope open and scope close
  if (lines.length + 2 !== instructions.length) {
    console.log(lines, instructions);
    throw new Error("Line count and instruction count don't match");
  }

  return [instructions, maxMemory] as const;
}

export function instructionsToText(instructions: (Instruction | InstructionMacro)[]) {
  // eslint-disable-next-line array-callback-return
  return instructions.map(function (instruction) {
    switch (instruction.type) {
      // 0   1     2     3     4   5
      // def valid local valid u64 64
      case InstructionType.DEF:
        return [
          "def",
          fragmentValidityToString(instruction.name.type),
          instruction.name.name,
          fragmentValidityToString(instruction.defType.type),
          instruction.defType.name,
          instruction.defType.type === FragmentType.DEF_TYPE ? instruction.defType.size : 0,
        ].join(" ");
      // 0      1     2   3  4     5 6     7     8
      // assign valid u64 16 valid + valid const 32
      case InstructionType.ASSIGN: {
        const left = instruction.left;
        const right = instruction.right;
        return [
          "assign",
          fragmentValidityToString(left.type),
          left.numberType === NumberType.COPY ? "copy" : numberWithSizeToString(left.numberType, left.size),
          left.type === FragmentType.VAR ? left.value : left.name,
          fragmentValidityToString(instruction.action.type),
          instruction.action.type === FragmentType.MISSING || instruction.action.type === FragmentType.PLACEHOLDER
            ? instruction.action.name
            : assignActionToString(instruction.action.action),
          fragmentValidityToString(right.type),
          right.numberType === NumberType.COPY ? "copy" : numberWithSizeToString(right.numberType, right.size),
          right.type === FragmentType.VAR || right.type === FragmentType.CONST ? right.value : right.name,
        ].join(" ");
      }
      // 0       1     2   3  4     5  6     7     8
      // compare valid u64 16 valid == valid const 32
      case InstructionType.COMPARE: {
        const left = instruction.left;
        const right = instruction.right;
        return [
          "compare",
          fragmentValidityToString(left.type),
          left.numberType === NumberType.COPY ? "copy" : numberWithSizeToString(left.numberType, left.size),
          left.type === FragmentType.VAR ? left.value : left.name,
          fragmentValidityToString(instruction.action.type),
          instruction.action.type === FragmentType.MISSING || instruction.action.type === FragmentType.PLACEHOLDER
            ? instruction.action.name
            : compareActionToString(instruction.action.action),
          fragmentValidityToString(right.type),
          right.numberType === NumberType.COPY ? "copy" : numberWithSizeToString(right.numberType, right.size),
          right.type === FragmentType.VAR || right.type === FragmentType.CONST ? right.value : right.name,
        ].join(" ");
      }
      // 0    1     2
      // jump valid start
      case InstructionType.JUMP:
        return [
          "jump",
          fragmentValidityToString(instruction.action.type),
          instruction.action.type === FragmentType.JUMP_ACTION
            ? jumpActionToString(instruction.action.action)
            : instruction.action.name,
        ].join(" ");
      // 0  1     2      3     4   5
      // os valid stdout valid u64 16
      case InstructionType.OS: {
        const varType = instruction.action.varType;
        return [
          "os",
          fragmentValidityToString(instruction.action.type),
          "stdout", // todo: fix me
          fragmentValidityToString(varType.type),
          varType.numberType === NumberType.COPY ? "copy" : numberWithSizeToString(varType.numberType, varType.size),
          fragmentValidityToString(instruction.action.type),
        ].join(" ");
      }
    }
  });
}
