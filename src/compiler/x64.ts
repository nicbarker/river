/* eslint-disable no-sparse-arrays */
import { CompiledInstruction } from "../parse";
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
  }
  return output;
}

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
    // default:
    //   throw Error(`Bad size ${instructionSize} passed to moveAndLabelForSize`);
  }
  return [mov, size];
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

function syscallArgumentRegisters(target: x64Flavour, index: number) {
  const isMac = target === "x64_OSX";
  switch (index) {
    case 0:
      return isMac ? "rdi" : "rcx";
    case 1:
      return isMac ? "rsi" : "rdx";
    case 2:
      return isMac ? "rdx" : "r8";
    case 3:
      return isMac ? "r10" : "r9";
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
        [, "mov", `${syscallArgumentRegisters(target, 0)}, ${maxMemory / 8}`],
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
        const [sourceMov, sourceSize] = moveAndLabelForSize(
          instruction.sourceSize
        );
        const [targetMov, targetSize] = moveAndLabelForSize(
          instruction.targetSize
        );
        let source = "";
        let target = "";
        let targetWithOffset: number | string = "";
        const targetAddress = instruction.target / 8;
        target = `${targetSize} [r12${
          targetAddress > 0 ? " + " + targetAddress : ""
        }]`;
        targetWithOffset = memoryOffset(instruction.target / 8);
        let operands: string[] = [];
        switch (instruction.source) {
          case "const": {
            source = instruction.value?.toString() || "0";
            switch (instruction.action) {
              case "=":
              case "+":
              case "-":
              case "&&":
              case "||": {
                operands = [target, source];
                break;
              }
              case "*": {
                instructionOutputs[1].push([
                  ,
                  sourceMov,
                  formatOp("r13", targetWithOffset),
                ]);
                operands = ["r13", source];
                break;
              }
              case "/":
              case "%": {
                instructionOutputs[1].push([, "xor", "rdx, rdx"]);
                instructionOutputs[1].push([
                  ,
                  sourceMov,
                  formatOp("r13", source),
                ]);
                instructionOutputs[1].push([
                  ,
                  targetMov,
                  formatOp("rax", targetWithOffset),
                ]);
                operands = ["r13"];
                break;
              }
              default:
                break;
            }
            break;
          }
          case "var": {
            switch (instruction.action) {
              case "=": {
                instructionOutputs[1].push([
                  ,
                  sourceMov,
                  formatOp(
                    "r13",
                    `${sourceSize} ${memoryOffset(instruction.address! / 8)}`
                  ),
                ]);
                operands = [
                  targetWithOffset,
                  registerWithSize("r13", instruction.targetSize),
                ];
                break;
              }
              default: {
                instructionOutputs[1].push([
                  ,
                  targetMov,
                  formatOp("r13", targetWithOffset),
                ]);
                operands = [
                  registerWithSize("r13", instruction.sourceSize),
                  `${sourceSize} ${memoryOffset(instruction.address! / 8)}`,
                ];
              }
            }
            break;
          }
          default:
            break;
        }
        switch (instruction.action) {
          case "=": {
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp(operands[0], operands[1]),
            ]);
            break;
          }
          case "+": {
            instructionOutputs[1].push([
              ,
              "add",
              formatOp(operands[0], operands[1]),
            ]);
            if (instruction.source === "var") {
              instructionOutputs[1].push([
                ,
                "mov",
                formatOp(
                  targetWithOffset,
                  registerWithSize("r13", instruction.targetSize)
                ),
              ]);
            }
            break;
          }
          case "-": {
            instructionOutputs[1].push([
              ,
              "sub",
              formatOp(operands[0], operands[1]),
            ]);
            if (instruction.source === "var") {
              instructionOutputs[1].push([
                ,
                "mov",
                formatOp(
                  targetWithOffset,
                  registerWithSize("r13", instruction.targetSize)
                ),
              ]);
            }
            break;
          }
          case "*": {
            instructionOutputs[1].push([
              ,
              "imul",
              formatOp(operands[0], operands[1]),
            ]);
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp(
                targetWithOffset,
                registerWithSize("r13", instruction.targetSize)
              ),
            ]);
            break;
          }
          case "/": {
            instructionOutputs[1].push([, "idiv", operands[0]]);
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp(
                targetWithOffset,
                registerWithSize("rax", instruction.targetSize)
              ),
            ]);
            break;
          }
          case "%": {
            instructionOutputs[1].push([, "idiv", operands[0]]);
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp(
                targetWithOffset,
                registerWithSize("rdx", instruction.targetSize)
              ),
            ]);
            break;
          }
          case "&&": {
            instructionOutputs[1].push([
              ,
              "and",
              formatOp(operands[0], operands[1]),
            ]);
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp(
                targetWithOffset,
                registerWithSize("r13", instruction.targetSize)
              ),
            ]);
            break;
          }
          case "||": {
            instructionOutputs[1].push([
              ,
              "or",
              formatOp(operands[0], operands[1]),
            ]);
            instructionOutputs[1].push([
              ,
              "mov",
              formatOp(
                targetWithOffset,
                registerWithSize("r13", instruction.targetSize)
              ),
            ]);
            break;
          }
          default:
            break;
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
        switch (instruction.left.source) {
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
              formatOp("r13", memoryOffset(instruction.left.address! / 8)),
            ]);
            break;
          }
          default:
            break;
        }
        switch (instruction.right.source) {
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
              formatOp("r14", memoryOffset(instruction.right.address! / 8)),
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
            const [mov, size] = moveAndLabelForSize(instruction.size);
            instructionOutputs[1].push(preSysCall);
            instructionOutputs[1].push([
              ,
              "lea",
              `${syscallArgumentRegisters(target, 0)}, [rel message]`,
            ]);
            switch (instruction.source) {
              case "var": {
                instructionOutputs[1].push([
                  ,
                  mov,
                  `${syscallArgumentRegisters(
                    target,
                    1
                  )}, ${size} ${memoryOffset(instruction.address! / 8)}`,
                ]);
                break;
              }
              case "const": {
                instructionOutputs[1].push([
                  ,
                  mov,
                  `${syscallArgumentRegisters(target, 1)}, ${
                    instruction.value
                  }`,
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
    [[, "ret"], [], [, "section", ".data"], ["message:", "db", `"%d", 0x0a`]],
  ]);
  return output;
}
