import { VisibleVariable } from "./editor";
import { baseTypes, NumberType } from "./types/river_types";

// TOP LEVEL INSTRUCTIONS ----------------------------
export type InstructionAssign = {
  type: "instruction";
  value: "assign";
};
export type InstructionDef = {
  type: "instruction";
  value: "def";
};
export type InstructionScope = {
  type: "instruction";
  value: "scope";
};
export type InstructionJump = {
  type: "instruction";
  value: "jump";
};
export type InstructionCompare = {
  type: "instruction";
  value: "compare";
};
export type InstructionOS = {
  type: "instruction";
  value: "os";
};
export type InstructionPlaceholder = {
  type: "instruction";
  value: "_";
  name: string;
};

export type InstructionFragment =
  | InstructionAssign
  | InstructionDef
  | InstructionScope
  | InstructionJump
  | InstructionCompare
  | InstructionOS
  | InstructionPlaceholder;

// SCOPE ---------------------------------
export type ScopeOpen = {
  type: "scopeAction";
  value: "open";
};

export type ScopeClose = {
  type: "scopeAction";
  value: "close";
};

export type ScopeFragment = ScopeOpen | ScopeClose;

// DEF ---------------------------------
export type DefNameFragment = {
  type: "defName";
  value: string;
};

export type DefTypeFragment = {
  type: "defType";
  value?: string;
  size?: number;
};

// ASSIGN ----------------------------------
export type AssignEq = {
  type: "assignAction";
  value: "=";
};
export type AssignAdd = {
  type: "assignAction";
  value: "+";
};
export type AssignSubtract = {
  type: "assignAction";
  value: "-";
};
export type AssignDivide = {
  type: "assignAction";
  value: "/";
};
export type AssignMultiply = {
  type: "assignAction";
  value: "*";
};
export type AssignMod = {
  type: "assignAction";
  value: "%";
};
export type AssignAnd = {
  type: "assignAction";
  value: "&&";
};
export type AssignOr = {
  type: "assignAction";
  value: "||";
};
export type AssignPlaceholder = {
  type: "assignAction";
  value: "_";
  name: string;
};
export type AssignMissing = {
  type: "assignAction";
  value: "missing";
  name: string;
};

export type AssignActionFragment =
  | AssignEq
  | AssignAdd
  | AssignSubtract
  | AssignDivide
  | AssignMultiply
  | AssignMod
  | AssignAnd
  | AssignOr
  | AssignPlaceholder
  | AssignMissing;

// VAR TYPES ----------------------------------
export type VarTypeVar = {
  type: "varType";
  value: "var";
  offset?: number;
  size?: number;
  numberType?: NumberType;
  varName?: string; // The editor annotates variable references, which usually only have a stack position, with their name
};
export type VarTypeConst = {
  type: "varType";
  value: "const";
  constValue?: number;
  numberType?: NumberType;
};
export type VarTypePlaceholder = {
  type: "varType";
  value: "_";
  name: string;
};
export type VarTypeMissing = {
  type: "varType";
  value: "missing";
  name: string;
};

export type VarTypeFragment =
  | VarTypeVar
  | VarTypeConst
  | VarTypePlaceholder
  | VarTypeMissing;

// COMPARATOR ----------------------------------
export type ComparatorEq = {
  type: "comparator";
  value: "==";
};
export type ComparatorNeq = {
  type: "comparator";
  value: "!=";
};
export type ComparatorLt = {
  type: "comparator";
  value: "<";
};
export type ComparatorLte = {
  type: "comparator";
  value: "<=";
};
export type ComparatorGt = {
  type: "comparator";
  value: ">";
};
export type ComparatorGte = {
  type: "comparator";
  value: ">=";
};
export type ComparatorPlaceholder = {
  type: "comparator";
  value: "_";
  name: string;
};
export type ComparatorMissing = {
  type: "comparator";
  value: "missing";
  name: string;
};
export type ComparatorFragment =
  | ComparatorEq
  | ComparatorNeq
  | ComparatorLt
  | ComparatorLte
  | ComparatorGt
  | ComparatorGte
  | ComparatorPlaceholder
  | ComparatorMissing;

export type JumpPositionStart = {
  type: "jumpPosition";
  value: "start";
};

export type JumpPositionEnd = {
  type: "jumpPosition";
  value: "end";
};

export type JumpPositionFragment = JumpPositionStart | JumpPositionEnd;

export type OSActionFragment = {
  type: "OSAction";
  value: "stdout";
};

export type MacroNameFragment = {
  type: "macroName";
  value: string;
};

export type Fragment =
  | InstructionFragment
  | ScopeFragment
  | DefNameFragment
  | DefTypeFragment
  | AssignActionFragment
  | VarTypeFragment
  | ComparatorFragment
  | JumpPositionFragment
  | OSActionFragment
  | MacroNameFragment;

// scope open
export type ScopeInstruction = {
  type: "scopeInstruction";
  fragments: Partial<[InstructionScope, ScopeFragment]>;
};

// def foo 16
export type DefInstruction = {
  type: "defInstruction";
  fragments: Partial<[InstructionDef, DefNameFragment, DefTypeFragment]>;
};

// assign 0 eq var 1
export type AssignInstruction = {
  type: "assignInstruction";
  fragments: Partial<
    [
      InstructionAssign,
      VarTypeVar | VarTypePlaceholder,
      AssignActionFragment,
      VarTypeFragment
    ]
  >;
};

// compare lt var 1 const 1000
export type CompareInstruction = {
  type: "compareInstruction";
  fragments: Partial<
    [InstructionCompare, VarTypeFragment, ComparatorFragment, VarTypeFragment]
  >;
};

export type JumpInstruction = {
  type: "jumpInstruction";
  fragments: Partial<[InstructionJump, JumpPositionFragment]>;
};

