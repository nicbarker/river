import {
  AssignActionFragment,
  AssignInstruction,
  ComparatorFragment,
  CompareInstruction,
  DefInstruction,
  Instruction,
  JumpInstruction,
  OSInstruction,
  PlaceholderInstruction,
  ScopeInstruction,
  VarTypeFragment,
} from "./editor_handler";
import {
  baseTypes,
  getBaseTypeWithName,
  NumberType,
} from "./types/river_types";

const DEBUG = false;

export function dec2bin(dec: number, pad: number) {
  if (!Number.isSafeInteger(dec)) {
    throw new TypeError("value must be a safe integer");
  }

  const negative = dec < 0;
  const twosComplement = negative ? Number.MAX_SAFE_INTEGER + dec + 1 : dec;

  return twosComplement.toString(2).padStart(pad, "0");
}

export type CompiledInstructionScope = {
  instruction: "scope";
  stackOffset: number;
  stackMemory: number;
} & (
  | {
      action: "open";
      loopCount: number;
    }
  | {
      action: "close";
    }
) &
  CompiledInstructionSharedAttributes;

export type CompiledInstructionAssign = {
  instruction: "assign";
  action: string;
  left: {
    type: "var";
    value: number;
    size: number;
    numberType: NumberType;
  };
  right: {
    type: "var" | "const";
    value: number;
    size: number;
    numberType: NumberType;
  };
} & CompiledInstructionSharedAttributes;

export type CompiledInstructionCompare = {
  instruction: "compare";
  action: string;
  left: {
    type: "var" | "const";
    value: number;
    size: number;
    numberType: NumberType;
  };
  right: {
    type: "var" | "const";
    value: number;
    size: number;
    numberType: NumberType;
  };
} & CompiledInstructionSharedAttributes;

export type CompiledInstructionJump = {
  instruction: "jump";
  type: "start" | "end";
  scope: Scope;
} & CompiledInstructionSharedAttributes;

export type CompiledInstructionVoid = {
  instruction: "void";
} & CompiledInstructionSharedAttributes;

export type CompiledInstructionOs = {
  instruction: "os";
  action: string;
  type: "var" | "const";
  value: number;
  size: number;
  numberType: NumberType;
} & CompiledInstructionSharedAttributes;

export type CompiledInstructionSharedAttributes = {
  serialized: string;
  originalInstructionIndex: number;
};

export type CompiledInstruction =
  | CompiledInstructionScope
  | CompiledInstructionAssign
  | CompiledInstructionCompare
  | CompiledInstructionJump
  | CompiledInstructionOs
  | CompiledInstructionVoid;

export type Scope = {
  name: string;
  stackOffset: number;
  stackMemory: number;
  isLoop?: boolean;
  openInstruction: CompiledInstructionScope & { action: "open" };
  closeInstruction: CompiledInstructionScope & { action: "close" };
};

