import { Instruction } from "./editor_handler";

const DEBUG = false;

export function dec2bin(dec: number, pad: number) {
  return (dec >>> 0).toString(2).padStart(pad, "0");
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
  source: string;
  size: number;
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

export function parse(file: string) {
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
        const memory = parseInt(tokens[2], 10);
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
        const size = scope.sizes[targetIndex];
        const source = tokens[4];
        const instruction: CompiledInstructionAssign = {
          instruction: "assign",
          action: tokens[3],
          target,
          source,
          size,
          serialized: line,
          originalInstructionIndex: i,
        };
        switch (source) {
          case "const": {
            instruction.value = parseInt(tokens[5], 10);
            break;
          }
          case "var": {
            const targetIndex = parseInt(tokens[5], 10);
            instruction.address = scope.variables[targetIndex];
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
              serialized: line,
              originalInstructionIndex: i,
            };
            switch (tokens[2]) {
              case "const": {
                // TODO: fix handling of primitives in stdout
                instruction.value = parseInt(tokens[3]);
                instruction.size = 32;
                break;
              }
              case "var": {
                const scope = scopes[scopes.length - 1];
                const sourceIndex = parseInt(tokens[3], 10);
                const size = scope.sizes[sourceIndex];
                instruction.address = scope.variables[sourceIndex];
                instruction.size = size;
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
