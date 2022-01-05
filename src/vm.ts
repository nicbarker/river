import { Output } from "./application";
import { CompiledInstruction, dec2bin, Scope } from "./parse";

const DEBUG = false;
const DOUBLE_DEBUG = false;

export function execute(
  scopesFinal: Scope[],
  instructions: CompiledInstruction[],
  outputCallback: (output: Output) => void
) {
  const memory = Array(200).fill(undefined);
  let temp = 0;

  function writeBinaryToStack(value: number[], offset: number) {
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
    if (executionCount > 100000) {
      console.log("Error: possible infinite loop");
      break;
    }
    const instruction = instructions[instructionIndex];
    switch (instruction.instruction) {
      case "scope": {
        switch (instruction.action) {
          case "open": {
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
          case "close": {
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
        let targetValue =
          instruction.target === "temp"
            ? temp
            : parseInt(
                memory
                  .slice(
                    instruction.target,
                    instruction.target + instruction.size
                  )
                  .join(""),
                2
              );
        let sourceValue: number = 0;
        switch (instruction.source) {
          case "const": {
            DEBUG &&
              console.log(
                `set ${
                  instruction.action
                } with constant value ${instruction.value
                  ?.toString()
                  .padStart(instruction.size, "0")} at offset ${
                  instruction.target
                }`
              );
            sourceValue = instruction.value!;
            break;
          }
          case "var": {
            const value = memory
              .slice(
                instruction.address,
                instruction.address! + instruction.size
              )
              .join("");
            DEBUG &&
              console.log(
                `set ${instruction.action} with var value ${value} from address ${instruction.address} at offset ${instruction.target}`
              );
            sourceValue = parseInt(value, 2);
            break;
          }
          case "temp": {
            sourceValue = temp;
            break;
          }
          default:
            break;
        }
        let toWrite = 0;
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
        if (instruction.target === "temp") {
          temp = toWrite;
        } else {
          writeBinaryToStack(
            dec2bin(toWrite, instruction.size)
              .split("")
              .map((v) => parseInt(v, 10)),
            instruction.target
          );
        }
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
        let leftValue = 0,
          rightValue = 0;
        switch (instruction.left.source) {
          case "const": {
            leftValue = instruction.left.value!;
            break;
          }
          case "var": {
            const value = memory
              .slice(
                instruction.left.address,
                instruction.left.address! + instruction.left.size
              )
              .join("");
            leftValue = parseInt(value, 2);
            break;
          }
          case "temp": {
            leftValue = temp;
            break;
          }
          default:
            break;
        }
        switch (instruction.right.source) {
          case "const": {
            rightValue = instruction.right.value!;
            break;
          }
          case "var": {
            const value = memory
              .slice(
                instruction.right.address,
                instruction.right.address! + instruction.right.size
              )
              .join("");
            rightValue = parseInt(value, 2);
            break;
          }
          case "temp": {
            rightValue = temp;
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
        const newInstructionIndex =
          instruction.type === "start"
            ? instruction.scope.openInstruction.originalInstructionIndex
            : instruction.scope.closeInstruction.originalInstructionIndex - 1;
        DEBUG &&
          console.log(
            `jumping from ${instructionIndex} to ${newInstructionIndex}`
          );
        instructionIndex = newInstructionIndex;
        break;
      }
      case "os": {
        switch (instruction.action) {
          case "stdout": {
            switch (instruction.source) {
              case "temp": {
                outputCallback({
                  lineNumber: instructionIndex,
                  value: temp.toString(),
                });
                break;
              }
              case "var": {
                let value = parseInt(
                  memory
                    .slice(
                      instruction.address,
                      instruction.address! + instruction.size
                    )
                    .join(""),
                  2
                );
                outputCallback({
                  lineNumber: instructionIndex,
                  value: value.toString(),
                });
                break;
              }
              case "const": {
                outputCallback({
                  lineNumber: instructionIndex,
                  value: instruction.value!.toString(),
                });
                break;
              }
            }
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
