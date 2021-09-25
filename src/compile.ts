import { CompiledInstruction, Scope } from "./parse";

function moveAndLabelForSize(instructionSize: number) {
  let size = "";
  let mov = "";
  switch (instructionSize) {
    case 8:
      size = "byte";
      mov = "movsx";
      break;
    case 16:
      size = "word";
      mov = "movsx";
      break;
    case 32:
      size = "dword";
      mov = "movsxd";
      break;
    case 64:
      size = "qword";
      mov = "mov";
      break;
    default:
      throw Error(`Bad size ${instructionSize} passed to moveAndLabelForSize`);
  }
  return [mov, size];
}

function formatOp(
  instruction: string,
  firstOperand: string,
  secondOperand?: string
) {
  return `${"".padEnd(10)}${instruction.padEnd(10)}${firstOperand}${
    secondOperand === undefined ? "" : `, ${secondOperand}`
  }\n`;
}

function formatLabel(label: string) {
  return `j${label}:\n`;
}

function formatLineNumber(
  lineNumber: number,
  instruction: CompiledInstruction
) {
  return `${"".padEnd(10)}; ${lineNumber}: ${instruction.serialized}\n`;
}

function memoryOffset(offset: number) {
  return `[r12${offset > 0 ? " + " + offset : ""}]`;
}

export function compile(
  scopesFinal: Scope[],
  instructions: CompiledInstruction[],
  maxMemory: number,
  jumps: number[]
) {
  let output = `; --------------------------------------------------
; Generated with river compiler 1.0
; Targeting OSX x64 with assembler nasm 2.15.05
; nasm -fmacho64 malloc.asm && gcc malloc.o
; --------------------------------------------------
          global     _main
          extern     _malloc, _printf

          section   .text
_main:    push      rbx
          lea       rdi, ${maxMemory / 8}
          call      _malloc
          pop       rbx
          mov       r12, rax
`;
  for (
    let instructionIndex = 0;
    instructionIndex < instructions.length;
    instructionIndex++
  ) {
    const instruction = instructions[instructionIndex];
    if (jumps.includes(instructionIndex)) {
      output += formatLabel(instructionIndex.toString());
    }
    switch (instruction.instruction) {
      case "assign": {
        output += formatLineNumber(instructionIndex, instruction);
        const [mov, size] = moveAndLabelForSize(instruction.size);
        let source = "";
        const target = instruction.target / 8;
        let operands: string[] = [];
        switch (instruction.source) {
          case "const": {
            source = instruction.value?.toString() || "0";
            switch (instruction.action) {
              case "=":
              case "+":
              case "-": {
                operands = [
                  `${size} [r12${target > 0 ? " + " + target : ""}]`,
                  source,
                ];
                break;
              }
              case "*": {
                output += formatOp(mov, "r13", memoryOffset(target));
                operands = ["r13", source];
                break;
              }
              case "/":
              case "%": {
                output +=
                  formatOp("xor", "rdx", "rdx") +
                  formatOp("mov", "r13", source) +
                  formatOp(mov, "rax", memoryOffset(target));
                operands = ["r13"];
                break;
              }
              default:
                break;
            }
            break;
          }
          case "var": {
            output += formatOp(
              mov,
              "r13",
              memoryOffset(instruction.address! / 8)
            );
            operands = [memoryOffset(target), "r13"];
            break;
          }
          default:
            break;
        }
        switch (instruction.action) {
          case "=": {
            output += formatOp("mov", operands[0], operands[1]);
            break;
          }
          case "+": {
            output += formatOp("add", operands[0], operands[1]);
            break;
          }
          case "-": {
            output += formatOp("sub", operands[0], operands[1]);
            break;
          }
          case "*": {
            output +=
              formatOp("imul", operands[0], operands[1]) +
              formatOp("mov", memoryOffset(target), "r13");
            break;
          }
          case "/": {
            output +=
              formatOp("idiv", operands[0]) +
              formatOp("mov", memoryOffset(target), "rax");
            break;
          }
          case "%": {
            output +=
              formatOp("idiv", operands[0]) +
              formatOp("mov", memoryOffset(target), "rdx");
            break;
          }
          default:
            break;
        }
        break;
      }
      case "jump": {
        output +=
          formatLineNumber(instructionIndex, instruction) +
          formatOp("jmp", `j${instruction.target}`);
        break;
      }
      case "compare": {
        output += formatLineNumber(instructionIndex, instruction);
        let jump = "";
        switch (instruction.action) {
          case "=":
            jump = "jne";
            break;
          case "<":
            jump = "jge";
            break;
          case "<=":
            jump = "jg";
            break;
          case ">":
            jump = "jle";
            break;
          case ">=":
            jump = "jl";
            break;
          case "!=":
            jump = "je";
            break;
          default:
            break;
        }
        switch (instruction.left.source) {
          case "const": {
            output += formatOp("mov", "r13", `${instruction.left.value}`);
            break;
          }
          case "var": {
            output += formatOp(
              "mov",
              "r13",
              memoryOffset(instruction.left.value!)
            );
            break;
          }
          default:
            break;
        }
        switch (instruction.right.source) {
          case "const": {
            output += formatOp("mov", "r14", `${instruction.right.value}`);
            break;
          }
          case "var": {
            output += formatOp(
              "mov",
              "r14",
              memoryOffset(instruction.right.value!)
            );
            break;
          }
          default:
            break;
        }
        output +=
          formatOp("cmp", "r13", "r14") +
          formatOp(jump, `j${instructionIndex + 2}`);
        break;
      }
      case "os": {
        output += formatLineNumber(instructionIndex, instruction);
        switch (instruction.action) {
          case "stdout": {
            const [mov, size] = moveAndLabelForSize(instruction.size);
            output +=
              formatOp("push", "rbx") +
              formatOp("lea", "rdi", "[rel message]") +
              formatOp(
                mov,
                "rsi",
                `${size} ${memoryOffset(instruction.address! / 8)}`
              ) +
              formatOp("call", "_printf") +
              formatOp("pop", "rbx");
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

  output += `          ret

          section   .data
message:  db        "%d", 0x0a
`;

  return output;
}
