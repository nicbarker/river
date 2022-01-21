/* eslint-disable no-sparse-arrays */
import { CompiledInstruction } from "../parse";
import { ASMBlock } from "./compiler";

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
        ['(import "console" "log" (func $log32 (param i32)))'],
        ['(import "console" "log" (func $log64 (param i64)))'],
        [],
        ["(memory 1)"],
        [],
        [`(func $${fileName}`],
      ],
    ],
  ];

  let printEnd = 0;
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
        const targetSize = instruction.size === 64 ? 64 : 32;
        const sourceSize = instruction.size === 64 ? 64 : 32;
        let source = "";
        const target = instruction.target / 8;
        instructionOutputs[1].push([...indent, `i32.const ${target}`]);
        if (instruction.action !== "=") {
          instructionOutputs[1].push([...indent, `i32.const ${target}`]);
          instructionOutputs[1].push([...indent, `i${targetSize}.load`]);
        }
        switch (instruction.source) {
          case "const": {
            source = instruction.value?.toString() || "0";
            instructionOutputs[1].push([
              ...indent,
              `i${targetSize}.const ${source}`,
            ]);
            break;
          }
          case "var": {
            instructionOutputs[1].push([
              ...indent,
              `i32.const ${instruction.address! / 8}`,
            ]);
            instructionOutputs[1].push([...indent, `i${sourceSize}.load`]);
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
            action = "div";
            break;
          }
          case "%": {
            action = "rem_u";
            break;
          }
          default:
            break;
        }
        if (action) {
          instructionOutputs[1].push([...indent, `i${sourceSize}.${action}`]);
        }
        instructionOutputs[1].push([...indent, `i${sourceSize}.store`]);

        break;
      }
      case "jump": {
        if (instruction.type === "start") {
          let branch = "br";
          if (printEnd === 1) {
            branch = "br_if";
            printEnd--;
            indent.pop();
          }
          instructionOutputs[1].push([...indent, `${branch} $${loopDepth}`]);
          loopDepth -= 1;
          indent.pop();
          instructionOutputs[1].push([...indent, `end`]);
        }
        if (instruction.type === "end") {
          instructionOutputs[1].push([
            ,
            `;; ${instructionIndex}: ${instruction.serialized}`,
          ]);
          instructionOutputs[1].push([
            ...indent,
            `br $${instruction.scope.openInstruction.originalInstructionIndex}`,
          ]);
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
            comp = "lt_u";
            break;
          case "<=":
            comp = "le_u";
            break;
          case ">":
            comp = "gt_u";
            break;
          case ">=":
            comp = "ge_u";
            break;
          case "!=":
            comp = "ne";
            break;
          default:
            break;
        }
        const leftSize = instruction.left.size === 64 ? 64 : 32;
        switch (instruction.left.source) {
          case "const": {
            const source = instruction.left.value?.toString() || "0";
            instructionOutputs[1].push([
              ...indent,
              `i${leftSize}.const ${source}`,
            ]);
            break;
          }
          case "var": {
            instructionOutputs[1].push([
              ...indent,
              `i32.const ${instruction.left.address! / 8}`,
            ]);
            instructionOutputs[1].push([...indent, `i${leftSize}.load`]);
            break;
          }
          default:
            break;
        }

        const rightSize = instruction.left.size === 64 ? 64 : 32;
        switch (instruction.right.source) {
          case "const": {
            const source = instruction.right.value?.toString() || "0";
            instructionOutputs[1].push([
              ...indent,
              `i${rightSize}.const ${source}`,
            ]);
            break;
          }
          case "var": {
            instructionOutputs[1].push([
              ...indent,
              `i32.const ${instruction.right.address! / 8}`,
            ]);
            instructionOutputs[1].push([...indent, `i${rightSize}.load`]);
            break;
          }
          default:
            break;
        }

        instructionOutputs[1].push([...indent, `i${leftSize}.${comp}`]);

        if (instructionIndex < instructions.length - 1) {
          // We use a br_if instead of an if statement in the case of compare then jump
          instructions[instructionIndex + 1].instruction !== "jump" &&
            instructionOutputs[1].push([...indent, `if`]);
          indent.push(undefined);
          printEnd = 2;
          break;
        }
        break;
      }
      case "os": {
        switch (instruction.action) {
          case "stdout": {
            instructionOutputs[1].push([
              ,
              `;; ${instructionIndex}: ${instruction.serialized}`,
            ]);
            switch (instruction.source) {
              case "var": {
                const sourceSize = instruction.size === 64 ? 64 : 32;
                const source = instruction.address! / 8;
                instructionOutputs[1].push([...indent, `i32.const ${source}`]);
                instructionOutputs[1].push([...indent, `i${sourceSize}.load`]);
                instructionOutputs[1].push([
                  ...indent,
                  `call $log${sourceSize}`,
                ]);
                break;
              }
              case "const": {
                instructionOutputs[1].push([
                  ...indent,
                  `i64.const ${instruction.value!}`,
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
          loopDepth += 1;
          instructionOutputs[1].push([...indent, `${"block"} $${loopDepth}`]);
          indent.push(undefined);
          for (let i = 0; i < instruction.loopCount; i++) {
            loopDepth += 1;
            instructionOutputs[1].push([...indent, `loop $${loopDepth}`]);
            indent.push(undefined);
          }
        } else {
          loopDepth--;
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
