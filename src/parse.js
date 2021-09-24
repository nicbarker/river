// const fs = require("fs");
// const path = require("path");

const DEBUG = false;

// const file = fs.readFileSync(process.argv[2], "utf8");

export function dec2bin(dec, pad) {
  return (dec >>> 0).toString(2).padStart(pad, "0");
}

export function parse(file) {
  const lines = file.length === 0 ? [] : file.split("\n");
  const scopes = [];
  const scopesFinal = [];
  const instructions = [];
  let maxMemory = 0;

  function openScope() {
    const stackOffset =
      scopes.length > 0
        ? scopes[scopes.length - 1].stackOffset +
          scopes[scopes.length - 1].stackMemory
        : 0;
    const instruction = {
      instruction: "memory",
      action: "alloc",
      stackOffset,
      stackMemory: 0,
      serialized: "scope open",
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

  function closeScope() {
    const popped = scopes.pop();
    const instruction = {
      instruction: "memory",
      action: "dealloc",
      stackOffset: popped.stackOffset,
      stackMemory: popped.stackMemory,
      serialized: "scope close",
    };
    instructions.push(instruction);
  }

  openScope();

  DEBUG && console.log("PARSING ------------------------------------");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    DEBUG && console.log(`parsing line ${i}: ${line}`);
    const tokens = line.split(" ");
    switch (tokens[0]) {
      case "scope": {
        switch (tokens[1]) {
          case "open": {
            openScope();
            break;
          }
          case "close": {
            closeScope();
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
        instructions.push({ instruction: "void", serialized: line });
        break;
      }
      case "assign": {
        const scope = scopes[scopes.length - 1];
        const targetIndex = parseInt(tokens[2], 10);
        const target = scope.variables[targetIndex];
        const size = scope.sizes[targetIndex];
        const source = tokens[4];
        const instruction = {
          instruction: "assign",
          action: tokens[3],
          target,
          source,
          size,
          value: undefined,
          address: undefined,
          serialized: line,
        };
        switch (source) {
          case "const": {
            instruction.value = dec2bin(tokens[5], size);
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
        instructions.push({
          instruction: "jump",
          target: parseInt(tokens[1], 10),
          serialized: line,
        });
        break;
      }
      case "compare": {
        const instruction = {
          instruction: "compare",
          action: tokens[3],
          left: {
            source: tokens[1],
          },
          right: {
            source: tokens[4],
          },
          serialized: line,
        };
        const scope = scopes[scopes.length - 1];
        switch (tokens[1]) {
          case "const": {
            instruction.left.value = tokens[2];
            break;
          }
          case "var": {
            const targetIndex = parseInt(tokens[2], 10);
            const size = scope.sizes[targetIndex];
            instruction.left.address = scope.variables[targetIndex];
            instruction.left.size = size;
            break;
          }
          default:
            break;
        }
        switch (tokens[4]) {
          case "const": {
            instruction.right.value = tokens[5];
            break;
          }
          case "var": {
            const targetIndex = parseInt(tokens[5], 10);
            const size = scope.sizes[targetIndex];
            instruction.right.address = scope.variables[targetIndex];
            instruction.right.size = size;
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
            const instruction = {
              instruction: "os",
              action: "stdout",
              value: undefined,
              address: undefined,
              size: 0,
              serialized: line,
            };
            switch (tokens[2]) {
              case "const": {
                // TODO: fix handling of primitives in stdout
                instruction.value = dec2bin(tokens[3], 32);
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

  closeScope();

  console.log(lines);
  for (let i = 0; i < lines.length; i++) {
    DEBUG && console.log(lines[i], instructions[i]);
  }
  // We add 2 for the automatic outer scope open and scope close
  if (lines.length + 2 !== instructions.length) {
    throw new Error("Line count and instruction count don't match");
  }
  DEBUG && console.log("scopes:", scopesFinal);

  return [scopesFinal, instructions, maxMemory];
}
