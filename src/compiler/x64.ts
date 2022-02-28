/* eslint-disable no-sparse-arrays */
import { CompiledInstruction } from "../parse";
import { NumberType } from "../types/river_types";
import { ASMBlock, ASMLine } from "./compiler";

function registerWithSize(reg: string, size: number) {
  let output = "";
  switch (reg) {
    case "rax": {
      switch (size) {
        case 8:
          output = "al";
          break;
        case 16:
          output = "ax";
          break;
        case 32:
          output = "eax";
          break;
        case 64:
          output = "rax";
          break;
        default:
          break;
      }
      break;
    }
    case "rcx": {
      switch (size) {
        case 8:
          output = "cl";
          break;
        case 16:
          output = "cx";
          break;
        case 32:
          output = "ecx";
          break;
        case 64:
          output = "rcx";
          break;
        default:
          break;
      }
      break;
    }
    case "rdx": {
      switch (size) {
        case 8:
          output = "dl";
          break;
        case 16:
          output = "dx";
          break;
        case 32:
          output = "edx";
          break;
        case 64:
          output = "rdx";
          break;
        default:
          break;
      }
      break;
    }
    case "rbx": {
      switch (size) {
        case 8:
          output = "bl";
          break;
        case 16:
          output = "bx";
          break;
        case 32:
          output = "ebx";
          break;
        case 64:
          output = "rbx";
          break;
        default:
          break;
      }
      break;
    }
    case "rsi": {
      switch (size) {
        case 8:
          output = "sil";
          break;
        case 16:
          output = "si";
          break;
        case 32:
          output = "esi";
          break;
        case 64:
          output = "rsi";
          break;
        default:
          break;
      }
      break;
    }
    case "rdi": {
      switch (size) {
        case 8:
          output = "dil";
          break;
        case 16:
          output = "di";
          break;
        case 32:
          output = "edi";
          break;
        case 64:
          output = "rdi";
          break;
        default:
          break;
      }
      break;
    }
    case "rsp": {
      switch (size) {
        case 8:
          output = "spl";
          break;
        case 16:
          output = "sp";
          break;
        case 32:
          output = "esp";
          break;
        case 64:
          output = "rsp";
          break;
        default:
          break;
      }
      break;
    }
    case "rbp": {
      switch (size) {
        case 8:
          output = "bpl";
          break;
        case 16:
          output = "bp";
          break;
        case 32:
          output = "ebp";
          break;
        case 64:
          output = "rbp";
          break;
        default:
          break;
      }
      break;
    }
    case "r8": {
      switch (size) {
        case 8:
          output = "r8b";
          break;
        case 16:
          output = "r8w";
          break;
        case 32:
          output = "r8d";
          break;
        case 64:
          output = "r8";
          break;
        default:
          break;
      }
      break;
    }
    case "r9": {
      switch (size) {
        case 8:
          output = "r9b";
          break;
        case 16:
          output = "r9w";
          break;
        case 32:
          output = "r9d";
          break;
        case 64:
          output = "r9";
          break;
        default:
          break;
      }
      break;
    }
    case "r10": {
      switch (size) {
        case 8:
          output = "r10b";
          break;
        case 16:
          output = "r10w";
          break;
        case 32:
          output = "r10d";
          break;
        case 64:
          output = "r10";
          break;
        default:
          break;
      }
      break;
    }
    case "r11": {
      switch (size) {
        case 8:
          output = "r11b";
          break;
        case 16:
          output = "r11w";
          break;
        case 32:
          output = "r11d";
          break;
        case 64:
          output = "r11";
          break;
        default:
          break;
      }
      break;
    }
    case "r12": {
      switch (size) {
        case 8:
          output = "r12b";
          break;
        case 16:
          output = "r12w";
          break;
        case 32:
          output = "r12d";
          break;
        case 64:
          output = "r12";
          break;
        default:
          break;
      }
      break;
    }
    case "r13": {
      switch (size) {
        case 8:
          output = "r13b";
          break;
        case 16:
          output = "r13w";
          break;
        case 32:
          output = "r13d";
          break;
        case 64:
          output = "r13";
          break;
        default:
          break;
      }
      break;
    }
    case "r14": {
      switch (size) {
        case 8:
          output = "r14b";
          break;
        case 16:
          output = "r14w";
          break;
        case 32:
          output = "r14d";
          break;
        case 64:
          output = "r14";
          break;
        default:
          break;
      }
      break;
    }
    case "r15": {
      switch (size) {
        case 8:
          output = "r15b";
          break;
        case 16:
          output = "r15w";
          break;
        case 32:
          output = "r15d";
          break;
        case 64:
          output = "r15";
          break;
        default:
          break;
      }
      break;
    }
    case "xmm0":
    case "xmm1":
      return reg;
  }
  return output;
}

