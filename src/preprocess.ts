import {
  Instruction,
  Fragment,
  Macro,
  CollapsedInstruction,
  getStackPositionAtInstructionIndex,
  MacroInstruction,
  CollapsedData,
} from "./editor_handler";

type PlaceholderFragment = { name: string; fragment: Fragment };

type CollapsedMacro = Macro & {
  placeholderFragments: PlaceholderFragment[];
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
    // This allows us to modify return values or internal names in macros to prevent collisions
    if (
      fragment?.type === "defName" &&
      macroFragment?.type === "defName" &&
      fragment.value !== macroFragment.value
    ) {
      continue;
    }

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
  placeholderFragments: PlaceholderFragment[];
  endLineNumber: number;
};

function macroRanges(
  instructions: Instruction[],
  instructionIndex: number,
  macro: Macro
): MacroRanges | undefined {
  let newInstructionIndex = instructionIndex;
  let placeholderFragments: PlaceholderFragment[] = [];
  let ranges: [number, number][] = [
    [newInstructionIndex, newInstructionIndex + macro.instructions.length],
  ];
  let blockRanges: [number, number][] = [];
  let stackPositionOffset = getStackPositionAtInstructionIndex(
    instructionIndex,
    instructions
  );
  if (macro.instructions.length > instructions.length - newInstructionIndex) {
    return;
  }
  for (
    let i = 0;
    i < macro.instructions.length && newInstructionIndex < instructions.length;
    i++, newInstructionIndex++
  ) {
    const macroInstruction = macro.instructions[i];
    // Process a placeholder _block inside a macro
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
        (macroFragment.type === "varType" ||
          macroFragment.type === "assignAction" ||
          macroFragment.type === "comparator")
      ) {
        placeholderFragments.push({
          name: macroFragment.name,
          fragment: instructions[newInstructionIndex].fragments[j]!,
        });
      }
    }
  }
  return {
    ranges,
    placeholderFragments,
    blockRanges,
    endLineNumber: newInstructionIndex,
  };
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
  const blocks: [number, number][] = [];
  let unplacedInlineMacros: {
    lineNumber: number;
    instruction: MacroInstruction & CollapsedData;
    stackPosition: number;
  }[] = [];
  const collapsed: CollapsedInstruction[] = [];
  const macrosByLength = macros
    .slice()
    .sort((a, b) => b.instructions.length - a.instructions.length);
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    const macroRanges = macroAtLine(
      instructions,
      i,
      macrosByLength,
      sourceMacro
    );
    if (
      collapse.length > 0 &&
      collapse.find(
        (c) => c.find((range) => range[0] <= i && range[1] > i) && !expandMacros
      )
    ) {
      if (blocks.find((b) => b[0] === i)) {
        collapsed.push({
          type: "blockInstruction",
          fragments: [{ type: "block", value: "open" }],
          inlineMacros: [],
          lineNumber: i,
        });
      }
      if (blocks.find((b) => b[1] === i)) {
        collapsed.push({
          type: "blockInstruction",
          fragments: [{ type: "block", value: "close" }],
          inlineMacros: [],
          lineNumber: i,
        });
      }
    } else {
      if (macroRanges && !expandMacros) {
        collapse.push(macroRanges[1].ranges);
        blocks.push(...macroRanges[1].blockRanges);
        const macroInstruction: CollapsedInstruction = {
          type: "macroInstruction",
          fragments: [
            { type: "macroName", value: macroRanges[0].name },
            ...macroRanges[1].placeholderFragments.map((p) => p.fragment),
          ],
          placeholders: macroRanges[1].placeholderFragments.map((p) => p.name),
          macro: macroRanges[0],
          blockRanges: macroRanges[1].blockRanges,
          lineNumber: i,
          endLineNumber: macroRanges[1].endLineNumber,
          macroType: macroRanges[0].inline ? "inline" : "function",
          inlineMacros: [],
        };
        for (let i = 0; i < unplacedInlineMacros.length; i++) {
          const macro = unplacedInlineMacros[i];
          let cursorPos = 0;
          for (const fragment of macroInstruction.fragments) {
            if (
              fragment?.type === "varType" &&
              fragment.value === "var" &&
              fragment.stackPosition === macro.stackPosition
            ) {
              macroInstruction.inlineMacros[cursorPos] = macro;
              unplacedInlineMacros.splice(i, 1);
              if (i > -1) {
                i--;
              }
            }
            cursorPos++;
          }
        }
        if (macroRanges[0].inline) {
          unplacedInlineMacros.push({
            lineNumber: i,
            instruction: macroInstruction,
            stackPosition: getStackPositionAtInstructionIndex(i, instructions),
          });
        } else {
          const toReturn: CollapsedInstruction[] = [macroInstruction];
          if (macroRanges[1].blockRanges.length > 0) {
            toReturn.push({
              type: "blockInstruction",
              fragments: [{ type: "block", value: "open" }],
              inlineMacros: [],
              lineNumber: macroRanges[1].blockRanges[0][0] - 1,
            });
          }
          collapsed.push(...toReturn);
        }
      } else if (unplacedInlineMacros.length > 0) {
        const toReturn: CollapsedInstruction = {
          ...instruction,
          lineNumber: i,
          inlineMacros: [],
        };
        for (let i = 0; i < unplacedInlineMacros.length; i++) {
          const macro = unplacedInlineMacros[i];
          let cursorPos = 0;
          for (const fragment of toReturn.fragments) {
            if (
              fragment?.type === "varType" &&
              fragment.value === "var" &&
              fragment.stackPosition === macro.stackPosition
            ) {
              toReturn.inlineMacros[cursorPos] = macro;
              unplacedInlineMacros.splice(i, 1);
              if (i > -1) {
                i--;
              }
            }
            cursorPos++;
          }
        }
        for (const macro of unplacedInlineMacros) {
          collapsed.splice(
            macro.lineNumber,
            0,
            ...instructions
              .slice(
                macro.instruction.lineNumber,
                macro.instruction.endLineNumber
              )
              .map((ins, index) => ({
                ...ins,
                lineNumber: macro.instruction.lineNumber + index,
                inlineMacros: [],
              }))
          );
        }
        unplacedInlineMacros = [];
        collapsed.push(toReturn);
      } else {
        collapsed.push({
          ...instruction,
          lineNumber: i,
          inlineMacros: [],
        });
      }
    }
  }
  return collapsed;
}
