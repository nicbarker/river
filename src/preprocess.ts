import {
  Instruction,
  Fragment,
  Macro,
  CollapsedInstruction,
} from "./editor_handler";

type CollapsedMacro = Macro & {
  placeholderFragments: Fragment[];
};

function instructionsAreEqual(
  instructionOne?: Instruction,
  instructionTwo?: Instruction
) {
  if (!instructionOne || !instructionTwo) {
    return false;
  }
  if (instructionOne.type !== instructionTwo.type) {
    return false;
  }
  if (instructionOne.fragments.length !== instructionTwo.fragments.length) {
    return false;
  }
  for (let j = 0; j < instructionOne.fragments.length; j++) {
    const fragment = instructionOne.fragments[j];
    if (
      fragment?.value !== "_" &&
      instructionTwo.fragments[j]?.value !== "_" &&
      fragment?.value !== instructionTwo.fragments[j]?.value
    ) {
      return false;
    }
  }
  return true;
}

type MacroRanges = {
  ranges: [number, number][];
  blockRanges: [number, number][];
  placeholderFragments: Fragment[];
};

function macroRanges(
  instructions: Instruction[],
  instructionIndex: number,
  macro: Macro
): MacroRanges | undefined {
  let newInstructionIndex = instructionIndex;
  let placeholderFragments: Fragment[] = [];
  let ranges: [number, number][] = [[0, macro.instructions.length + 1]];
  let blockRanges: [number, number][] = [];
  for (
    let i = 0;
    i < macro.instructions.length && newInstructionIndex < instructions.length;
    i++, newInstructionIndex++
  ) {
    const macroInstruction = macro.instructions[i];
    if (macroInstruction.type === "placeholderInstruction") {
      ranges[ranges.length - 1][1] = newInstructionIndex;
      blockRanges.push([newInstructionIndex, newInstructionIndex + 1]);
      const nextInstruction = macro.instructions[i + 1];
      while (newInstructionIndex < instructions.length) {
        newInstructionIndex++;
        if (
          instructionsAreEqual(
            nextInstruction,
            instructions[newInstructionIndex]
          )
        ) {
          newInstructionIndex--;
          break;
        }
      }
      blockRanges[ranges.length - 1][1] = newInstructionIndex + 1;
      ranges.push([
        newInstructionIndex + 1,
        newInstructionIndex + macro.instructions.length - i,
      ]);
    } else if (
      !instructionsAreEqual(macroInstruction, instructions[newInstructionIndex])
    ) {
      return;
    }
    for (let j = 0; j < macroInstruction.fragments.length; j++) {
      const macroFragment = macroInstruction.fragments[j];
      if (
        macroFragment?.value === "_" &&
        macroFragment.type !== "instruction"
      ) {
        placeholderFragments.push(
          instructions[newInstructionIndex].fragments[j]!
        );
      }
    }
  }
  return { ranges, placeholderFragments, blockRanges };
}

function macroAtLine(
  instructions: Instruction[],
  instructionIndex: number,
  macros: Macro[],
  sourceMacro?: Macro
): [CollapsedMacro, MacroRanges] | undefined {
  const instruction = instructions[instructionIndex];
  if (
    instruction.type === "scopeInstruction" &&
    instruction.fragments[1]?.value === "open"
  ) {
    for (const macro of macros) {
      if (macro === sourceMacro) {
        continue;
      }
      const ranges = macroRanges(instructions, instructionIndex, macro);
      if (ranges) {
        const collapsedMacro: CollapsedMacro = {
          ...macro,
          placeholderFragments: [],
        };
        return [collapsedMacro, ranges];
      }
    }
  }
}

export function preProcess(
  instructions: Instruction[],
  macros: Macro[],
  sourceMacro?: Macro,
  expandMacros?: boolean
): CollapsedInstruction[] {
  const collapse: [number, number][][] = [];
  return instructions
    .map((instruction, index): CollapsedInstruction | undefined => {
      const macroRanges = macroAtLine(instructions, index, macros, sourceMacro);
      if (macroRanges && !expandMacros) {
        collapse.push(macroRanges[1].ranges);
        return {
          type: "macroInstruction",
          fragments: [
            { type: "macroName", value: macroRanges[0].name },
            ...macroRanges[1].placeholderFragments,
          ],
          macro: macroRanges[0],
          blockRanges: macroRanges[1].blockRanges,
          lineNumber: index,
        };
      } else if (
        collapse.length > 0 &&
        collapse[collapse.length - 1].find(
          (range) => range[0] <= index && range[1] > index
        ) &&
        !expandMacros
      ) {
        return undefined;
      } else {
        return { ...instruction, lineNumber: index };
      }
    })
    .filter((i) => !!i) as CollapsedInstruction[];
}