function moveAndLabelForSize(instructionSize: number, numberType: NumberType) {
  let size = "";
  let mov = "";
  switch (instructionSize) {
    case 8:
      size = "byte";
      switch (numberType) {
        case NumberType.UINT:
          mov = "movzx";
          break;
        case NumberType.INT:
          mov = "movsx";
          break;
      }
      break;
    case 16:
      size = "word";
      switch (numberType) {
        case NumberType.UINT:
          mov = "movzx";
          break;
        case NumberType.INT:
          mov = "movsx";
          break;
      }
      break;
    case 32:
      size = "dword";
      switch (numberType) {
        case NumberType.UINT:
          mov = "mov";
          break;
        case NumberType.INT:
          mov = "movsxd";
          break;
        case NumberType.FLOAT:
          mov = "movss";
          break;
      }
      break;
    case 64:
      size = "qword";
      switch (numberType) {
        case NumberType.UINT:
        case NumberType.INT:
          mov = "mov";
          break;
        case NumberType.FLOAT:
          mov = "movsd";
          break;
      }
      break;
    // default:
    //   throw Error(`Bad size ${instructionSize} passed to moveAndLabelForSize`);
  }
  return [mov, size];
}

function operatorForType(
  operator: string,
  numberType: NumberType,
  size: number
) {
  switch (operator) {
    case "+": {
      switch (numberType) {
        case NumberType.UINT:
        case NumberType.INT:
          return "add";
        case NumberType.FLOAT:
          return size === 32 ? "addss" : "addsd";
      }
      break;
    }
    case "-": {
      switch (numberType) {
        case NumberType.UINT:
        case NumberType.INT:
          return "sub";
        case NumberType.FLOAT:
          return size === 32 ? "subss" : "subsd";
      }
      break;
    }
    case "*": {
      switch (numberType) {
        case NumberType.UINT:
          return "mul";
        case NumberType.INT:
          return "imul";
        case NumberType.FLOAT:
          return size === 32 ? "mulss" : "mulsd";
      }
      break;
    }
    case "/": {
      switch (numberType) {
        case NumberType.UINT:
          return "div";
        case NumberType.INT:
          return "idiv";
        case NumberType.FLOAT:
          return size === 32 ? "divss" : "divsd";
      }
      break;
    }
  }
}

function formatOp(firstOperand: string, secondOperand?: string) {
  return `${firstOperand}${
    secondOperand === undefined ? "" : `, ${secondOperand}`
  }`;
}

function memoryOffset(offset: number) {
  return `[r12${offset > 0 ? " + " + offset : ""}]`;
}

type x64Flavour = "x64_OSX" | "x64_win";

const nasmInstructions = (target: x64Flavour, fileName: string) => {
  switch (target) {
    case "x64_OSX":
      return `nasm -fmacho64 ${fileName}.asm && gcc ${fileName}.o`;
    case "x64_win":
      return `nasm -fwin64 ${fileName}.asm && gcc ${fileName}.obj`;
  }
};

function syscallArgumentRegisters(
  target: x64Flavour,
  index: number,
  numberType: NumberType
) {
  const isMac = target === "x64_OSX";
  switch (index) {
    case 0:
      return isMac ? "rdi" : "rcx";
    case 1:
      return numberType === NumberType.FLOAT ? "xmm0" : isMac ? "rsi" : "rdx";
    case 2:
      return numberType === NumberType.FLOAT ? "xmm1" : isMac ? "rdx" : "r8";
    case 3:
      return numberType === NumberType.FLOAT ? "xmm2" : isMac ? "r10" : "r9";
  }
}