export function parse(file: string, minRegisterSize: number = 8) {
  const lines = file.length === 0 ? [] : file.split("\n");
  const scopes: Scope[] = [];
  const scopesFinal: Scope[] = [];
  const instructions: CompiledInstruction[] = [];
  let maxMemory = 0;

  function openScope(originalInstructionIndex: number) {
    const stackOffset =
      scopes.length > 0
        ? scopes[scopes.length - 1].stackOffset +
          scopes[scopes.length - 1].stackMemory
        : 0;
    const instruction: CompiledInstructionScope & { action: "open" } = {
      instruction: "scope",
      action: "open",
      stackOffset,
      stackMemory: 0,
      serialized: "scope open",
      originalInstructionIndex,
      loopCount: 0,
    };
    instructions.push(instruction);
    const scope: Scope = {
      name: "_",
      stackOffset,
      stackMemory: 0,
      openInstruction: instruction,
      closeInstruction: {
        ...instruction,
        action: "close",
        serialized: "scope close",
      },
    };
    scopes.push(scope);
    scopesFinal.push(scope);
  }

  function closeScope(originalInstructionIndex: number) {
    const popped = scopes.pop();
    if (popped) {
      popped.openInstruction.stackMemory = popped.stackMemory;
      popped.openInstruction.stackOffset = popped.stackOffset;
      popped.closeInstruction.stackMemory = popped.stackMemory;
      popped.closeInstruction.stackOffset = popped.stackOffset;
      popped.closeInstruction.originalInstructionIndex = originalInstructionIndex;
      instructions.push(popped.closeInstruction);
    }
  }

  openScope(-1);

  DEBUG && console.log("PARSING ------------------------------------");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    DEBUG && console.log(`parsing line ${i}: ${line}`);
    const tokens = line.split(" ");
    switch (tokens[0]) {
      case "scope": {
        switch (tokens[1]) {
          case "open": {
            openScope(i);
            break;
          }
          case "close": {
            closeScope(i);
            break;
          }
          default:
            break;
        }
        break;
      }
      // 0   1     2   3
      // def local u64 64
      case "def": {
        const scope = scopes[scopes.length - 1];
        const memory = Math.max(parseInt(tokens[3], 10), minRegisterSize);
        maxMemory += memory;
        scope.stackMemory += memory;
        instructions.push({
          instruction: "void",
          serialized: line,
          originalInstructionIndex: i,
        });
        break;
      }
      // 0      1   2  3 4  5
      // assign u64 16 + u8 32
      case "assign": {
        const leftType = baseTypes.find((t) => t.name === tokens[1]);
        const instruction: CompiledInstructionAssign = {
          instruction: "assign",
          action: tokens[3],
          left: {
            type: "var",
            value: parseInt(tokens[2], 10),
            size: leftType ? Math.max(leftType.size, minRegisterSize) : 0,
            numberType: leftType ? leftType.numberType : NumberType.UINT,
          },
          right: {
            type: tokens[4] === "const" ? "const" : "var",
            value: parseInt(tokens[5], 10),
            size: 0,
            numberType: leftType ? leftType.numberType : NumberType.UINT,
          },
          serialized: line,
          originalInstructionIndex: i,
        };
        switch (tokens[4]) {
          case "const": {
            instruction.right.size = instruction.left.size;
            // Todo fix mixture of float and signed int
            instruction.right.numberType = instruction.left.numberType;
            break;
          }
          default:
            const rightType = baseTypes.find((t) => t.name === tokens[4]);
            instruction.right.size = rightType
              ? Math.max(rightType.size, minRegisterSize)
              : 0;
            instruction.right.numberType = rightType
              ? rightType.numberType
              : NumberType.UINT;
            break;
        }
        instructions.push(instruction);
        break;
      }
      case "jump": {
        const jumpType = tokens[1] as "start" | "end";
        const jump: CompiledInstructionJump = {
          instruction: "jump",
          serialized: line,
          type: jumpType,
          scope: scopes[scopes.length - 1],
          originalInstructionIndex: i,
        };
        if (jumpType === "start") {
          jump.scope.openInstruction.loopCount++;
        }
        instructions.push(jump);
        break;
      }
      // 0       1   2  3  4  5
      // compare u64 16 == u8 32
      case "compare": {
        // TODO: fix const floats and signed ints
        const leftType =
          tokens[1] === "const"
            ? { size: 64, numberType: NumberType.UINT }
            : baseTypes.find((t) => t.name === tokens[1]);
        const rightType =
          tokens[4] === "const"
            ? { size: 64, numberType: NumberType.UINT }
            : baseTypes.find((t) => t.name === tokens[4]);
        const instruction: CompiledInstructionCompare = {
          instruction: "compare",
          action: tokens[3],
          left: {
            type: tokens[1] === "const" ? "const" : "var",
            value: parseInt(tokens[2], 10),
            size: leftType ? Math.max(leftType.size, minRegisterSize) : 0,
            numberType: leftType ? leftType.numberType : NumberType.UINT,
          },
          right: {
            type: tokens[4] === "const" ? "const" : "var",
            value: parseInt(tokens[5], 10),
            size: rightType ? Math.max(rightType.size, minRegisterSize) : 0,
            numberType: rightType ? rightType.numberType : NumberType.UINT,
          },
          serialized: line,
          originalInstructionIndex: i,
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
            const instruction: CompiledInstructionOs = {
              instruction: "os",
              action: "stdout",
              type: tokens[2] === "const" ? "const" : "var",
              value: parseInt(tokens[3], 10),
              size: Math.max(stdoutType.size, minRegisterSize),
              numberType: stdoutType.numberType,
              serialized: line,
              originalInstructionIndex: i,
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

  closeScope(-1);

  for (let i = 0; i < lines.length; i++) {
    DEBUG && console.log(lines[i], instructions[i]);
  }
  // We add 2 for the automatic outer scope open and scope close
  if (lines.length + 2 !== instructions.length) {
    throw new Error("Line count and instruction count don't match");
  }
  DEBUG && console.log("scopes:", scopesFinal);

  return [scopesFinal, instructions, maxMemory] as const;
}

export function parseTextFile(file: string, isMacro?: boolean): Instruction[] {
  const lines = file.length === 0 ? [] : file.split("\n");
  const toReturn: Instruction[] = [];
  for (const line of lines) {
    const tokens = line.split(" ");
    switch (tokens[0]) {
      case "scope": {
        const instruction: ScopeInstruction = {
          type: "scopeInstruction",
          fragments: [
            { type: "instruction", value: "scope" },
            { type: "scopeAction", value: tokens[1] as "open" | "close" },
          ],
        };
        toReturn.push(instruction);
        break;
      }
      case "def": {
        const instruction: DefInstruction = {
          type: "defInstruction",
          fragments: [
            { type: "instruction", value: "def" },
            { type: "defName", value: tokens[1] },
            {
              type: "defType",
              value: tokens[2],
              size: parseInt(tokens[3], 10),
            },
          ],
        };
        toReturn.push(instruction);
        break;
      }
      // 0      1   2  3 4  5
      // assign u64 16 + u8 32
      case "assign": {
        let rightFragment: VarTypeFragment;
        if (tokens[4] === "const") {
          rightFragment = {
            type: "varType",
            value: "const",
            constValue: parseInt(tokens[5], 10),
          };
        } else if (tokens[4].startsWith("_")) {
          rightFragment = {
            type: "varType",
            value: "_",
            name: tokens[4].split("_")[1],
          };
        } else {
          const varType = getBaseTypeWithName(tokens[4]);
          rightFragment = {
            type: "varType",
            value: "var",
            numberType: varType?.numberType,
            size: varType?.size,
            offset: parseInt(tokens[5], 10),
          };
        }
        let leftFragment: VarTypeFragment;
        if (tokens[1].startsWith("_")) {
          leftFragment = {
            type: "varType",
            value: "_",
            name: tokens[1].split("_")[1],
          };
        } else {
          const varType = getBaseTypeWithName(tokens[1]);
          leftFragment = {
            type: "varType",
            value: "var",
            numberType: varType?.numberType,
            size: varType?.size,
            offset: parseInt(tokens[2], 10),
          };
        }

        let assignActionFragment: AssignActionFragment;
        if (!tokens[3].startsWith("_")) {
          assignActionFragment = {
            type: "assignAction",
            value: tokens[3] as any,
          };
        } else {
          assignActionFragment = {
            type: "assignAction",
            value: "_",
            name: tokens[3].split("_")[1],
          };
        }
        const instruction: AssignInstruction = {
          type: "assignInstruction",
          fragments: [
            { type: "instruction", value: "assign" },
            leftFragment,
            assignActionFragment,
            rightFragment,
          ],
        };
        toReturn.push(instruction);
        break;
      }
      case "jump": {
        const actionFragment = tokens[1];
        const instruction: JumpInstruction = {
          type: "jumpInstruction",
          fragments: [
            { type: "instruction", value: "jump" },
            { type: "jumpPosition", value: actionFragment as any },
          ],
        };
        toReturn.push(instruction);
        break;
      }
      // 0       1   2  3  4  5
      // compare u64 16 == u8 32
      case "compare": {
        let leftFragment: VarTypeFragment;
        if (tokens[1] === "const") {
          leftFragment = {
            type: "varType",
            value: "const",
            constValue: parseInt(tokens[2], 10),
          };
        } else if (tokens[1].startsWith("_")) {
          leftFragment = {
            type: "varType",
            value: "_",
            name: tokens[1].split("_")[1],
          };
        } else {
          const varType = getBaseTypeWithName(tokens[1]);
          leftFragment = {
            type: "varType",
            value: "var",
            offset: parseInt(tokens[2], 10),
            size: varType?.size,
            numberType: varType?.numberType,
          };
        }

        let rightFragment: VarTypeFragment;
        if (tokens[4] === "const") {
          rightFragment = {
            type: "varType",
            value: "const",
            constValue: parseInt(tokens[5], 10),
          };
        } else if (tokens[4].startsWith("_")) {
          rightFragment = {
            type: "varType",
            value: "_",
            name: tokens[4].split("_")[1],
          };
        } else {
          const varType = getBaseTypeWithName(tokens[4]);
          rightFragment = {
            type: "varType",
            value: "var",
            offset: parseInt(tokens[5], 10),
            size: varType?.size,
            numberType: varType?.numberType,
          };
        }

        let comparatorFragment: ComparatorFragment;
        if (!tokens[3].startsWith("_")) {
          comparatorFragment = {
            type: "comparator",
            value: tokens[3] as any, // todo: fix types,
          };
        } else {
          comparatorFragment = {
            type: "comparator",
            value: "_",
            name: tokens[3].split("_")[1],
          };
        }

        const instruction: CompareInstruction = {
          type: "compareInstruction",
          fragments: [
            { type: "instruction", value: "compare" },
            leftFragment,
            comparatorFragment,
            rightFragment,
          ],
        };
        toReturn.push(instruction);
        break;
      }
      // 0  1      2  3
      // os stdout u8 0
      case "os": {
        switch (tokens[1]) {
          case "stdout": {
            let sourceFragment: VarTypeFragment;
            if (tokens[2] === "const") {
              sourceFragment = {
                type: "varType",
                value: "const",
                constValue: parseInt(tokens[3], 10),
              };
            } else {
              const varType = getBaseTypeWithName(tokens[2]);
              sourceFragment = {
                type: "varType",
                value: "var",
                offset: parseInt(tokens[3], 10),
                size: varType?.size,
                numberType: varType?.numberType,
              };
            }
            const instruction: OSInstruction = {
              type: "OSInstruction",
              fragments: [
                { type: "instruction", value: "os" },
                { type: "OSAction", value: "stdout" },
                sourceFragment,
              ],
            };
            toReturn.push(instruction);
            break;
          }
          default:
            break;
        }
        break;
      }
      default:
        if (tokens[0].startsWith("_")) {
          const instruction: PlaceholderInstruction = {
            type: "placeholderInstruction",
            fragments: [
              {
                type: "instruction",
                value: "_",
                name: tokens[0].split("_")[1],
              },
            ],
          };
          toReturn.push(instruction);
        }
        break;
    }
  }
  if (!isMacro && toReturn[toReturn.length - 1].type !== "emptyInstruction") {
    toReturn.push({ type: "emptyInstruction", fragments: [undefined] });
  }
  return toReturn;
}

export function instructionsToText(instructions: Instruction[]) {
  return (instructions.filter(
    (i) => i.type !== "emptyInstruction"
  ) as Instruction[])
    .map((i) =>
      i.fragments
        .map((f) => {
          if (f?.type === "varType") {
            switch (f.value) {
              case "var":
                const baseType = baseTypes.find(
                  (b) => b.numberType === f.numberType && b.size === f.size
                );
                return `${baseType?.name} ${f.offset}`;
              case "const":
                return `const ${f.constValue}`;
              case "_":
                return "_";
            }
          } else if (f?.type === "defType") {
            return `${f.value} ${f.size}`;
          }
          return f?.value;
        })
        .join(" ")
    )
    .join("\n");
}
