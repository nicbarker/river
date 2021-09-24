function moveAndLabelForSize(instructionSize) {
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

export function compile(scopesFinal, instructions, maxMemory) {
  let output = `
; --------------------------------------------------
; Generated with River Compiler 1.0
; Targetting assembler nasm 2.3;
; --------------------------------------------------
          global    _main
          extern    _malloc, _printf

          section   .text
_main:    push      rbx
          lea       rdi, ${maxMemory / 8}
          call      _malloc
          pop       rbx
          mov       r12, rax`;
  for (
    let instructionIndex = 0;
    instructionIndex < instructions.length;
    instructionIndex++
  ) {
    const instruction = instructions[instructionIndex];
    switch (instruction.instruction) {
      case "assign": {
        output += `
          ; ${instructionIndex}: ${instruction.serialized}`;
        const [mov, size] = moveAndLabelForSize(instruction.size);
        let source = "";
        const target = instruction.target / 8;
        let operands = "";
        switch (instruction.source) {
          case "const": {
            source = parseInt(instruction.value, 2);
            switch (instruction.action) {
              case "=":
              case "+":
              case "-": {
                operands = `${size} [r12${
                  target > 0 ? " + " + target : ""
                }], ${source}`;
                break;
              }
              case "*": {
                output += `
          ${mov}       r13, [r12 + ${target}]`;
                operands = `r13, ${source}`;
                break;
              }
              case "/":
              case "%": {
                output += `
          xor       rdx, rdx
          mov       r13, ${source}
          ${mov}       rax, [r12 + ${target}]`;
                operands = "r13";
                break;
              }
              default:
                break;
            }
            break;
          }
          case "var": {
            source = `r13`;
            output += `
          ${mov}       r13, [r12 + ${instruction.address / 8}]`;
            operands = `[r12${target > 0 ? " + " + target : ""}], ${source}`;
            break;
          }
          default:
            break;
        }
        switch (instruction.action) {
          case "=": {
            output += `
          mov       ${operands}`;
            break;
          }
          case "+": {
            output += `
          add       ${operands}`;
            break;
          }
          case "-": {
            output += `
          sub       ${operands}`;
            break;
          }
          case "*": {
            output += `
          imul      ${operands}
          mov       [r12 + ${target}], r13`;
            break;
          }
          case "/": {
            output += `
          idiv      ${operands}
          mov       [r12 + ${target}], rax`;
            break;
          }
          case "%": {
            output += `
          idiv      ${operands}
          mov       [r12 + ${target}], rdx`;
            break;
          }
          default:
            break;
        }
        break;
      }
      case "os": {
        switch (instruction.action) {
          case "stdout": {
            const [mov, size] = moveAndLabelForSize(instruction.size);
            output += `
          ; ${instructionIndex}: ${instruction.serialized}
          push      rbx
          lea       rdi, [rel message]
          ${mov}       rsi, ${size} [r12 + ${instruction.address / 8}]
          call      _printf
          pop       rbx`;
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

  output += `
          ret

          section   .data
message:  db        "%d", 0x0a
`;

  return output;
}
