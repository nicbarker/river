/* eslint-disable no-sparse-arrays */
import { AssignInstruction, CompareInstruction } from "../editor_handler";
import {
  CompiledInstruction,
  CompiledInstructionAssign,
  CompiledInstructionCompare,
} from "../parse";
import { NumberType } from "../types/river_types";
import { ASMBlock, ASMLine } from "./compiler";

function numberTypePrefix(numberType: NumberType) {
  if (numberType === NumberType.FLOAT) {
    return "f";
  } else {
    return "i";
  }
}

function comparatorSignSuffix(numberType: NumberType) {
  if (numberType === NumberType.FLOAT) {
    return "";
  } else if (numberType === NumberType.INT) {
    return "_s";
  } else {
    return "_u";
  }
}

function truncateOrWrap(
  instruction: CompiledInstructionAssign | CompiledInstructionCompare
): string | undefined {
  // Truncation and wrapping -----
  // Promote or demote floats
  if (
    instruction.left.numberType === NumberType.FLOAT &&
    instruction.right.numberType === NumberType.FLOAT &&
    instruction.left.size !== instruction.right.size
  ) {
    if (instruction.left.size === 32) {
      return `f32.demote_f64`;
    } else {
      return `f64.promote_f32`;
    }
  }
  // Truncate floats down to signed or unsigned int e.g. (i32.trunc_f32_s)
  else if (
    instruction.left.numberType !== NumberType.FLOAT &&
    instruction.right.numberType === NumberType.FLOAT
  ) {
    return `i${instruction.left.size}.trunc_f${instruction.right.size}_${
      instruction.left.numberType === NumberType.UINT ? "u" : "s"
    }`;
    // Convert ints to float e.g. (f64.convert_i32_u)
  } else if (
    instruction.left.numberType === NumberType.FLOAT &&
    instruction.right.numberType !== NumberType.FLOAT
  ) {
    return `f${instruction.left.size}.convert_i${instruction.right.size}_${
      instruction.right.numberType === NumberType.UINT ? "u" : "s"
    }`;
    // Integers
  } else if (
    instruction.right.numberType !== NumberType.FLOAT &&
    instruction.left.numberType !== NumberType.FLOAT
  ) {
    // Extend if the right hand side is smaller
    if (instruction.left.size === 64 && instruction.right.size === 32) {
      return `i64.extend_i32_${instruction.right.numberType}`;
      // Wrap if the right hand side is larger
    } else if (instruction.left.size === 32 && instruction.right.size === 64) {
      return `i32.wrap_i64`;
    }
  }
}

