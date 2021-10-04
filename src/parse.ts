// const fs = require("fs");
// const path = require("path");

import { Instruction } from "./editor_handler";

const DEBUG = false;

// const file = fs.readFileSync(process.argv[2], "utf8");

export function dec2bin(dec: number, pad: number) {
  return (dec >>> 0).toString(2).padStart(pad, "0");
}

export type CompiledInstructionMemory = {
  instruction: "memory";
  action: "alloc" | "dealloc";
  stackOffset: number;
  stackMemory: number;
} & CompiledInstructionSharedAttributes;

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
  target: number;
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
  | CompiledInstructionMemory
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
  instruction: CompiledInstructionMemory;
};

export function parse(file: string) {
  const lines = file.length === 0 ? [] : file.split("\n");
  const scopes: Scope[] = [];
  const scopesFinal: Scope[] = [];
  const instructions: CompiledInstruction[] = [];
  const jumps = [];
  let maxMemory = 0;

  function openScope(originalInstructionIndex: number) {
    const stackOffset =
      scopes.length > 0
        ? scopes[scopes.length - 1].stackOffset +
          scopes[scopes.length - 1].stackMemory
        : 0;
    const instruction: CompiledInstructionMemory = {
      instruction: "memory",
      action: "alloc",
      stackOffset,
      stackMemory: 0,
      serialized: "scope open",
      originalInstructionIndex,
    };
    instructions.push(instruction);
    const scope = {
      name: "_",
      variables:
        scopes.length > 0 ? [...scopes[scopes.length - 1].variables] : [],
      sizes: scopes.length > 0 ? [...scopes[scopes.length - 1].sizes] : [],
      stackOffset,
      stackMemory: 0,
      instruction,
    };
    scopes.push(scope);
    scopesFinal.push(scope);
  }

  function closeScope(originalInstructionIndex: number) {
    const popped = scopes.pop();
    if (popped) {
      const instruction: CompiledInstructionMemory = {
        instruction: "memory",
        action: "dealloc",
        stackOffset: popped.stackOffset,
        stackMemory: popped.stackMemory,
        serialized: "scope close",
        originalInstructionIndex,
      };
      instructions.push(instruction);
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
        if (tokens[1] === "local") {
          scope.stackMemory += memory;
          scope.instruction.stackMemory = scope.stackMemory;
          scope.instruction.stackOffset = scope.stackOffset;
        } else {
          const parent = scopes[scopes.length - 2];
          parent.stackMemory += memory;
          parent.variables.push(newVarLocation);
          parent.sizes.push(memory);
          parent.instruction.stackMemory = parent.stackMemory;
          parent.instruction.stackOffset = parent.stackOffset;
          scope.stackOffset += memory;
          scope.instruction.stackMemory = scope.stackMemory;
          scope.instruction.stackOffset = scope.stackOffset;
        }
        instructions.push({
          instruction: "void",
          serialized: line,
          originalInstructionIndex: scope.instruction.originalInstructionIndex,
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
        const target = parseInt(tokens[1], 10);
        instructions.push({
          instruction: "jump",
          target,
          serialized: line,
          originalInstructionIndex: i,
        });
        jumps.push(target);
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
        jumps.push(i + 3);
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

  return [scopesFinal, instructions, maxMemory, jumps] as const;
}

export function instructionsToText(instructions: Instruction[]) {
  return (instructions.filter(
    (i) => i.type !== "emptyInstruction" && i.valid
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