export type OSInstruction = {
  type: "OSInstruction";
  fragments: Partial<[InstructionOS, OSActionFragment, VarTypeFragment]>;
};

export type EmptyInstruction = {
  type: "emptyInstruction";
  fragments: [undefined];
};

export type PlaceholderInstruction = {
  type: "placeholderInstruction";
  fragments: [InstructionPlaceholder];
};

export type Instruction =
  | EmptyInstruction
  | DefInstruction
  | AssignInstruction
  | ScopeInstruction
  | CompareInstruction
  | JumpInstruction
  | OSInstruction
  | PlaceholderInstruction;

export type MacroInstruction = {
  type: "macroInstruction";
  fragments: Fragment[];
  macro: Macro;
  placeholders: string[];
  blockRanges: [number, number][];
  endLineNumber: number;
  macroType: "function" | "inline";
};

export type BlockOpen = {
  type: "block";
  value: "open";
};

export type BlockClose = {
  type: "block";
  value: "close";
};

export type BlockFragment = BlockOpen | BlockClose;

export type BlockInstruction = {
  type: "blockInstruction";
  fragments: [BlockFragment];
};

export type CollapsedData = {
  lineNumber: number;
  inlineMacros: {
    instruction: MacroInstruction & CollapsedData;
    stackOffset: number;
  }[];
};

export type CollapsedInstruction = (
  | Instruction
  | MacroInstruction
  | BlockInstruction
) &
  CollapsedData;

export type Macro = {
  name: string;
  instructions: Instruction[];
  inline: boolean;
};

export function getFragmentLength(instruction: CollapsedInstruction): number {
  switch (instruction.type) {
    case "emptyInstruction":
      return 0;
    case "defInstruction":
      return 3;
    case "assignInstruction":
      return 4;
    case "scopeInstruction":
      return 2;
    case "compareInstruction":
      return 4;
    case "jumpInstruction":
      return 2;
    case "OSInstruction":
      return 3;
    case "placeholderInstruction":
      return 1;
    case "macroInstruction":
      return instruction.placeholders.length + 1;
    default:
      return -1;
  }
}

export function getFragmentHints(instruction: CollapsedInstruction) {
  switch (instruction.type) {
    case "emptyInstruction":
      return ["scope | def | assign | compare | jump | os | macro"];
    case "placeholderInstruction":
      return [];
    case "defInstruction":
      return ["def", "name", baseTypes.map((b) => b.name).join(" | ")];
    case "assignInstruction":
      return [
        "assign",
        "var",
        "= | + | - | * | / | % | && | ||",
        "var | const | macro",
      ];
    case "scopeInstruction":
      return ["scope", "open | close"];
    case "compareInstruction":
      return [
        "compare",
        "var | const | macro",
        "= | != | < | <= | > | >=",
        "var | const | macro",
      ];
    case "jumpInstruction":
      return ["jump", "start | end"];
    case "OSInstruction":
      return ["os", "stdout", "var | const | macro"];
    case "macroInstruction":
      return instruction.placeholders;
    case "blockInstruction":
      return "{";
  }
}

export function getStackOffsetAtInstructionIndex(
  index: number,
  instructions: Instruction[]
) {
  const scopedOffsets: number[] = [0];
  for (let i = 0; i < index; i++) {
    const instruction = instructions[i];
    if (instruction.type === "scopeInstruction") {
      if (instruction.fragments[1]?.value === "open") {
        scopedOffsets.push(scopedOffsets[scopedOffsets.length - 1]);
      } else if (instruction.fragments[1]?.value === "close") {
        scopedOffsets.pop();
      }
      // TODO: validate this in a less ugly way
    } else if (
      instruction.type === "defInstruction" &&
      instruction.fragments[1] &&
      instruction.fragments[2]?.size
    ) {
      scopedOffsets[scopedOffsets.length - 1] += instruction.fragments[2].size;
    }
  }
  return scopedOffsets[scopedOffsets.length - 1];
}

export function modifyStackOffsetsAfter(
  amount: number,
  index: number,
  instructions: Instruction[]
) {
  const stackOffset = getStackOffsetAtInstructionIndex(index, instructions);
  for (let i = index; i < instructions.length; i++) {
    for (let j = 0; j < instructions[i].fragments.length; j++) {
      const fragment = instructions[i].fragments[j];
      if (
        fragment?.type === "varType" &&
        fragment.value === "var" &&
        typeof fragment.offset !== "undefined" &&
        fragment.offset >= stackOffset
      ) {
        fragment.offset += amount;
      }
    }
  }
}

function deleteInstruction(
  instructionIndex: number,
  instructions: Instruction[],
  matchScopes: boolean = true
) {
  let extraDeleted = 0;
  const instruction = instructions[instructionIndex];
  instructions.splice(instructionIndex, 1);
  if (instruction.type === "scopeInstruction" && matchScopes) {
    let numOpen = 0;
    for (let i = instructionIndex; i < instructions.length; i++) {
      const instruction = instructions[i];
      if (instruction.type === "scopeInstruction") {
        if (instruction.fragments[1]?.value === "close") {
          if (numOpen === 0) {
            instructions.splice(i, 1);
            extraDeleted++;
            break;
          } else {
            numOpen--;
          }
        } else {
          numOpen++;
        }
      }
    }
  } else if (instruction.type === "defInstruction") {
    // Find references to this variable, and replace them with placeholders
    const stackOffset = getStackOffsetAtInstructionIndex(
      instructionIndex,
      instructions
    );
    for (let i = instructionIndex; i < instructions.length; i++) {
      for (let j = 0; j < instructions[i].fragments.length; j++) {
        const fragment = instructions[i].fragments[j];
        if (
          fragment?.type === "varType" &&
          fragment.value === "var" &&
          fragment.offset === stackOffset
        ) {
          instructions[i].fragments[j] = {
            type: "varType",
            value: "_",
            name: instruction.fragments[1]?.value || "",
          };
        }
      }
    }
    // Decrement the stack position of all variable references after the one we're deleting
    modifyStackOffsetsAfter(-1, instructionIndex, instructions);
  }
  return extraDeleted;
}