export function compileWasm(
  fileName: string,
  instructions: CompiledInstruction[],
  maxMemory: number
) {
  let indent = [,];
  const output: ASMBlock[] = [
    [
      -1,
      [
        [";; --------------------------------------------------"],
        [";; Generated with River compiler 1.0"],
        [";; Targeting .wat WebAssembly text format"],
        [";; See github.com/nicbarker/river#running-wasm"],
        [";; --------------------------------------------------"],
        ['(import "console" "log" (func $logi32 (param i32)))'],
        ['(import "console" "log" (func $logi64 (param i64)))'],
        ['(import "console" "log" (func $logf32 (param f32)))'],
        ['(import "console" "log" (func $logf64 (param f64)))'],
        [],
        ["(memory 1)"],
        [],
        [`(func $${fileName}`],
      ],
    ],
  ];

  let printEnd = 0;
  let blockDepth = 0;
  let loopDepth = 0;
  for (
    let instructionIndex = 0;
    instructionIndex < instructions.length;
    instructionIndex++
  ) {
    const instruction = instructions[instructionIndex];
    const instructionOutputs: ASMBlock = [
      instruction.originalInstructionIndex,
      [],
    ];
    switch (instruction.instruction) {
      case "assign": {
        instructionOutputs[1].push([
          ,
          `;; ${instructionIndex}: ${instruction.serialized}`,
        ]);
        const leftAddress = instruction.left.value / 8;
        instructionOutputs[1].push([...indent, `i32.const ${leftAddress}`]);
        if (instruction.action !== "=") {
          instructionOutputs[1].push([...indent, `i32.const ${leftAddress}`]);
          instructionOutputs[1].push([
            ...indent,
            `${numberTypePrefix(instruction.left.numberType)}${
              instruction.left.size
            }.load`,
          ]);
        }
        switch (instruction.right.type) {
          case "const": {
            const rightValue = instruction.right.value.toString() || "0";
            instructionOutputs[1].push([
              ...indent,
              `${numberTypePrefix(instruction.right.numberType)}${
                instruction.right.size
              }.const ${rightValue}`,
            ]);
            break;
          }
          case "var": {
            instructionOutputs[1].push([
              ...indent,
              `i32.const ${instruction.right.value / 8}`,
            ]);
            instructionOutputs[1].push([
              ...indent,
              `${numberTypePrefix(instruction.right.numberType)}${
                instruction.right.size
              }.load`,
            ]);
            break;
          }
          default:
            break;
        }
        let action: string | null = null;
        switch (instruction.action) {
          case "+": {
            action = "add";
            break;
          }
          case "-": {
            action = "sub";
            break;
          }
          case "*": {
            action = "mul";
            break;
          }
          case "/": {
            if (instruction.left.numberType === NumberType.UINT) {
              action = "div_u";
            } else if (instruction.left.numberType === NumberType.INT) {
              action = "div_s";
            } else {
              action = "div";
            }
            break;
          }
          case "%": {
            if (instruction.left.numberType === NumberType.UINT) {
              action = "rem_u";
            } else if (instruction.left.numberType === NumberType.INT) {
              action = "rem_s";
            } else {
              action = "div";
            }
            break;
          }
          case "&&": {
            action = "and";
            break;
          }
          case "||": {
            action = "or";
            break;
          }
          default:
            break;
        }
        const truncOrWrap = truncateOrWrap(instruction);
        if (truncOrWrap) {
          instructionOutputs[1].push([...indent, truncOrWrap]);
        }
        if (action) {
          instructionOutputs[1].push([
            ...indent,
            `${numberTypePrefix(instruction.left.numberType)}${
              instruction.left.size
            }.${action}`,
          ]);
        }
        instructionOutputs[1].push([
          ...indent,
          `${numberTypePrefix(instruction.left.numberType)}${
            instruction.left.size
          }.store`,
        ]);

        break;
      }
      case "jump": {
        instructionOutputs[1].push([
          ,
          `;; ${instructionIndex}: ${instruction.serialized}`,
        ]);
        let branch = "br";
        if (printEnd === 1) {
          branch = "br_if";
          printEnd--;
          indent.pop();
        }
        if (instruction.type === "start") {
          instructionOutputs[1].push([
            ...indent,
            `${branch} $${blockDepth}_${loopDepth}`,
          ]);
          loopDepth -= 1;
          indent.pop();
          instructionOutputs[1].push([...indent, `end`]);
        } else {
          instructionOutputs[1].push([...indent, `br_if $${blockDepth}`]);
        }
        break;
      }
      case "compare": {
        instructionOutputs[1].push([
          ,
          `;; ${instructionIndex}: ${instruction.serialized}`,
        ]);
        let comp = "";
        switch (instruction.action) {
          case "==":
            comp = "eq";
            break;
          case "<":
            comp = `lt${comparatorSignSuffix}`;
            break;
          case "<=":
            comp = `le${comparatorSignSuffix}`;
            break;
          case ">":
            comp = `gt${comparatorSignSuffix}`;
            break;
          case ">=":
            comp = `ge${comparatorSignSuffix}`;
            break;
          case "!=":
            comp = "ne";
            break;
          default:
            break;
        }
        switch (instruction.left.type) {
          case "const": {
            const source = instruction.left.value.toString() || "0";
            instructionOutputs[1].push([
              ...indent,
              `i${instruction.left.size}.const ${source}`,
            ]);
            break;
          }
          case "var": {
            instructionOutputs[1].push([
              ...indent,
              `i32.const ${instruction.left.value / 8}`,
            ]);
            instructionOutputs[1].push([
              ...indent,
              `${numberTypePrefix(instruction.left.numberType)}${
                instruction.left.size
              }.load`,
            ]);
            break;
          }
          default:
            break;
        }

        const rightSize = instruction.left.size === 64 ? 64 : 32;
        switch (instruction.right.type) {
          case "const": {
            const source = instruction.right.value.toString() || "0";
            instructionOutputs[1].push([
              ...indent,
              `i${rightSize}.const ${source}`,
            ]);
            break;
          }
          case "var": {
            instructionOutputs[1].push([
              ...indent,
              `i32.const ${instruction.right.value / 8}`,
            ]);
            instructionOutputs[1].push([
              ...indent,
              `${numberTypePrefix(
                instruction.right.numberType
              )}${rightSize}.load`,
            ]);
            break;
          }
          default:
            break;
        }

        instructionOutputs[1].push([
          ...indent,
          `i${instruction.left.size}.${comp}`,
        ]);

        if (instructionIndex < instructions.length - 1) {
          const nextInstruction = instructions[instructionIndex + 1];
          // We use a br_if instead of an if statement in the case of compare then jump
          if (nextInstruction.instruction !== "jump") {
            instructionOutputs[1].push([...indent, `if`]);
          }
          indent.push(undefined);
          printEnd = 2;
          break;
        }
        break;
      }
      case "os": {
        instructionOutputs[1].push([
          ,
          `;; ${instructionIndex}: ${instruction.serialized}`,
        ]);
        switch (instruction.action) {
          case "stdout": {
            switch (instruction.type) {
              case "var": {
                const source = instruction.value / 8;
                instructionOutputs[1].push([...indent, `i32.const ${source}`]);
                instructionOutputs[1].push([
                  ...indent,
                  `${numberTypePrefix(instruction.numberType)}${
                    instruction.size
                  }.load`,
                ]);
                instructionOutputs[1].push([
                  ...indent,
                  `call $log${numberTypePrefix(instruction.numberType)}${
                    instruction.size
                  }`,
                ]);
                break;
              }
              case "const": {
                instructionOutputs[1].push([
                  ...indent,
                  `i64.const ${instruction.value}`,
                ]);
                instructionOutputs[1].push([...indent, `call $log64`]);
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
      case "scope": {
        instructionOutputs[1].push([
          ,
          instruction.originalInstructionIndex === -1
            ? `;; ${instruction.action === "open" ? "begin" : "end"} program`
            : `;; ${instruction.originalInstructionIndex}: ${instruction.serialized}`,
        ]);
        if (instruction.action === "open") {
          blockDepth += 1;
          instructionOutputs[1].push([...indent, `${"block"} $${blockDepth}`]);
          indent.push(undefined);
          for (let i = 0; i < instruction.loopCount; i++) {
            loopDepth += 1;
            instructionOutputs[1].push([
              ...indent,
              `loop $${blockDepth}_${loopDepth}`,
            ]);
            indent.push(undefined);
          }
        } else {
          blockDepth--;
          indent.pop();
          instructionOutputs[1].push([...indent, `end`]);
        }
        break;
      }
      default:
        break;
    }
    if (printEnd === 1) {
      indent.pop();
      instructionOutputs[1].push([...indent, `end`]);
    }

    if (printEnd > 0) {
      printEnd--;
    }

    if (instructionOutputs[1].length > 0) {
      output.push(instructionOutputs);
    }
  }

  output.push([-1, [[")"]]]);
  output.push([-1, []]);
  output.push([-1, [[`(export "${fileName}" (func $${fileName}))`]]]);

  return output;
}
