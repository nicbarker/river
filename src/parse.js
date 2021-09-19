// const fs = require("fs");
// const path = require("path");

const DEBUG = true;
const DOUBLE_DEBUG = false;

// const file = fs.readFileSync(process.argv[2], "utf8");

function dec2bin(dec, pad) {
  return (dec >>> 0).toString(2).padStart(pad, "0");
}

export function parse(file) {
  const lines = file.split("\n");
  const scopes = [];
  const scopesFinal = [];
  const instructions = [];

  DEBUG && console.log("PARSING ------------------------------------");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    DEBUG && console.log(`parsing line ${i}: ${line}`);
    const tokens = line.split(" ");
    switch (tokens[0]) {
      case "scope": {
        switch (tokens[1]) {
          case "open": {
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
            };
            instructions.push(instruction);
            const scope = {
              name: tokens[2],
              variables:
                scopes.length > 0
                  ? [...scopes[scopes.length - 1].variables]
                  : [],
              sizes:
                scopes.length > 0 ? [...scopes[scopes.length - 1].sizes] : [],
              stackOffset,
              stackMemory: 0,
              instruction,
            };
            scopes.push(scope);
            scopesFinal.push(scope);
            break;
          }
          case "close": {
            const popped = scopes.pop();
            const instruction = {
              instruction: "memory",
              action: "dealloc",
              stackOffset: popped.stackOffset,
              stackMemory: popped.stackMemory,
            };
            instructions.push(instruction);
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
        instructions.push({ instruction: "void" });
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
  console.log(lines);
  for (let i = 0; i < lines.length; i++) {
    DEBUG && console.log(lines[i], instructions[i]);
  }
  if (lines.length !== instructions.length) {
    throw new Error("Line count and instruction count don't match");
  }
  DEBUG && console.log("scopes:", scopesFinal);

  return [scopesFinal, instructions];
}

export function execute(scopesFinal, instructions, outputCallback) {
  const memory = Array(200).fill(undefined);

  function writeBinaryToStack(value, offset) {
    for (let i = 0; i < value.length; i++) {
      memory[offset + i] = value[i];
    }
  }

  let executionCount = 0;
  let peakMemory = 0;
  for (
    let instructionIndex = 0;
    instructionIndex < instructions.length;
    instructionIndex++
  ) {
    executionCount++;
    if (executionCount > 10000) {
      console.log("Error: possible infinite loop");
      break;
    }
    const instruction = instructions[instructionIndex];
    switch (instruction.instruction) {
      case "memory": {
        switch (instruction.action) {
          case "alloc": {
            DEBUG &&
              console.log(
                `allocating ${instruction.stackMemory} at offset ${instruction.stackOffset}`
              );
            writeBinaryToStack(
              Array(instruction.stackMemory).fill(0),
              instruction.stackOffset
            );
            peakMemory = Math.max(
              instruction.stackOffset + instruction.stackMemory,
              peakMemory
            );
            DOUBLE_DEBUG && console.log(`new memory state:`, memory);
            break;
          }
          case "dealloc": {
            DEBUG &&
              console.log(
                `deallocating ${instruction.stackMemory} at offset ${instruction.stackOffset}`
              );
            writeBinaryToStack(
              Array(instruction.stackMemory).fill(undefined),
              instruction.stackOffset
            );
            DOUBLE_DEBUG && console.log(`new memory state:`, memory);
            break;
          }
          default:
            break;
        }
        break;
      }
      case "assign": {
        let targetValue = parseInt(
          memory
            .slice(instruction.target, instruction.target + instruction.size)
            .join(""),
          2
        );
        let sourceValue;
        switch (instruction.source) {
          case "const": {
            DEBUG &&
              console.log(
                `set ${
                  instruction.action
                } with constant value ${instruction.value.padStart(
                  instruction.size,
                  "0"
                )} at offset ${instruction.target}`
              );
            sourceValue = parseInt(instruction.value, 2);
            break;
          }
          case "var": {
            const value = memory
              .slice(
                instruction.address,
                instruction.address + instruction.size
              )
              .join("");
            DEBUG &&
              console.log(
                `set ${instruction.action} with var value ${value} from address ${instruction.address} at offset ${instruction.target}`
              );
            sourceValue = parseInt(value, 2);
            break;
          }
          default:
            break;
        }
        let toWrite;
        switch (instruction.action) {
          case "=": {
            toWrite = sourceValue;
            break;
          }
          case "+": {
            toWrite = targetValue + sourceValue;
            break;
          }
          case "-": {
            toWrite = targetValue - sourceValue;
            break;
          }
          case "*": {
            toWrite = targetValue * sourceValue;
            break;
          }
          case "/": {
            toWrite = targetValue / sourceValue;
            break;
          }
          case "%": {
            toWrite = targetValue % sourceValue;
            break;
          }
          default:
            break;
        }
        writeBinaryToStack(
          dec2bin(toWrite, instruction.size),
          instruction.target
        );
        DOUBLE_DEBUG && console.log(`new memory state:`, memory);
        break;
      }
      case "compare": {
        DEBUG &&
          console.log(
            `running compare ${JSON.stringify(instruction.left)} ${
              instruction.action
            } ${JSON.stringify(instruction.right)}`
          );
        let leftValue, rightValue;
        switch (instruction.left.source) {
          case "const": {
            leftValue = parseInt(instruction.left.value, 10);
            break;
          }
          case "var": {
            const value = memory
              .slice(
                instruction.left.address,
                instruction.left.address + instruction.left.size
              )
              .join("");
            leftValue = parseInt(value, 2);
            break;
          }
          default:
            break;
        }
        switch (instruction.right.source) {
          case "const": {
            rightValue = parseInt(instruction.right.value, 10);
            break;
          }
          case "var": {
            const value = memory
              .slice(
                instruction.right.address,
                instruction.right.address + instruction.right.size
              )
              .join("");
            rightValue = parseInt(value, 2);
            break;
          }
          default:
            break;
        }
        let result = true;
        switch (instruction.action) {
          case "==": {
            result = leftValue === rightValue;
            break;
          }
          case "!=": {
            result = leftValue !== rightValue;
            break;
          }
          case "<": {
            result = leftValue < rightValue;
            break;
          }
          case "<=": {
            result = leftValue <= rightValue;
            break;
          }
          case ">": {
            result = leftValue > rightValue;
            break;
          }
          case ">=": {
            result = leftValue >= rightValue;
            break;
          }
          default:
            break;
        }
        DEBUG &&
          console.log(
            `comparing ${leftValue} ${instruction.action} ${rightValue} result ${result}`
          );
        if (!result) {
          instructionIndex += 1;
        }
        break;
      }
      case "jump": {
        const newInstructionIndex = instruction.target - 1;
        DEBUG &&
          console.log(
            `jumping from ${instructionIndex} to ${newInstructionIndex + 1}`
          );
        instructionIndex = newInstructionIndex;
        break;
      }
      case "os": {
        switch (instruction.action) {
          case "stdout": {
            let value = parseInt(
              memory
                .slice(
                  instruction.address,
                  instruction.address + instruction.size
                )
                .join(""),
              2
            );
            outputCallback({ lineNumber: instructionIndex, value });
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
  return {
    peakMemory,
  };
}

// parse();
// execute();
