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
  target: number;
  targetSize: number;
  source: string;
  sourceSize: number;
  value?: number;
  address?: number;
} & CompiledInstructionSharedAttributes;

export type CompiledInstructionCompare = {
  instruction: "compare";
  action: string;
  left: {
    source: string;
    size: number;
    value?: number;
    address?: number;
  };
  right: {
    source: string;
    size: number;
    value?: number;
    address?: number;
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
  source: "var" | "const";
  value?: number;
  address?: number;
  size: number;
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
  variables: number[];
  sizes: number[];
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
      variables:
        scopes.length > 0 ? [...scopes[scopes.length - 1].variables] : [],
      sizes: scopes.length > 0 ? [...scopes[scopes.length - 1].sizes] : [],
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
      case "def": {
        const scope = scopes[scopes.length - 1];
        const memory = Math.max(parseInt(tokens[2], 10), minRegisterSize);
        maxMemory += memory;
        const newVarLocation = scope.stackOffset + scope.stackMemory;
        scope.variables.push(newVarLocation);
        scope.sizes.push(memory);
        scope.stackMemory += memory;
        instructions.push({
          instruction: "void",
          serialized: line,
          originalInstructionIndex: i,
        });
        break;
      }
      case "assign": {
        const scope = scopes[scopes.length - 1];
        const targetIndex = parseInt(tokens[2], 10);
        const target = scope.variables[targetIndex];
        const targetSize = scope.sizes[targetIndex];
        const source = tokens[4];
        const instruction: CompiledInstructionAssign = {
          instruction: "assign",
          action: tokens[3],
          target,
          targetSize,
          source,
          sourceSize: 0,
          serialized: line,
          originalInstructionIndex: i,
        };
        switch (source) {
          case "const": {
            instruction.value = parseInt(tokens[5], 10);
            instruction.sourceSize = instruction.targetSize;
            break;
          }
          case "var": {
            const targetIndex = parseInt(tokens[5], 10);
            instruction.address = scope.variables[targetIndex];
            instruction.sourceSize = scope.sizes[targetIndex];
            break;
          }
          default:
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
      case "compare": {
        const instruction: CompiledInstructionCompare = {
          instruction: "compare",
          action: tokens[3],
          left: {
            source: tokens[1],
            size: 64,
          },
          right: {
            source: tokens[4],
            size: 64,
          },
          serialized: line,
          originalInstructionIndex: i,
        };
        const scope = scopes[scopes.length - 1];
        switch (tokens[1]) {
          case "const": {
            if (instruction.left) {
              instruction.left.value = parseInt(tokens[2], 10);
            }
            break;
          }
          case "var": {
            const targetIndex = parseInt(tokens[2], 10);
            const size = scope.sizes[targetIndex];
            if (instruction.left) {
              instruction.left.address = scope.variables[targetIndex];
              instruction.left.size = size;
            }
            break;
          }
          default:
            break;
        }
        switch (tokens[4]) {
          case "const": {
            if (instruction.right) {
              instruction.right.value = parseInt(tokens[5], 10);
            }
            break;
          }
          case "var": {
            const targetIndex = parseInt(tokens[5], 10);
            const size = scope.sizes[targetIndex];
            if (instruction.right) {
              instruction.right.address = scope.variables[targetIndex];
              instruction.right.size = size;
            }
            break;
          }
          default:
            break;
        }
        instructions.push(instruction);
        break;
      }
      case "os": {
        switch (tokens[1]) {
          case "stdout": {
            const instruction: CompiledInstructionOs = {
              instruction: "os",
              action: "stdout",
              size: 0,
              source: "var",
              serialized: line,
              originalInstructionIndex: i,
            };
            switch (tokens[2]) {
              case "const": {
                // TODO: fix handling of primitives in stdout
                instruction.value = parseInt(tokens[3]);
                instruction.size = 64;
                instruction.source = "const";
                break;
              }
              case "var": {
                const scope = scopes[scopes.length - 1];
                const sourceIndex = parseInt(tokens[3], 10);
                const size = scope.sizes[sourceIndex];
                instruction.address = scope.variables[sourceIndex];
                instruction.size = size;
                instruction.source = "var";
                break;
              }
              default:
                break;
            }
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
            { type: "size", value: parseInt(tokens[2], 10) },
          ],
        };
        toReturn.push(instruction);
        break;
      }
      case "assign": {
        let sourceFragment: VarTypeFragment;
        if (tokens[4] === "var") {
          sourceFragment = {
            type: "varType",
            value: "var",
            stackPosition: parseInt(tokens[5], 10),
          };
        } else if (tokens[4] === "const") {
          sourceFragment = {
            type: "varType",
            value: "const",
            constValue: parseInt(tokens[5], 10),
          };
        } else {
          sourceFragment = {
            type: "varType",
            value: "_",
            name: tokens[4].split("_")[1],
          };
        }
        let targetFragment: VarTypeFragment;
        if (tokens[1] === "var") {
          targetFragment = {
            type: "varType",
            value: "var",
            stackPosition: parseInt(tokens[2], 10),
          };
        } else {
          targetFragment = {
            type: "varType",
            value: "_",
            name: tokens[1].split("_")[1],
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
            targetFragment,
            assignActionFragment,
            sourceFragment,
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
      case "compare": {
        let targetFragment: VarTypeFragment;
        if (tokens[1] === "var") {
          targetFragment = {
            type: "varType",
            value: "var",
            stackPosition: parseInt(tokens[2], 10),
          };
        } else if (tokens[1] === "const") {
          targetFragment = {
            type: "varType",
            value: "const",
            constValue: parseInt(tokens[2], 10),
          };
        } else {
          targetFragment = {
            type: "varType",
            value: "_",
            name: tokens[1].split("_")[1],
          };
        }

        let sourceFragment: VarTypeFragment;
        if (tokens[4] === "var") {
          sourceFragment = {
            type: "varType",
            value: "var",
            stackPosition: parseInt(tokens[5], 10),
          };
        } else if (tokens[4] === "const") {
          sourceFragment = {
            type: "varType",
            value: "const",
            constValue: parseInt(tokens[5], 10),
          };
        } else {
          sourceFragment = {
            type: "varType",
            value: "_",
            name: tokens[4].split("_")[1],
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
            targetFragment,
            comparatorFragment,
            sourceFragment,
          ],
        };
        toReturn.push(instruction);
        break;
      }
      case "os": {
        switch (tokens[1]) {
          case "stdout": {
            let sourceFragment: VarTypeFragment;
            if (tokens[2] === "var") {
              sourceFragment = {
                type: "varType",
                value: "var",
                stackPosition: parseInt(tokens[3], 10),
              };
            } else {
              sourceFragment = {
                type: "varType",
                value: "const",
                constValue: parseInt(tokens[3], 10),
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
                return `var ${f.stackPosition}`;
              case "const":
                return `const ${f.constValue}`;
              case "_":
                return "_";
            }
          }
          return f?.value;
        })
        .join(" ")
    )
    .join("\n");
}