export function compileX64(
  target: x64Flavour,
  fileName: string,
  instructions: CompiledInstruction[],
  maxMemory: number
) {
  const isMac = target === "x64_OSX";
  const mainLabel = `${isMac ? "_" : ""}main`;
  const mallocLabel = `${isMac ? "_" : ""}malloc`;
  const printfLabel = `${isMac ? "_" : ""}printf`;
  /* OSX and windows have different conventions for syscalls.
   * OSX requires a 16 byte call stack alignment, with 8 bytes being used for the return
   * value, hence we push the default pointer size (8 bytes) onto the stack before calling.
   * Windows requires us to allocate 32 bytes of "shadow space", which added to our 8 byte alignment
   * gives us 40 bytes (hex value 28h).
   * See https://stackoverflow.com/questions/30190132/what-is-the-shadow-space-in-x64-assembly/30191127#30191127
   */
  const preSysCall: ASMLine = isMac ? [, "push", "rbx"] : [, "sub", "rsp, 28h"];
  const postSysCall: ASMLine = isMac ? [, "pop", "rbx"] : [, "add", "rsp, 28h"];
  const output: ASMBlock[] = [
    [
      -1,
      [
        ["; --------------------------------------------------"],
        ["; Generated with river compiler 1.0"],
        [`; Targeting ${target} with assembler nasm 2.15.05`],
        [`; ${nasmInstructions(target, fileName)}`],
        ["; --------------------------------------------------"],
        [, "global", mainLabel],
        [, "extern", `${mallocLabel}, ${printfLabel}`],
        [],
        [, "section", ".text"],
        [`${mainLabel}:`],
        preSysCall,
        [
          ,
          "mov",
          `${syscallArgumentRegisters(target, 0, NumberType.UINT)}, ${
            maxMemory / 8
          }`,
        ],
        [, "call", `${mallocLabel}`],
        postSysCall,
        [, "mov", "r12, rax"],
      ],
    ],
  ];
  const jumpLabels: number[] = [];
  const jumpLabelsUsed: number[] = [];
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
    if (
      jumpLabels.length > 0 &&
      jumpLabels[jumpLabels.length - 1] === instructionIndex
    ) {
      instructionOutputs[1].push([`j${instructionIndex.toString()}:`]);
      jumpLabelsUsed.push(jumpLabels.pop()!);
    }
    switch (instruction.instruction) {
      case "assign": {
        instructionOutputs[1].push([
          ,
          `; ${instructionIndex}: ${instruction.serialized}`,
        ]);
        const [rightMov, rightSize] = moveAndLabelForSize(
          instruction.right.size,
          instruction.right.numberType
        );
        const [leftMov, leftSize] = moveAndLabelForSize(
          instruction.left.size,
          instruction.left.numberType
        );
        let right = "";
        const leftWithOffset = memoryOffset(instruction.left.value / 8);
        const leftWithSize = `${leftSize} ${leftWithOffset}`;
        if (instruction.right.type === "const") {
          right = instruction.right.value.toString() || "0";
          // 64 bit immediate values need to go through a register first
          if (
            (instruction.right.numberType === NumberType.INT &&
              instruction.right.value > 2147483647) ||
            (instruction.right.numberType === NumberType.UINT &&
              instruction.right.value > 4294967295)
          ) {
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp("r14", instruction.right.value.toString()),
            ]);
            right = "r14";
          } else if (instruction.right.numberType === NumberType.FLOAT) {
            if (instruction.right.size === 64) {
              // TODO move these to data section
              instructionOutputs[1].push([
                ,
                "mov",
                formatOp(
                  "r14",
                  `__?float64?__(${
                    !right.includes(".") ? right + ".0" : right
                  })`
                ),
              ]);
              right = "r14";
            } else {
              right = `__?float32?__(${
                !right.includes(".") ? right + ".0" : right
              })`;
            }
          }
        } else {
          let rightWithSize = `${rightSize} ${memoryOffset(
            instruction.right.value / 8
          )}`;
          right = rightWithSize;
          // Convert between different data types and sizes
          if (instruction.right.numberType === NumberType.FLOAT) {
            if (instruction.left.numberType !== NumberType.FLOAT) {
              instructionOutputs[1].push([
                ,
                `cvtts${instruction.right.size === 64 ? "d" : "s"}2si`,
                formatOp("r14", rightWithSize),
              ]);
              right = "r14";
            } else if (instruction.left.size !== instruction.right.size) {
              instructionOutputs[1].push([
                ,
                `cvt${instruction.left.size === 32 ? "sd2ss" : "ss2sd"}`,
                formatOp("xmm1", rightWithSize),
              ]);
              right = "xmm1";
            }
            // Right is int and left is float
          } else {
            if (instruction.left.numberType === NumberType.FLOAT) {
              if (instruction.right.size < 32) {
                instructionOutputs[1].push([
                  ,
                  rightMov,
                  formatOp("r14", rightWithSize),
                ]);
                rightWithSize = "r14";
              }
              instructionOutputs[1].push([
                ,
                `cvtsi2s${instruction.left.size === 32 ? "s" : "d"}`,
                formatOp("xmm1", rightWithSize),
              ]);
              right = "xmm1";
            }
          }
        }

        let finalMov: string | undefined;
        switch (instruction.action) {
          case "=":
            finalMov = "mov";
            break;
          case "-":
          case "+": {
            if (instruction.left.numberType === NumberType.FLOAT) {
              instructionOutputs[1].push([
                ,
                leftMov,
                formatOp("xmm0", leftWithOffset),
              ]);
              instructionOutputs[1].push([
                ,
                operatorForType(
                  instruction.action,
                  instruction.left.numberType,
                  instruction.left.size
                ),
                formatOp("xmm0", right),
              ]);
              finalMov = leftMov;
              right = "xmm0";
            } else {
              instructionOutputs[1].push([
                ,
                operatorForType(
                  instruction.action,
                  instruction.left.numberType,
                  instruction.left.size
                ),
                formatOp(
                  `${leftSize} ${leftWithOffset}`,
                  instruction.right.type === "var"
                    ? registerWithSize(right, instruction.left.size)
                    : right
                ),
              ]);
            }
            break;
          }
          case "*": {
            const reg =
              instruction.left.numberType === NumberType.FLOAT ? "xmm0" : "r13";
            instructionOutputs[1].push([
              ,
              leftMov,
              formatOp(reg, leftWithOffset),
            ]);
            instructionOutputs[1].push([
              ,
              operatorForType(
                "*",
                instruction.left.numberType,
                instruction.left.size
              ),
              formatOp(reg, right),
            ]);
            finalMov = "mov";
            right = registerWithSize(reg, instruction.left.size);
            break;
          }
          case "%":
          case "/": {
            if (instruction.left.numberType !== NumberType.FLOAT) {
              instructionOutputs[1].push([, "xor", "rdx, rdx"]);
              right !== "r13" &&
                instructionOutputs[1].push([, "mov", formatOp("r13", right)]);
              instructionOutputs[1].push([
                ,
                leftMov,
                formatOp("rax", leftWithSize),
              ]);
              instructionOutputs[1].push([
                ,
                operatorForType(
                  "/",
                  instruction.left.numberType,
                  instruction.left.size
                ),
                "r13",
              ]);
              finalMov = "mov";
              right = registerWithSize(
                instruction.action === "/" ? "rax" : "rdx",
                instruction.left.size
              );
            } else {
              instructionOutputs[1].push([
                ,
                leftMov,
                formatOp("xmm0", leftWithOffset),
              ]);
              right !== "xmm1" &&
                instructionOutputs[1].push([
                  ,
                  rightMov,
                  formatOp("xmm1", right),
                ]);
              instructionOutputs[1].push([
                ,
                operatorForType(
                  "/",
                  instruction.left.numberType,
                  instruction.left.size
                ),
                formatOp("xmm0", "xmm1"),
              ]);
              finalMov = leftMov;
              right = "xmm0";
            }
            break;
          }
          case "||":
          case "&&": {
            instructionOutputs[1].push([
              ,
              instruction.action === "&&" ? "and" : "or",
              formatOp(leftWithOffset, right),
            ]);
            break;
          }
          default:
            break;
        }

        if (finalMov) {
          instructionOutputs[1].push([
            ,
            finalMov,
            formatOp(
              finalMov !== "movss" && finalMov !== "movsd"
                ? leftWithSize
                : leftWithOffset,
              right
            ),
          ]);
        }

        break;
      }
      case "jump": {
        instructionOutputs[1].push([
          ,
          `; ${instructionIndex}: ${instruction.serialized}`,
        ]);
        instructionOutputs[1].push([
          ,
          "jmp",
          `j${
            instruction.type === "start"
              ? instruction.scope.openInstruction.originalInstructionIndex + 1
              : instruction.scope.closeInstruction.originalInstructionIndex + 1
          }`,
        ]);
        break;
      }
      case "compare": {
        instructionOutputs[1].push([
          ,
          `; ${instructionIndex}: ${instruction.serialized}`,
        ]);
        let jump = "";
        switch (instruction.action) {
          case "==":
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
        let leftReg = "r13";
        let rightReg = "r14";
        switch (instruction.left.type) {
          case "const": {
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp("r13", `${instruction.left.value}`),
            ]);
            break;
          }
          case "var": {
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp("r13", memoryOffset(instruction.left.value / 8)),
            ]);
            break;
          }
          default:
            break;
        }
        switch (instruction.right.type) {
          case "const": {
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp("r14", `${instruction.right.value}`),
            ]);
            break;
          }
          case "var": {
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp("r14", memoryOffset(instruction.right.value / 8)),
            ]);
            break;
          }
          default:
            break;
        }
        instructionOutputs[1].push([, "cmp", formatOp(leftReg, rightReg)]);
        instructionOutputs[1].push([, jump, `j${instructionIndex + 2}`]);
        jumpLabels.push(instructionIndex + 2);
        break;
      }
      case "os": {
        instructionOutputs[1].push([
          ,
          `; ${instructionIndex}: ${instruction.serialized}`,
        ]);
        switch (instruction.action) {
          case "stdout": {
            let [mov, size] = moveAndLabelForSize(
              instruction.size,
              instruction.numberType
            );
            // Need to convert to double precision float to use printf
            if (
              instruction.numberType === NumberType.FLOAT &&
              instruction.size === 32
            ) {
              mov = "cvtss2sd";
            }
            instructionOutputs[1].push(preSysCall);
            instructionOutputs[1].push([
              ,
              "lea",
              `${syscallArgumentRegisters(
                target,
                0,
                NumberType.UINT
              )}, [rel format${
                instruction.numberType === NumberType.FLOAT ? "F" : "I"
              }]`,
            ]);
            switch (instruction.type) {
              case "var": {
                instructionOutputs[1].push([
                  ,
                  mov,
                  `${syscallArgumentRegisters(
                    target,
                    1,
                    instruction.numberType
                  )}, ${size} ${memoryOffset(instruction.value / 8)}`,
                ]);
                break;
              }
              case "const": {
                instructionOutputs[1].push([
                  ,
                  mov,
                  `${syscallArgumentRegisters(
                    target,
                    1,
                    instruction.numberType
                  )}, ${instruction.value}`,
                ]);
              }
            }
            instructionOutputs[1].push([, "call", printfLabel]);
            instructionOutputs[1].push(postSysCall);
            break;
          }
          default:
            break;
        }
        break;
      }
      case "scope": {
        if (!jumpLabelsUsed.includes(instructionIndex)) {
          instructionOutputs[1].push([`j${instructionIndex.toString()}:`]);
        }
        break;
      }
      default:
        break;
    }
    if (instructionOutputs[1].length > 0) {
      output.push(instructionOutputs);
    }
  }

  output.push([
    -1,
    [
      [, "ret"],
      [],
      [, "section", ".data"],
      ["formatI:", "db", `"%d", 10, 0`],
      ["formatF:", "db", `"%f", 10, 0`],
    ],
  ]);
  return output;
}
