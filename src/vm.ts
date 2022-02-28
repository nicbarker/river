import { Output } from "./application";
import { CompiledInstruction, dec2bin, Scope } from "./parse";
import { NumberType } from "./types/river_types";

const DEBUG = false;
const DOUBLE_DEBUG = false;

function readValue(
  view: DataView,
  offset: number,
  numberType: NumberType,
  size: number
): number {
  switch (numberType) {
    case NumberType.INT: {
      switch (size) {
        case 8: {
          return view.getInt8(offset);
        }
        case 16: {
          return view.getInt16(offset);
        }
        case 32: {
          return view.getInt32(offset);
        }
        case 64: {
          return (view.getBigInt64(offset) as unknown) as number;
        }
      }
      break;
    }
    case NumberType.UINT: {
      switch (size) {
        case 8: {
          return view.getUint8(offset);
        }
        case 16: {
          return view.getUint16(offset);
        }
        case 32: {
          return view.getUint32(offset);
        }
        case 64: {
          return (view.getBigUint64(offset) as unknown) as number;
        }
      }
      break;
    }
    case NumberType.FLOAT: {
      switch (size) {
        case 32: {
          return view.getFloat32(offset);
        }
        case 64: {
          return view.getFloat64(offset);
        }
      }
      break;
    }
  }
  return 0;
}

function writeValue(
  view: DataView,
  offset: number,
  numberType: NumberType,
  size: number,
  value: number
) {
  switch (numberType) {
    case NumberType.INT: {
      switch (size) {
        case 8: {
          return view.setInt8(offset, value);
        }
        case 16: {
          return view.setInt16(offset, value);
        }
        case 32: {
          return view.setInt32(offset, value);
        }
        case 64: {
          return view.setBigInt64(offset, (value as unknown) as bigint);
        }
      }
      break;
    }
    case NumberType.UINT: {
      switch (size) {
        case 8: {
          return view.setUint8(offset, value);
        }
        case 16: {
          return view.setUint16(offset, value);
        }
        case 32: {
          return view.setUint32(offset, value);
        }
        case 64: {
          return view.setBigUint64(offset, (value as unknown) as bigint);
        }
      }
      break;
    }
    case NumberType.FLOAT: {
      switch (size) {
        case 32: {
          return view.setFloat32(offset, value);
        }
        case 64: {
          return view.setFloat64(offset, value);
        }
      }
      break;
    }
  }
  return 0;
}

export function execute(
  scopesFinal: Scope[],
  maxMemory: number,
  instructions: CompiledInstruction[],
  outputCallback: (output: Output) => void
) {
  const memory = new ArrayBuffer(maxMemory / 8);
  const view = new DataView(memory);

  let executionCount = 0;
  let peakMemory = 0;
  for (
    let instructionIndex = 0;
    instructionIndex < instructions.length;
    instructionIndex++
  ) {
    executionCount++;
    if (executionCount > 1000000) {
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
            DOUBLE_DEBUG && console.log(`new memory state:`, memory);
            break;
          }
          default:
            break;
        }
        break;
      }
      case "assign": {
        let leftValue: number = readValue(
          view,
          instruction.left.value / 8,
          instruction.left.numberType,
          instruction.left.size
        ) as number;
        let rightValue: number = 0;
        switch (instruction.right.type) {
          case "const": {
            DEBUG &&
              console.log(
                `set ${instruction.action} with constant value ${dec2bin(
                  instruction.right.value || 0,
                  instruction.right.size
                )
                  .toString()
                  .padStart(instruction.right.size, "0")} at offset ${
                  instruction.left.value
                }`
              );
            rightValue = instruction.right.value;
            break;
          }
          case "var": {
            rightValue = readValue(
              view,
              instruction.right.value / 8,
              instruction.right.numberType,
              instruction.right.size
            ) as number;
            DEBUG &&
              console.log(
                `set ${instruction.action} with var value ${rightValue} from address ${instruction.right.value} at offset ${instruction.left.value}`
              );
            break;
          }
          default:
            break;
        }
        if (typeof leftValue === "number" && typeof rightValue === "bigint") {
          rightValue = Number(rightValue);
        } else if (
          typeof leftValue === "bigint" &&
          typeof rightValue === "number"
        ) {
          rightValue = (BigInt(
            instruction.right.numberType === NumberType.FLOAT
              ? Math.floor(rightValue)
              : rightValue
          ) as unknown) as number;
        }

        let toWrite: number | bigint = 0;
        switch (instruction.action) {
          case "=": {
            toWrite = rightValue;
            break;
          }
          case "+": {
            toWrite = leftValue + rightValue;
            break;
          }
          case "-": {
            toWrite = leftValue - rightValue;
            break;
          }
          case "*": {
            toWrite = leftValue * rightValue;
            break;
          }
          case "/": {
            toWrite = leftValue / rightValue;
            if (
              instruction.left.numberType !== NumberType.FLOAT &&
              typeof rightValue !== "bigint"
            ) {
              toWrite = Math.floor(toWrite);
            }
            break;
          }
          case "%": {
            toWrite = leftValue % rightValue;
            break;
          }
          case "&&": {
            toWrite = leftValue & rightValue;
            break;
          }
          case "||": {
            toWrite = leftValue | rightValue;
            break;
          }
          default:
            break;
        }
        writeValue(
          view,
          instruction.left.value / 8,
          instruction.left.numberType,
          instruction.left.size,
          toWrite
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
        let leftValue = 0,
          rightValue = 0;
        switch (instruction.left.type) {
          case "const": {
            leftValue = instruction.left.value;
            break;
          }
          case "var": {
            leftValue = readValue(
              view,
              instruction.left.value / 8,
              instruction.left.numberType,
              instruction.left.size
            );
            break;
          }
          default:
            break;
        }
        switch (instruction.right.type) {
          case "const": {
            rightValue = instruction.right.value!;
            break;
          }
          case "var": {
            rightValue = readValue(
              view,
              instruction.right.value / 8,
              instruction.right.numberType,
              instruction.right.size
            );
            break;
          }
          default:
            break;
        }
        if (typeof leftValue === "number" && typeof rightValue === "bigint") {
          rightValue = Number(rightValue);
        } else if (
          typeof leftValue === "bigint" &&
          typeof rightValue === "number"
        ) {
          rightValue = (BigInt(rightValue) as unknown) as number;
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
            : instruction.scope.closeInstruction.originalInstructionIndex;
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
            switch (instruction.type) {
              case "var": {
                let value = readValue(
                  view,
                  instruction.value / 8,
                  instruction.numberType,
                  instruction.size
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
                  value: instruction.value.toString(),
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
