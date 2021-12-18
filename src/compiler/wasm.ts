/* eslint-disable no-sparse-arrays */
import { CompiledInstruction } from "../parse";
import { ASMBlock } from "./compiler";

export function compileWasm(
  fileName: string,
  instructions: CompiledInstruction[],
  maxMemory: number
) {
  /* OSX and windows have different conventions for syscalls.
   * OSX requires a 16 byte call stack alignment, with 8 bytes being used for the return
   * value, hence we push the default pointer size (8 bytes) onto the stack before calling.
   * Windows requires us to allocate 32 bytes of "shadow space", which added to our 8 byte alignment
   * gives us 40 bytes (hex value 28h).
   * See https://stackoverflow.com/questions/30190132/what-is-the-shadow-space-in-x64-assembly/30191127#30191127
   */
  let indent = [,];
  const output: ASMBlock[] = [
    [
      -1,
      [
        [";; --------------------------------------------------"],
        [";; Generated with River compiler 1.0"],
        [";; Targeting .wat WebAssembly text format"],
        [";; --------------------------------------------------"],
        ['(import "console" "log" (func $log (param i32)))'],
        [],
        ["(memory 1)"],
        [],
        [`(func $${fileName}`],
      ],
    ],
  ];

  let printEnd = 0;
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
        instructionOutputs[1].push([
          ...indent,
          `i${targetSize}.const ${target}`,
        ]);
        if (instruction.action !== "=") {
          instructionOutputs[1].push([
            ...indent,
            `i${targetSize}.const ${target}`,
          ]);
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
              `i${targetSize}.const ${instruction.address! / 8}`,
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
            action = "mod";
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
              `i${leftSize}.const ${instruction.left.address! / 8}`,
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
              `i${rightSize}.const ${instruction.right.address! / 8}`,
            ]);
            instructionOutputs[1].push([...indent, `i${rightSize}.load`]);
            break;
          }
          default:
            break;
        }

        instructionOutputs[1].push([...indent, `i${leftSize}.${comp}`]);

        if (instructionIndex < instructions.length - 1) {
          const nextInstruction = instructions[instructionIndex + 1];
          switch (nextInstruction.instruction) {
            case "jump": {
              if (nextInstruction.type === "start") {
                instructionOutputs[1].push([...indent, `i${leftSize}.const 0`]);
                instructionOutputs[1].push([...indent, `i${leftSize}.eq`]);
                instructionOutputs[1].push([
                  ...indent,
                  `br_if $${nextInstruction.scope.openInstruction.originalInstructionIndex}`,
                ]);
              }
              if (nextInstruction.type === "end") {
                instructionOutputs[1].push([
                  ...indent,
                  `br_if $${nextInstruction.scope.openInstruction.originalInstructionIndex}`,
                ]);
              }
              break;
            }
            default: {
              instructionOutputs[1].push([...indent, `if`]);
              indent.push(undefined);
              printEnd = 2;
              break;
            }
          }
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
            // const [mov, size] = moveAndLabelForSize(instruction.size);
            // instructionOutputs[1].push(preSysCall);
            // instructionOutputs[1].push([
            //   ,
            //   "lea",
            //   `${syscallArgumentRegisters(target, 0)}, [rel message]`,
            // ]);
            // instructionOutputs[1].push([
            //   ,
            //   mov,
            //   `${syscallArgumentRegisters(target, 1)}, ${size} ${memoryOffset(
            //     instruction.address! / 8
            //   )}`,
            // ]);
            // instructionOutputs[1].push([, "call", printfLabel]);
            // instructionOutputs[1].push(postSysCall);
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
          instructionOutputs[1].push([
            ...indent,
            `${"block"} $${instruction.originalInstructionIndex}`,
          ]);
          indent.push(undefined);
          for (let i = 0; i < instruction.loopCount; i++) {
            instructionOutputs[1].push([...indent, `${"loop"}`]);
            indent.push(undefined);
          }
        } else {
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
    } else if (printEnd > 0) {
      printEnd--;
    }

    if (instructionOutputs[1].length > 0) {
      output.push(instructionOutputs);
    }
  }

  output.push([-1, [[")"]]]);
  output.push([-1, []]);
  output.push([-1, [[`(export "${fileName}" (func $${fileName}))`]]]);

  console.log(output);
  return output;
}
