/* eslint-disable no-sparse-arrays */
import {
  AssignAction,
  CompareAction,
  FragmentType,
  InstructionAssignValid,
  InstructionCompareValid,
  InstructionType,
  InstructionValid,
  JumpAction,
  OSAction,
} from "../parse2";
import { NumberType } from "../types/river_types";
import { ASMBlock } from "./compiler";

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

function truncateOrWrap(instruction: InstructionAssignValid | InstructionCompareValid): string | undefined {
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
  else if (instruction.left.numberType !== NumberType.FLOAT && instruction.right.numberType === NumberType.FLOAT) {
    return `i${instruction.left.size}.trunc_f${instruction.right.size}_${
      instruction.left.numberType === NumberType.UINT ? "u" : "s"
    }`;
    // Convert ints to float e.g. (f64.convert_i32_u)
  } else if (instruction.left.numberType === NumberType.FLOAT && instruction.right.numberType !== NumberType.FLOAT) {
    return `f${instruction.left.size}.convert_i${instruction.right.size}_${
      instruction.right.numberType === NumberType.UINT ? "u" : "s"
    }`;
    // Integers
  } else if (instruction.right.numberType !== NumberType.FLOAT && instruction.left.numberType !== NumberType.FLOAT) {
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
  instructions: InstructionValid[],
  serializedInstructions: string[],
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
  for (let instructionIndex = 0; instructionIndex < instructions.length; instructionIndex++) {
    const instruction = instructions[instructionIndex];
    const instructionOutputs: ASMBlock = [instructionIndex, []];
    switch (instruction.type) {
      case InstructionType.ASSIGN: {
        instructionOutputs[1].push([, `;; ${instructionIndex}: ${serializedInstructions[instructionIndex]}`]);
        const leftAddress = instruction.left.value / 8;
        instructionOutputs[1].push([...indent, `i32.const ${leftAddress}`]);
        if (instruction.action.action !== AssignAction.EQUALS) {
          instructionOutputs[1].push([...indent, `i32.const ${leftAddress}`]);
          instructionOutputs[1].push([
            ...indent,
            `${numberTypePrefix(instruction.left.numberType)}${instruction.left.size}.load`,
          ]);
        }
        switch (instruction.right.type) {
          case FragmentType.CONST: {
            const rightValue = instruction.right.value.toString() || "0";
            instructionOutputs[1].push([
              ...indent,
              `${numberTypePrefix(instruction.right.numberType)}${instruction.right.size}.const ${rightValue}`,
            ]);
            break;
          }
          case FragmentType.VAR: {
            instructionOutputs[1].push([...indent, `i32.const ${instruction.right.value / 8}`]);
            instructionOutputs[1].push([
              ...indent,
              `${numberTypePrefix(instruction.right.numberType)}${instruction.right.size}.load`,
            ]);
            break;
          }
          default:
            break;
        }
        let action: string | null = null;
        switch (instruction.action.action) {
          case AssignAction.ADD: {
            action = "add";
            break;
          }
          case AssignAction.SUBTRACT: {
            action = "sub";
            break;
          }
          case AssignAction.MULTIPLY: {
            action = "mul";
            break;
          }
          case AssignAction.DIVIDE: {
            if (instruction.left.numberType === NumberType.UINT) {
              action = "div_u";
            } else if (instruction.left.numberType === NumberType.INT) {
              action = "div_s";
            } else {
              action = "div";
            }
            break;
          }
          case AssignAction.MOD: {
            if (instruction.left.numberType === NumberType.UINT) {
              action = "rem_u";
            } else if (instruction.left.numberType === NumberType.INT) {
              action = "rem_s";
            } else {
              action = "div";
            }
            break;
          }
          case AssignAction.AND: {
            action = "and";
            break;
          }
          case AssignAction.OR: {
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
            `${numberTypePrefix(instruction.left.numberType)}${instruction.left.size}.${action}`,
          ]);
        }
        instructionOutputs[1].push([
          ...indent,
          `${numberTypePrefix(instruction.left.numberType)}${instruction.left.size}.store`,
        ]);

        break;
      }
      case InstructionType.JUMP: {
        instructionOutputs[1].push([, `;; ${instructionIndex}: ${serializedInstructions[instructionIndex]}`]);
        let branch = "br";
        if (printEnd === 1) {
          branch = "br_if";
          printEnd--;
          indent.pop();
        }
        if (instruction.action.action === JumpAction.START) {
          instructionOutputs[1].push([...indent, `${branch} $${blockDepth}_${loopDepth}`]);
          loopDepth -= 1;
          indent.pop();
          instructionOutputs[1].push([...indent, `end`]);
        } else {
          instructionOutputs[1].push([...indent, `br_if $${blockDepth}`]);
        }
        break;
      }
      case InstructionType.COMPARE: {
        instructionOutputs[1].push([, `;; ${instructionIndex}: ${serializedInstructions[instructionIndex]}`]);
        let comp = "";
        switch (instruction.action.action) {
          case CompareAction.EQUAL:
            comp = "eq";
            break;
          case CompareAction.LESS:
            comp = `lt${comparatorSignSuffix}`;
            break;
          case CompareAction.LESS_EQUAL:
            comp = `le${comparatorSignSuffix}`;
            break;
          case CompareAction.GREATER:
            comp = `gt${comparatorSignSuffix}`;
            break;
          case CompareAction.GREATER_EQUAL:
            comp = `ge${comparatorSignSuffix}`;
            break;
          case CompareAction.NOT_EQUAL:
            comp = "ne";
            break;
          default:
            break;
        }
        instructionOutputs[1].push([...indent, `i32.const ${instruction.left.value / 8}`]);
        instructionOutputs[1].push([
          ...indent,
          `${numberTypePrefix(instruction.left.numberType)}${instruction.left.size}.load`,
        ]);

        const rightSize = instruction.left.size === 64 ? 64 : 32;
        switch (instruction.right.type) {
          case FragmentType.CONST: {
            const source = instruction.right.value.toString() || "0";
            instructionOutputs[1].push([...indent, `i${rightSize}.const ${source}`]);
            break;
          }
          case FragmentType.VAR: {
            instructionOutputs[1].push([...indent, `i32.const ${instruction.right.value / 8}`]);
            instructionOutputs[1].push([
              ...indent,
              `${numberTypePrefix(instruction.right.numberType)}${rightSize}.load`,
            ]);
            break;
          }
          default:
            break;
        }

        instructionOutputs[1].push([...indent, `i${instruction.left.size}.${comp}`]);

        if (instructionIndex < instructions.length - 1) {
          const nextInstruction = instructions[instructionIndex + 1];
          // We use a br_if instead of an if statement in the case of compare then jump
          if (nextInstruction.type !== InstructionType.JUMP) {
            instructionOutputs[1].push([...indent, `if`]);
          }
          indent.push(undefined);
          printEnd = 2;
          break;
        }
        break;
      }
      case InstructionType.OS: {
        instructionOutputs[1].push([, `;; ${instructionIndex}: ${serializedInstructions[instructionIndex]}`]);
        switch (instruction.action.action) {
          case OSAction.STDOUT: {
            switch (instruction.action.varType.type) {
              case FragmentType.VAR: {
                const source = instruction.action.varType.value / 8;
                instructionOutputs[1].push([...indent, `i32.const ${source}`]);
                instructionOutputs[1].push([
                  ...indent,
                  `${numberTypePrefix(instruction.action.varType.numberType)}${instruction.action.varType.size}.load`,
                ]);
                instructionOutputs[1].push([
                  ...indent,
                  `call $log${numberTypePrefix(instruction.action.varType.numberType)}${
                    instruction.action.varType.size
                  }`,
                ]);
                break;
              }
              case FragmentType.CONST: {
                instructionOutputs[1].push([...indent, `i64.const ${instruction.action.varType.value}`]);
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
      case InstructionType.SCOPE: {
        instructionOutputs[1].push([
          ,
          instructionIndex === -1
            ? `;; ${instruction.action === "open" ? "begin" : "end"} program`
            : `;; ${instructionIndex}: ${serializedInstructions[instructionIndex]}`,
        ]);
        if (instruction.action === "open") {
          blockDepth += 1;
          instructionOutputs[1].push([...indent, `${"block"} $${blockDepth}`]);
          indent.push(undefined);
          for (let i = 0; i < instruction.loopCount; i++) {
            loopDepth += 1;
            instructionOutputs[1].push([...indent, `loop $${blockDepth}_${loopDepth}`]);
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
