import { Instruction } from "./editor_handler";

export function validate(instructions: Instruction[]): boolean {
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    for (let j = 0; j < instruction.fragments.length; j++) {
      const fragment = instruction.fragments[j];
      if (!fragment || fragment.value === "_") {
        return false;
      } else if (fragment.type === "varType") {
        if (
          fragment.value === "var" &&
          typeof fragment.stackPosition === "undefined"
        ) {
          return false;
        }
        if (
          fragment.value === "const" &&
          typeof fragment.constValue === "undefined"
        ) {
          return false;
        }
      }
    }
  }
  return true;
}