export enum CursorMovement {
  INCREMENT,
  DECREMENT,
  START,
  END,
  PRESERVE,
}

export function handleKeyStroke({
  instruction,
  instructions,
  collapsedInstructions,
  cursorPositions,
  instructionIndex,
  selectionRange,
  isMacro,
  macros,
  macroSearchString,
  variableSearchString,
  typeSearchString,
  visibleVariables,
  key,
  shiftKey,
  onCursorUnderflow,
  setInstructions,
  setInstructionIndex,
  setCursorPositions,
  setSelectionRange,
  setMacros,
  setMacroSearchString,
  setVariableSearchString,
  setTypeSearchString,
  setActiveRightTab,
  setFocusIndex,
}: {
  instruction: CollapsedInstruction;
  instructions: Instruction[];
  collapsedInstructions: CollapsedInstruction[];
  cursorPositions: number[];
  instructionIndex: number;
  selectionRange: [number, number];
  isMacro: boolean;
  macros: Macro[];
  macroSearchString?: string;
  variableSearchString?: string;
  typeSearchString?: string;
  visibleVariables: VisibleVariable[];
  key: string;
  shiftKey: boolean;
  onCursorUnderflow?: () => void;
  setInstructions: (instructions: Instruction[]) => void;
  setInstructionIndex: (instructionIndex: number) => void;
  setCursorPositions: (cursorPostions: number[]) => void;
  setSelectionRange: (selectionRange: [number, number]) => void;
  setMacros: (macros: Macro[]) => void;
  setMacroSearchString: (macroSearchString?: string) => void;
  setVariableSearchString: (macroSearchString?: string) => void;
  setTypeSearchString: (typeSearchString?: string) => void;
  setActiveRightTab: (rightTab: "build" | "asm" | "macros") => void;
  setFocusIndex: (focusIndex: number) => void;
}) {
  const collapsedIndex = collapsedInstructions[instructionIndex].lineNumber;
  let cursorPos = cursorPositions[cursorPositions.length - 1];

  let inlineInstruction = instruction;
  if (cursorPositions.length > 1) {
    let i = 0;
    while (
      i < cursorPositions.length &&
      inlineInstruction.inlineMacros[cursorPositions[i]]
    ) {
      inlineInstruction =
        inlineInstruction.inlineMacros[cursorPositions[i]].instruction;
      i++;
    }
  }
  const currentInstruction = inlineInstruction;

  function setCursorPos(
    cursorMovement: CursorMovement,
    newInstruction?: CollapsedInstruction
  ) {
    let targetInstruction = newInstruction || currentInstruction;
    switch (cursorMovement) {
      case CursorMovement.INCREMENT: {
        if (
          cursorPos < getFragmentLength(targetInstruction) - 1 &&
          cursorPos < targetInstruction.fragments.length
        ) {
          cursorPositions[cursorPositions.length - 1]++;
          const newFragment =
            targetInstruction.fragments[
              cursorPositions[cursorPositions.length - 1]
            ];
          if (
            newFragment?.type === "varType" &&
            newFragment.value === "var" &&
            targetInstruction.inlineMacros.find(
              (m) => m && m.stackOffset === newFragment.offset
            )
          ) {
            cursorPositions.push(0);
          }
        } else if (cursorPositions.length > 1) {
          cursorPositions.splice(cursorPositions.length - 1, 1);
          cursorPos = cursorPositions[cursorPositions.length - 1];
          setCursorPos(CursorMovement.INCREMENT);
        } else if (instructionIndex < collapsedInstructions.length - 1) {
          if (cursorPositions.length > 1) {
            cursorPositions.splice(1, cursorPositions.length);
          }
          setCursorPos(CursorMovement.START);
          setInstructionIndex(instructionIndex + 1);
        }
        break;
      }
      case CursorMovement.DECREMENT: {
        if (cursorPos > 0) {
          cursorPositions[cursorPositions.length - 1]--;
          const newFragment =
            targetInstruction.fragments[
              cursorPositions[cursorPositions.length - 1]
            ];
          if (
            newFragment?.type === "varType" &&
            newFragment.value === "var" &&
            targetInstruction.inlineMacros[
              cursorPositions[cursorPositions.length - 1]
            ]
          ) {
            cursorPositions.push(
              targetInstruction.inlineMacros[
                cursorPositions[cursorPositions.length - 1]
              ].instruction.fragments.length - 1
            );
          }
        } else if (cursorPositions.length > 1) {
          cursorPositions.splice(cursorPositions.length - 1, 1);
          cursorPositions[cursorPositions.length - 1]--;
        } else if (instructionIndex > 0 && currentInstruction) {
          setInstructionIndex(instructionIndex - 1);
          const previousInstruction =
            collapsedInstructions[instructionIndex - 1];
          cursorPositions[cursorPositions.length - 1] = Math.max(
            Math.min(
              previousInstruction.fragments.length,
              getFragmentLength(previousInstruction) - 1
            ),
            0
          );
          const newFragment =
            previousInstruction.fragments[
              cursorPositions[cursorPositions.length - 1]
            ];
          if (
            newFragment?.type === "varType" &&
            newFragment.value === "var" &&
            previousInstruction.inlineMacros[
              previousInstruction.fragments.length - 1
            ]
          ) {
            let inlineInstruction = previousInstruction;
            while (
              inlineInstruction.inlineMacros[
                inlineInstruction.fragments.length - 1
              ]
            ) {
              inlineInstruction =
                inlineInstruction.inlineMacros[
                  inlineInstruction.fragments.length - 1
                ].instruction;
              cursorPositions.push(inlineInstruction.fragments.length - 1);
            }
          }
        }
        break;
      }
      case CursorMovement.START: {
        cursorPositions[cursorPositions.length - 1] = 0;
        break;
      }
      case CursorMovement.END: {
        cursorPositions[cursorPositions.length - 1] = Math.max(
          Math.min(
            targetInstruction.fragments.length,
            getFragmentLength(targetInstruction) - 1
          ),
          0
        );
        break;
      }
      case CursorMovement.PRESERVE: {
        cursorPositions.splice(
          0,
          cursorPositions.length,
          Math.max(
            Math.min(
              cursorPositions[cursorPositions.length - 1],
              targetInstruction.fragments.length,
              getFragmentLength(targetInstruction) - 1
            ),
            0
          )
        );
        break;
      }
    }
    setCursorPositions(cursorPositions.slice());
  }

  if (typeof macroSearchString !== "undefined") {
    const isInline = cursorPositions[0] !== 0;
    let parentInstruction = instruction;
    let depth = 0;
    while (isInline && parentInstruction.inlineMacros[cursorPositions[depth]]) {
      parentInstruction =
        parentInstruction.inlineMacros[cursorPositions[depth]].instruction;
      depth++;
    }
    const found = macros
      .filter(
        (m) =>
          ((isInline && m.inline) || (!isInline && !m.inline)) &&
          m.name
            .toLocaleLowerCase()
            .startsWith(macroSearchString.toLocaleLowerCase())
      )
      .sort((a, b) => b.name.length - a.name.length);
    if (key.match(/^[ -~]$/)) {
      setMacroSearchString(macroSearchString + key);
    } else {
      switch (key) {
        case "Enter": {
          if (found.length === 0) {
            break;
          }
          const macroContentsFixed = found[0].instructions
            .map((inst): Instruction[] => {
              const toReturn = JSON.parse(JSON.stringify(inst)) as Instruction;
              for (let i = 0; i < toReturn.fragments.length; i++) {
                const fragment = toReturn.fragments[i];
                if (
                  (fragment?.type === "varType" ||
                    fragment?.type === "assignAction" ||
                    fragment?.type === "comparator") &&
                  fragment.value === "_"
                ) {
                  toReturn.fragments[i] = {
                    ...fragment,
                    value: "missing",
                  };
                }
              }
              switch (toReturn.type) {
                case "placeholderInstruction": {
                  return [
                    {
                      type: "emptyInstruction",
                      fragments: [undefined],
                    },
                  ];
                }
                case "compareInstruction":
                case "assignInstruction": {
                  const target = toReturn.fragments[1] && {
                    ...toReturn.fragments[1],
                  };
                  if (
                    target &&
                    target.value === "var" &&
                    typeof target.offset !== "undefined"
                  ) {
                    target.offset += getStackOffsetAtInstructionIndex(
                      parentInstruction.lineNumber,
                      instructions
                    );
                    toReturn.fragments[1] = target;
                  }
                  const source = toReturn.fragments[3] && {
                    ...toReturn.fragments[3],
                  };
                  if (
                    source &&
                    source.value === "var" &&
                    typeof source.offset !== "undefined"
                  ) {
                    source.offset += getStackOffsetAtInstructionIndex(
                      parentInstruction.lineNumber,
                      instructions
                    );
                    toReturn.fragments[3] = source;
                  }
                  return [toReturn];
                }
                case "defInstruction": {
                  const fragment = toReturn.fragments[1];
                  if (fragment) {
                    let nextNumber = 1;
                    while (true) {
                      const next = nextNumber;
                      if (
                        visibleVariables.find((v) =>
                          v.name.startsWith(
                            fragment.value + (next === 1 ? "" : next)
                          )
                        )
                      ) {
                        nextNumber++;
                      } else {
                        break;
                      }
                    }
                    fragment.value += (nextNumber === 1
                      ? ""
                      : nextNumber
                    ).toString();
                  }
                  modifyStackOffsetsAfter(
                    1,
                    parentInstruction.lineNumber,
                    instructions
                  );
                  return [toReturn];
                }
                default: {
                  return [toReturn];
                }
              }
            })
            .flat();
          if (isInline) {
            instructions.splice(
              parentInstruction.lineNumber,
              0,
              ...JSON.parse(JSON.stringify(macroContentsFixed))
            );
            const attachedFragment = parentInstruction.fragments[
              cursorPositions[cursorPositions.length - 1]
            ] as VarTypeFragment;
            const inlineReturnValue = found[0]
              .instructions[0] as DefInstruction;
            const inlineType = baseTypes.find(
              (b) => b.name === inlineReturnValue.fragments[2]?.value
            );
            if (attachedFragment) {
              attachedFragment.value = "var";
              if (attachedFragment.value === "var") {
                attachedFragment.offset = getStackOffsetAtInstructionIndex(
                  parentInstruction.lineNumber,
                  instructions
                );
                attachedFragment.size = inlineType?.size;
                attachedFragment.numberType = inlineType?.numberType;
              }
            } else {
              parentInstruction.fragments[
                cursorPositions[cursorPositions.length - 1]
              ] = {
                type: "varType",
                value: "var",
                offset: getStackOffsetAtInstructionIndex(
                  parentInstruction.lineNumber,
                  instructions
                ),
                size: inlineType?.size,
                numberType: inlineType?.numberType,
              };
            }
            cursorPositions.push(0);
            setCursorPositions(cursorPositions.slice());
          } else {
            instructions.splice(
              parentInstruction.lineNumber,
              1,
              ...JSON.parse(JSON.stringify(macroContentsFixed))
            );
          }
          if (
            instructions[instructions.length - 1].type !== "emptyInstruction"
          ) {
            instructions.push({
              type: "emptyInstruction",
              fragments: [undefined],
            });
          }
          setMacroSearchString(undefined);
          setInstructions(instructions.slice());
          break;
        }
        case "Backspace": {
          if (macroSearchString.length > 0) {
            setMacroSearchString(
              macroSearchString.slice(0, macroSearchString.length - 1)
            );
          } else {
            setMacroSearchString(undefined);
          }
          break;
        }
        case "Escape": {
          setMacroSearchString(undefined);
        }
      }
    }
    return;
  }

  if (typeof variableSearchString !== "undefined") {
    const found = visibleVariables
      .filter((m) =>
        m.name
          .toLocaleLowerCase()
          .startsWith(variableSearchString.toLocaleLowerCase())
      )
      .sort((a, b) => a.name.length - b.name.length);
    if (key !== " " && key.match(/^[ -~]$/)) {
      setVariableSearchString(variableSearchString + key);
    } else {
      switch (key) {
        case " ":
        case "Enter": {
          if (found.length === 0) {
            break;
          }
          const currentFragment = currentInstruction.fragments[cursorPos];
          if (
            currentFragment?.type === "varType" &&
            currentFragment.value === "var"
          ) {
            currentFragment.offset = found[0].offset;
            currentFragment.numberType = found[0].numberType;
            currentFragment.size = found[0].size;
          }
          setVariableSearchString(undefined);
          setCursorPos(CursorMovement.INCREMENT);
          setInstructions(instructions.slice());
          break;
        }
        case "Backspace": {
          if (variableSearchString.length > 0) {
            setVariableSearchString(
              variableSearchString.slice(0, variableSearchString.length - 1)
            );
          } else {
            currentInstruction.fragments[cursorPos] = undefined;
            setVariableSearchString(undefined);
          }
          break;
        }
        case "Escape": {
          collapsedInstructions[instructionIndex].fragments[
            cursorPos
          ] = undefined;
          setVariableSearchString(undefined);
        }
      }
    }
    return;
  }

  if (typeof typeSearchString !== "undefined") {
    const found = baseTypes
      .filter((t) =>
        t.name
          .toLocaleLowerCase()
          .startsWith(typeSearchString.toLocaleLowerCase())
      )
      .sort((a, b) => a.name.length - b.name.length);
    if (key !== " " && key.match(/^[ -~]$/)) {
      setTypeSearchString(typeSearchString + key);
    } else {
      switch (key) {
        case " ":
        case "Enter": {
          if (found.length === 0) {
            break;
          }
          const currentFragment = currentInstruction.fragments[cursorPos];
          if (currentFragment?.type === "defType") {
            currentFragment.value = found[0].name;
            currentFragment.size = found[0].size;
          }
          setTypeSearchString(undefined);
          setCursorPos(CursorMovement.INCREMENT);
          setInstructions(instructions.slice());
          break;
        }
        case "Backspace": {
          if (typeSearchString.length > 0) {
            setTypeSearchString(
              typeSearchString.slice(0, typeSearchString.length - 1)
            );
          } else {
            currentInstruction.fragments[cursorPos] = undefined;
            setTypeSearchString(undefined);
          }
          break;
        }
        case "Escape": {
          collapsedInstructions[instructionIndex].fragments[
            cursorPos
          ] = undefined;
          setTypeSearchString(undefined);
        }
      }
    }
    return;
  }

  if (selectionRange[0] !== -1) {
    if (key === "ArrowUp" || key === "ArrowDown") {
      const change = key === "ArrowUp" ? -1 : 1;
      if (shiftKey) {
        selectionRange[1] = Math.max(
          Math.min(selectionRange[1] + change, instructions.length - 1),
          0
        );
        setInstructionIndex(
          Math.min(
            Math.max(instructionIndex + change, 0),
            instructions.length - 1
          )
        );
      } else if (!shiftKey) {
        setSelectionRange([-1, -1]);
        setInstructionIndex(
          Math.min(
            Math.max(instructionIndex + change, 0),
            instructions.length - 1
          )
        );
      }
      return;
    } else if (key === "m") {
      const firstInstruction = instructions[Math.max(...selectionRange)];
      macros.push({
        name: "Untitled",
        instructions: JSON.parse(
          JSON.stringify(
            instructions.slice(
              Math.min(...selectionRange),
              Math.max(...selectionRange) + 1
            )
          )
        ),
        inline: firstInstruction.type === "defInstruction",
      });
      setMacros(macros.slice());
      setActiveRightTab("macros");
      setFocusIndex(macros.length);
      return;
    }
  }

  let increment: "instruction" | "cursor" | "none" = "none";

  function parseVarType(
    fragment?: VarTypeFragment,
    disableConst?: boolean,
    isMacro?: boolean
  ) {
    let newFragment = fragment;
    if (typeof newFragment === "undefined" || newFragment.value === "missing") {
      switch (key) {
        case "c": {
          if (!disableConst) {
            newFragment = {
              type: "varType",
              value: "const",
            };
          }
          break;
        }
        case "v": {
          newFragment = {
            type: "varType",
            value: "var",
          };
          setVariableSearchString("");
          break;
        }
        case "m": {
          setMacroSearchString("");
          break;
        }
        case "_": {
          if (isMacro) {
            newFragment = {
              type: "varType",
              value: "_",
              name: "",
            };
          }
          break;
        }
      }
    } else if (newFragment.value === "var") {
      if (key === " " || key.match(/[a-z]/)) {
        increment = "cursor";
      }
      if (typeof newFragment.offset === "undefined") {
        newFragment.offset = parseInt(key, 10);
      } else {
        newFragment.offset = parseInt(newFragment.offset.toString() + key, 10);
      }
    } else if (newFragment.value === "const") {
      if (key === " " || key.match(/[a-z]/)) {
        increment = "cursor";
      }
      if (typeof newFragment?.constValue === "undefined") {
        newFragment.constValue = parseFloat(key);
      } else {
        newFragment.constValue = parseFloat(
          newFragment.constValue.toString() + key
        );
      }
    } else if (newFragment.value === "_") {
      if (key === " " || key === "Enter") {
        increment = "cursor";
      }
      if (key === "Backspace") {
        newFragment.name =
          newFragment.name.length > 0 ? newFragment.name.slice(0, -1) : "";
      } else if (key.match(/[\p{L}\p{N}\s]/gu)) {
        // Multi language alpha numeric
        newFragment.name += key;
      }
    }
    return newFragment;
  }

  function parseAssignAction(
    fragment?: AssignActionFragment,
    // Allow placeholders if we're editing a macro
    isMacro?: boolean,
    // Don't allow equals if we're filling in a macro placeholder
    isPlaceholder?: boolean
  ) {
    let newFragment = fragment;
    if (typeof newFragment === "undefined" || newFragment.value === "missing") {
      switch (key) {
        case "=": {
          if (!isPlaceholder) {
            newFragment = {
              type: "assignAction",
              value: "=",
            };
            increment = "cursor";
          }
          break;
        }
        case "+": {
          newFragment = {
            type: "assignAction",
            value: "+",
          };
          increment = "cursor";
          break;
        }
        case "-": {
          newFragment = {
            type: "assignAction",
            value: "-",
          };
          increment = "cursor";
          break;
        }
        case "*": {
          newFragment = {
            type: "assignAction",
            value: "*",
          };
          increment = "cursor";
          break;
        }
        case "/": {
          newFragment = {
            type: "assignAction",
            value: "/",
          };
          increment = "cursor";
          break;
        }
        case "%": {
          newFragment = {
            type: "assignAction",
            value: "%",
          };
          increment = "cursor";
          break;
        }
        case "&": {
          newFragment = {
            type: "assignAction",
            value: "&&",
          };
          increment = "cursor";
          break;
        }
        case "|": {
          newFragment = {
            type: "assignAction",
            value: "||",
          };
          increment = "cursor";
          break;
        }
        case "_": {
          if (isMacro) {
            newFragment = {
              type: "assignAction",
              value: "_",
              name: "",
            };
            increment = "cursor";
          }
        }
      }
    } else if (newFragment.value === "_") {
      if (key === " " || key === "Enter") {
        increment = "cursor";
      }
      if (key === "Backspace") {
        newFragment.name =
          newFragment.name.length > 0 ? newFragment.name.slice(0, -1) : "";
      } else if (key.match(/[\p{L}\p{N}\s]/gu)) {
        // Multi language alpha numeric
        newFragment.name += key;
      }
    }
    return newFragment;
  }

  function parseComparator(
    fragment?: ComparatorFragment,
    // Allow placeholders if we're editing a macro
    isMacro?: boolean
  ) {
    let newFragment = fragment;
    if (newFragment?.value !== "_") {
      switch (key) {
        case "=": {
          if (!newFragment || newFragment.value === "missing") {
            newFragment = {
              type: "comparator",
              value: "==",
            };
          } else {
            switch (newFragment.value) {
              case "<": {
                newFragment = {
                  type: "comparator",
                  value: "<=",
                };
                increment = "cursor";
                break;
              }
              case ">": {
                newFragment = {
                  type: "comparator",
                  value: ">=",
                };
                increment = "cursor";
                break;
              }
            }
          }
          increment = "cursor";
          break;
        }
        case "!": {
          newFragment = {
            type: "comparator",
            value: "!=",
          };
          increment = "cursor";
          break;
        }
        case "<": {
          newFragment = {
            type: "comparator",
            value: "<",
          };
          setInstructions(instructions.slice());
          break;
        }
        case ">": {
          newFragment = {
            type: "comparator",
            value: ">",
          };
          setInstructions(instructions.slice());
          break;
        }
        case "_": {
          if (isMacro) {
            newFragment = {
              type: "comparator",
              value: "_",
              name: "",
            };
            increment = "cursor";
          }
        }
      }
    } else if (newFragment.value === "_") {
      if (key === " " || key === "Enter") {
        increment = "cursor";
      }
      if (key === "Backspace") {
        newFragment.name =
          newFragment.name.length > 0 ? newFragment.name.slice(0, -1) : "";
      } else if (key.match(/[\p{L}\p{N}\s]/gu)) {
        // Multi language alpha numeric
        newFragment.name += key;
      }
    }
    return newFragment;
  }

  if (currentInstruction.type === "emptyInstruction" || cursorPos === 0) {
    switch (key) {
      case "s": {
        const openInstruction: ScopeInstruction = {
          type: "scopeInstruction",
          fragments: [
            { type: "instruction", value: "scope" },
            { type: "scopeAction", value: "open" },
          ],
        };
        const closeInstruction: ScopeInstruction = {
          type: "scopeInstruction",
          fragments: [
            { type: "instruction", value: "scope" },
            { type: "scopeAction", value: "close" },
          ],
        };
        instructions[collapsedIndex] = openInstruction;
        instructions.splice(collapsedIndex + 1, 0, {
          type: "emptyInstruction",
          fragments: [undefined],
        });
        instructions.splice(collapsedIndex + 2, 0, closeInstruction);
        increment = "instruction";
        break;
      }
      case "a": {
        instructions[collapsedIndex] = {
          type: "assignInstruction",
          fragments: [
            { type: "instruction", value: "assign" },
            undefined,
            undefined,
            undefined,
          ],
        };
        increment = "cursor";
        break;
      }
      case "d": {
        instructions[collapsedIndex] = {
          type: "defInstruction",
          fragments: [
            { type: "instruction", value: "def" },
            undefined,
            undefined,
          ],
        };
        increment = "cursor";
        break;
      }
      case "c": {
        instructions[collapsedIndex] = {
          type: "compareInstruction",
          fragments: [
            { type: "instruction", value: "compare" },
            undefined,
            undefined,
            undefined,
          ],
        };
        increment = "cursor";
        break;
      }
      case "j": {
        instructions[collapsedIndex] = {
          type: "jumpInstruction",
          fragments: [{ type: "instruction", value: "jump" }, undefined],
        };
        increment = "cursor";
        break;
      }
      case "o": {
        instructions[collapsedIndex] = {
          type: "OSInstruction",
          fragments: [
            { type: "instruction", value: "os" },
            undefined,
            undefined,
          ],
        };
        increment = "cursor";
        break;
      }
      case "m": {
        setMacroSearchString("");
        break;
      }
      case "_": {
        if (isMacro) {
          instructions[collapsedIndex] = {
            type: "placeholderInstruction",
            fragments: [{ type: "instruction", value: "_", name: "" }],
          };
        }
        increment = "instruction";
        break;
      }
      default:
        break;
    }
    if (increment === "cursor") {
      cursorPositions[cursorPositions.length - 1]++;
      setCursorPositions(cursorPositions.slice());
      increment = "none";
    }
  } else if (key.match(/^[ -~]$/) || key === ".") {
    switch (currentInstruction.type) {
      case "scopeInstruction": {
        switch (cursorPos) {
          case 1: {
            switch (key) {
              case "o": {
                currentInstruction.fragments[1] = {
                  type: "scopeAction",
                  value: "open",
                };
                increment = "instruction";
                break;
              }
              case "c": {
                currentInstruction.fragments[1] = {
                  type: "scopeAction",
                  value: "close",
                };
                increment = "instruction";
                break;
              }
            }
          }
        }
        break;
      }
      case "defInstruction": {
        switch (cursorPos) {
          case 1: {
            const nameFragment = currentInstruction.fragments[1];
            if (key === " ") {
              increment = "cursor";
            } else if (!nameFragment) {
              currentInstruction.fragments[1] = { type: "defName", value: key };
            } else {
              nameFragment.value += key;
            }
            setInstructions(instructions.slice());
            break;
          }
          case 2: {
            currentInstruction.fragments[2] = {
              type: "defType",
            };
            setTypeSearchString(key);
            break;
          }
        }
        break;
      }
      case "assignInstruction": {
        switch (cursorPos) {
          case 1:
            currentInstruction.fragments[1] = parseVarType(
              currentInstruction.fragments[1],
              true,
              isMacro
            ) as VarTypeVar;
            setInstructions(instructions.slice());
            break;
          case 2: {
            currentInstruction.fragments[2] = parseAssignAction(
              currentInstruction.fragments[2]
            );
            break;
          }
          case 3: {
            currentInstruction.fragments[3] = parseVarType(
              currentInstruction.fragments[3],
              false,
              isMacro
            );
            setInstructions(instructions.slice());
            break;
          }
        }
        break;
      }
      case "compareInstruction": {
        switch (cursorPos) {
          case 1:
            currentInstruction.fragments[1] = parseVarType(
              currentInstruction.fragments[1],
              false,
              isMacro
            );
            setInstructions(instructions.slice());
            break;
          case 2: {
            currentInstruction.fragments[2] = parseComparator(
              currentInstruction.fragments[2],
              false
            );
            break;
          }
          case 3: {
            currentInstruction.fragments[3] = parseVarType(
              currentInstruction.fragments[3],
              false,
              isMacro
            );
            setInstructions(instructions.slice());
            break;
          }
        }
        break;
      }
      case "jumpInstruction": {
        switch (cursorPos) {
          case 1: {
            switch (key) {
              case "s":
                currentInstruction.fragments[1] = {
                  type: "jumpPosition",
                  value: "start",
                };
                break;
              case "e":
                currentInstruction.fragments[1] = {
                  type: "jumpPosition",
                  value: "end",
                };
                break;
            }
            setInstructions(instructions.slice());
            break;
          }
        }
        break;
      }
      case "OSInstruction": {
        switch (cursorPos) {
          case 1: {
            switch (key) {
              case "s": {
                currentInstruction.fragments[1] = {
                  type: "OSAction",
                  value: "stdout",
                };
                increment = "cursor";
                break;
              }
            }
            break;
          }
          case 2: {
            currentInstruction.fragments[2] = parseVarType(
              currentInstruction.fragments[2],
              false,
              isMacro
            );
            setInstructions(instructions.slice());
            break;
          }
        }
        break;
      }
      case "macroInstruction": {
        const fragment = currentInstruction.fragments[cursorPos];
        if (fragment.type === "varType") {
          const newVarType = parseVarType(fragment, false, isMacro);
          if (newVarType) {
            fragment.value = newVarType.value;
            if (fragment.value === "var" || fragment.value === "const") {
              fragment.numberType =
                newVarType.value === "var" ? newVarType.numberType : undefined;
              if (fragment.value === "var") {
                fragment.offset =
                  newVarType.value === "var" ? newVarType.offset : undefined;
              } else if (fragment.value === "const") {
                fragment.constValue =
                  newVarType.value === "const"
                    ? newVarType.constValue
                    : undefined;
              }
            }
          }
          setInstructions(instructions.slice());
        } else if (fragment.type === "assignAction") {
          const newAssignAction = parseAssignAction(fragment, isMacro, true);
          if (newAssignAction) {
            fragment.value = newAssignAction.value;
          }
          setInstructions(instructions.slice());
        } else if (fragment.type === "comparator") {
          const newComparator = parseComparator(fragment, isMacro);
          if (newComparator) {
            fragment.value = newComparator.value;
          }
          setInstructions(instructions.slice());
        }
        break;
      }
    }
  }
  if (increment === "instruction") {
    if (instructionIndex === collapsedInstructions.length - 1) {
      instructions.push({ type: "emptyInstruction", fragments: [undefined] });
    }
    setInstructionIndex(instructionIndex + 1);
    setCursorPos(CursorMovement.START);
  } else if (increment === "cursor") {
    setCursorPos(CursorMovement.INCREMENT);
  }

  // ---------------------------------------------
  if (key === "Backspace" && instruction.type !== "blockInstruction") {
    // Delete multiple lines
    const instructionsToDelete = [currentInstruction];
    if (selectionRange[0] > -1) {
      instructionsToDelete.splice(0, 1);
      let min = Math.min(...selectionRange);
      let max = Math.max(...selectionRange);
      for (let i = max; i >= min; i--) {
        instructionsToDelete.push(collapsedInstructions[i]);
      }
      setSelectionRange([-1, -1]);
    }

    if (cursorPos > 0) {
      if (cursorPos >= currentInstruction.fragments.length) {
        setCursorPos(CursorMovement.DECREMENT);
      } else {
        if (currentInstruction.type === "macroInstruction") {
          currentInstruction.fragments[cursorPos].value = "missing";
        } else {
          currentInstruction.fragments[cursorPos] = undefined;
        }
        setInstructions(instructions.slice());
      }
    } else if (cursorPos === 0) {
      let startLine = instructionsToDelete[0].lineNumber;
      let endLine = instructionsToDelete[0].lineNumber + 1;
      // First delete all the related inline macros
      for (const currentInstruction of instructionsToDelete) {
        startLine = Math.min(startLine, currentInstruction.lineNumber);
        endLine = Math.max(endLine, currentInstruction.lineNumber);
        if (currentInstruction.type === "macroInstruction") {
          endLine = Math.max(endLine, currentInstruction.endLineNumber);
        }
        const toTest = currentInstruction.inlineMacros;
        for (let i = 0; i < toTest.length; i++) {
          const inline = toTest[i];
          if (inline) {
            startLine = Math.min(startLine, inline.instruction.lineNumber);
            endLine = Math.max(endLine, inline.instruction.endLineNumber);
            if (inline.instruction.inlineMacros) {
              toTest.push(...inline.instruction.inlineMacros);
            }
            toTest.splice(i, 1);
            i--;
          }
        }
      }

      for (let i = startLine; i < endLine; i++) {
        endLine -= deleteInstruction(startLine, instructions);
      }

      // If this was the only instruction in a macro placeholder block, replace it with an empty instruction
      if (
        instructions.length === 0 ||
        (instructionIndex > 0 &&
          cursorPositions.length === 1 &&
          collapsedInstructions[instructionIndex - 1].type ===
            "blockInstruction" &&
          collapsedInstructions[instructionIndex + 1].type ===
            "blockInstruction")
      ) {
        instructions.splice(startLine, 0, {
          type: "emptyInstruction",
          fragments: [undefined],
        });
      }

      if (cursorPositions.length === 1) {
        const newIndex = Math.min(
          Math.max(instructionIndex, 0),
          instructions.length - 1,
          collapsedInstructions.length - 1
        );
        setInstructionIndex(newIndex);
        setCursorPos(CursorMovement.PRESERVE, collapsedInstructions[newIndex]);
      } else {
        if (cursorPositions.length > 1) {
          cursorPositions.splice(-1, 1);
          // After we delete the macro lines, remove the reference to the inline macro return value
          let inlineInstruction = instruction;
          if (cursorPositions.length > 1) {
            let i = 0;
            while (
              i < cursorPositions.length &&
              inlineInstruction.inlineMacros[cursorPositions[i]]
            ) {
              inlineInstruction =
                inlineInstruction.inlineMacros[cursorPositions[i]].instruction;
              i++;
            }
          }
          inlineInstruction.fragments[
            cursorPositions[cursorPositions.length - 1]
          ] = undefined;
          setCursorPositions(cursorPositions.slice());
        }
      }
      setInstructions(instructions.slice());
    }
    // ---------------------------------------------
  } else if (key === "ArrowRight" && currentInstruction) {
    setCursorPos(CursorMovement.INCREMENT);
  } else if (key === "ArrowLeft") {
    setCursorPos(CursorMovement.DECREMENT);
    // ---------------------------------------------
  } else if (key === "ArrowUp") {
    if (onCursorUnderflow && instructionIndex === 0) {
      onCursorUnderflow();
    } else if (instructionIndex > 0) {
      const previousInstruction = collapsedInstructions[instructionIndex - 1]!;
      setInstructionIndex(instructionIndex - 1);
      if (shiftKey) {
        setCursorPositions([0]);
        selectionRange[0] = instructionIndex;
        selectionRange[1] = instructionIndex - 1;
        setSelectionRange([instructionIndex, instructionIndex - 1]);
      } else {
        setCursorPos(CursorMovement.PRESERVE, previousInstruction);
      }
    }
    // ---------------------------------------------
  } else if (
    key === "ArrowDown" &&
    instructionIndex < collapsedInstructions.length - 1
  ) {
    const nextInstruction = collapsedInstructions[instructionIndex + 1]!;
    setInstructionIndex(instructionIndex + 1);
    if (shiftKey) {
      setCursorPositions([0]);
      setSelectionRange([instructionIndex, instructionIndex + 1]);
    } else {
      setCursorPos(CursorMovement.PRESERVE, nextInstruction);
    }
    // ---------------------------------------------
  } else if (key === "Enter" && currentInstruction) {
    if (currentInstruction.type !== "macroInstruction") {
      instructions.splice(collapsedIndex + (shiftKey ? 0 : 1), 0, {
        type: "emptyInstruction",
        fragments: [undefined],
      });
      setCursorPos(CursorMovement.START);
      setInstructionIndex(instructionIndex + (shiftKey ? 0 : 1));
      setInstructions(instructions.slice());
    }
  }

  if (
    instructions[instructions.length - 1].type !== "emptyInstruction" &&
    !isMacro
  ) {
    instructions.push({ type: "emptyInstruction", fragments: [undefined] });
    setInstructions(instructions.slice());
  }
}
