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
  for (
    let j = 0;
    j < instructionOne.fragments.length || j < instructionTwo.fragments.length;
    j++
  ) {
    const fragment = instructionOne.fragments[j];
    const fragmentTwo = instructionTwo.fragments[j];
    if (
      fragment?.value !== "_" &&
      fragmentTwo?.value !== "_" &&
      fragment?.value !== fragmentTwo?.value
    ) {
      return false;
    }

    // If the fragment is a var type and the const value or variable stack position don't match, e.g.
    // assign var 0 + var 1
    // compared to
    // assign var 1 + var 2
    if (
      fragment?.type === "varType" &&
      fragmentTwo?.type === "varType" &&
      ((fragment.value === "var" &&
        fragmentTwo?.value === "var" &&
        fragment.stackPosition !== fragmentTwo.stackPosition) ||
        (fragment.value === "const" &&
          fragmentTwo?.value === "const" &&
          fragment.constValue !== fragmentTwo.constValue))
    ) {
      return false;
    }

    if (!fragment || !instructionTwo.fragments[j]) {
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
    console.log(macroInstruction.type);
    if (macroInstruction.type === "placeholderInstruction") {
      console.log("outside");
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
          console.log(
            nextInstruction,
            "and",
            instructions[newInstructionIndex],
            "are equal"
          );
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
      console.log(
        "not equal",
        macroInstruction,
        instructions[newInstructionIndex]
      );
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
