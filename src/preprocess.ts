import {
  Instruction,
  Fragment,
  Macro,
  CollapsedInstruction,
  getStackPositionAtInstructionIndex,
} from "./editor_handler";

type CollapsedMacro = Macro & {
  placeholderFragments: Fragment[];
};

function instructionsAreEqual(
  macroInstruction?: Instruction,
  programInstruction?: Instruction,
  stackPositionOffset: number = 0
) {
  if (!macroInstruction || !programInstruction) {
    return false;
  }
  if (macroInstruction.type !== programInstruction.type) {
    return false;
  }
  if (
    macroInstruction.fragments.length !== programInstruction.fragments.length
  ) {
    return false;
  }
  for (
    let j = 0;
    j < macroInstruction.fragments.length ||
    j < programInstruction.fragments.length;
    j++
  ) {
    const fragment = programInstruction.fragments[j];
    const macroFragment = macroInstruction.fragments[j];
    if (
      fragment?.value !== "_" &&
      macroFragment?.value !== "_" &&
      fragment?.value !== macroFragment?.value
    ) {
      return false;
    }

    // If the fragment is a var type and the const value or variable stack position don't match, e.g.
    // assign var 0 + var 1
    // compared to
    // assign var 1 + var 2
    if (
      fragment?.type === "varType" &&
      macroFragment?.type === "varType" &&
      ((fragment.value === "var" &&
        macroFragment.value === "var" &&
        fragment.stackPosition !==
          (typeof macroFragment.stackPosition === "undefined"
            ? undefined
            : macroFragment.stackPosition + stackPositionOffset)) ||
        (fragment.value === "const" &&
          macroFragment.value === "const" &&
          fragment.constValue !== macroFragment.constValue))
    ) {
      return false;
    }

    if (!fragment || !programInstruction.fragments[j]) {
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
  let stackPositionOffset = getStackPositionAtInstructionIndex(
    instructionIndex,
    instructions
  );
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
            instructions[newInstructionIndex],
            stackPositionOffset
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
      !instructionsAreEqual(
        macroInstruction,
        instructions[newInstructionIndex],
        stackPositionOffset
      )
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
