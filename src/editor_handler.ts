import { notStrictEqual } from "assert";
import { VisibleVariable } from "./editor";

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
export type AssignPlaceholder = {
  type: "assignAction";
  value: "_";
};

export type AssignActionFragment =
  | AssignEq
  | AssignAdd
  | AssignSubtract
  | AssignDivide
  | AssignMultiply
  | AssignMod
  | AssignPlaceholder;

// VAR TYPES ----------------------------------
export type VarTypeVar = {
  type: "varType";
  value: "var";
  stackPosition?: number;
};
export type VarTypeConst = {
  type: "varType";
  value: "const";
  constValue?: number;
};
export type VarTypePlaceholder = {
  type: "varType";
  value: "_";
};

export type VarTypeFragment = VarTypeVar | VarTypeConst | VarTypePlaceholder;

// VAR SIZES / POSITIONS ----------------------------------
export type VarSizeFragment =
  | {
      type: "size";
      value: number;
    }
  | {
      type: "size";
      value: "_";
    };

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
};

export type ComparatorFragment =
  | ComparatorEq
  | ComparatorNeq
  | ComparatorLt
  | ComparatorLte
  | ComparatorGt
  | ComparatorGte
  | ComparatorPlaceholder;

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
  | AssignActionFragment
  | VarTypeFragment
  | VarSizeFragment
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
  fragments: Partial<[InstructionDef, DefNameFragment, VarSizeFragment]>;
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
  blockRanges: [number, number][];
};

export type CollapsedInstruction = (Instruction | MacroInstruction) & {
  lineNumber: number;
};

export type Macro = {
  name: string;
  placeholders: string[];
  instructions: Instruction[];
};

export function getFragmentLength(instruction: CollapsedInstruction): number {
  switch (instruction.type) {
    case "emptyInstruction":
      return 0;
    case "defInstruction":
      return 4;
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
      return instruction.macro.placeholders.length + 1;
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
      return ["def", "name", "8 | 16 | 32 | 64"];
    case "assignInstruction":
      return ["assign", "var", "= | + | - | * | / | %", "var | const"];
    case "scopeInstruction":
      return ["scope", "open | close"];
    case "compareInstruction":
      return [
        "compare",
        "var | const",
        "= | != | < | <= | > | >=",
        "var | const",
      ];
    case "jumpInstruction":
      return ["jump", "0.. instruction number"];
    case "OSInstruction":
      return ["os", "stdout", "var | const"];
    case "macroInstruction":
      return instruction.macro.placeholders;
  }
}

export const fragmentPlaceholderMessage: { [k: string]: string } = {
  instruction: "_block",
  assignAction: "_operator",
  varType: "_var",
  comparator: "_comparator",
  instructionNumber: "_instructions",
};

export function getStackPositionAtInstructionIndex(
  index: number,
  instructions: Instruction[]
) {
  const scopedPositions: number[] = [0];
  for (let i = 0; i < index; i++) {
    const instruction = instructions[i];
    if (instruction.type === "scopeInstruction") {
      if (instruction.fragments[1]?.value === "open") {
        scopedPositions.push(scopedPositions[scopedPositions.length - 1]);
      } else if (instruction.fragments[1]?.value === "close") {
        scopedPositions.pop();
      }
      // TODO: validate this in a less ugly way
    } else if (
      instruction.type === "defInstruction" &&
      instruction.fragments[1] &&
      instruction.fragments[2]
    ) {
      scopedPositions[scopedPositions.length - 1]++;
    }
  }
  return scopedPositions[scopedPositions.length - 1];
}

export function modifyStackPositionsAfter(
  amount: number,
  index: number,
  instructions: Instruction[]
) {
  const stackPosition = getStackPositionAtInstructionIndex(index, instructions);
  for (let i = 0; i < instructions.length; i++) {
    for (let j = 0; j < instructions[i].fragments.length; j++) {
      const fragment = instructions[i].fragments[j];
      if (
        fragment?.type === "varType" &&
        fragment.value === "var" &&
        typeof fragment.stackPosition !== "undefined" &&
        fragment.stackPosition >= stackPosition
      ) {
        fragment.stackPosition += amount;
      }
    }
  }
}

export function handleKeyStroke({
  instruction,
  instructions,
  collapsedInstructions,
  cursorPos,
  instructionIndex,
  selectedInstructions,
  isMacro,
  macros,
  macroSearchString,
  variableSearchString,
  visibleVariables,
  key,
  shiftKey,
  onCursorUnderflow,
  setInstructions,
  setInstructionIndex,
  setCursorPos,
  setSelectedInstructions,
  setMacros,
  setMacroSearchString,
  setVariableSearchString,
  setActiveRightTab,
  setFocusIndex,
}: {
  instruction: CollapsedInstruction;
  instructions: Instruction[];
  collapsedInstructions: CollapsedInstruction[];
  cursorPos: number;
  instructionIndex: number;
  selectedInstructions: CollapsedInstruction[];
  isMacro: boolean;
  macros: Macro[];
  macroSearchString?: string;
  variableSearchString?: string;
  visibleVariables: VisibleVariable[];
  key: string;
  shiftKey: boolean;
  onCursorUnderflow?: () => void;
  setInstructions: (instructions: Instruction[]) => void;
  setInstructionIndex: (instructionIndex: number) => void;
  setCursorPos: (cursorPos: number) => void;
  setSelectedInstructions: (instructions: CollapsedInstruction[]) => void;
  setMacros: (macros: Macro[]) => void;
  setMacroSearchString: (macroSearchString?: string) => void;
  setVariableSearchString: (macroSearchString?: string) => void;
  setActiveRightTab: (rightTab: "build" | "asm" | "macros") => void;
  setFocusIndex: (focusIndex: number) => void;
}) {
  const collapsedIndex = collapsedInstructions[instructionIndex].lineNumber;

  if (typeof macroSearchString !== "undefined") {
    const found = macros.filter((m) =>
      m.name
        .toLocaleLowerCase()
        .startsWith(macroSearchString.toLocaleLowerCase())
    );
    if (key.match(/^[ -~]$/)) {
      setMacroSearchString(macroSearchString + key);
    } else {
      switch (key) {
        case "Enter": {
          const macroContentsFixed = found[0].instructions
            .map((inst): Instruction[] => {
              switch (inst.type) {
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
                  const toReturn = JSON.parse(JSON.stringify(inst));
                  const target = toReturn.fragments[1] && {
                    ...toReturn.fragments[1],
                  };
                  if (
                    target &&
                    target.value === "var" &&
                    typeof target.stackPosition !== "undefined"
                  ) {
                    target.stackPosition += getStackPositionAtInstructionIndex(
                      collapsedIndex,
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
                    typeof source.stackPosition !== "undefined"
                  ) {
                    source.stackPosition += getStackPositionAtInstructionIndex(
                      collapsedIndex,
                      instructions
                    );
                    toReturn.fragments[3] = source;
                  }
                  return [toReturn];
                }
                case "defInstruction": {
                  console.log(collapsedIndex);
                  modifyStackPositionsAfter(1, collapsedIndex, instructions);
                  return [inst];
                }
                default: {
                  return [inst];
                }
              }
            })
            .flat();
          instructions.splice(
            collapsedIndex,
            1,
            ...JSON.parse(JSON.stringify(macroContentsFixed))
          );
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
          setMacroSearchString(
            macroSearchString.slice(0, macroSearchString.length - 1)
          );
          break;
        }
      }
    }
    return;
  }

  if (typeof variableSearchString !== "undefined") {
    const found = visibleVariables.filter(
      (m) =>
        m.visible &&
        m.name
          .toLocaleLowerCase()
          .startsWith(variableSearchString.toLocaleLowerCase())
    );
    if (key !== " " && key.match(/^[ -~]$/)) {
      setVariableSearchString(variableSearchString + key);
    } else {
      switch (key) {
        case " ":
        case "Enter": {
          const currentFragment =
            collapsedInstructions[instructionIndex].fragments[cursorPos];
          if (
            currentFragment?.type === "varType" &&
            currentFragment.value === "var"
          ) {
            currentFragment.stackPosition = found[0].index;
          }
          setVariableSearchString(undefined);
          setCursorPos(cursorPos + 1);
          setInstructions(instructions.slice());
          break;
        }
        case "Backspace": {
          setVariableSearchString(
            variableSearchString.slice(0, variableSearchString.length - 1)
          );
          break;
        }
      }
    }
    return;
  }

  if (selectedInstructions.length > 0) {
    if (key === "ArrowUp") {
      const previousInstruction = collapsedInstructions[instructionIndex - 1]!;
      if (shiftKey && instructionIndex > 0) {
        const selectedIndex = selectedInstructions.findIndex(
          (i) => i === instruction
        );
        if (
          selectedIndex > -1 &&
          selectedInstructions.includes(previousInstruction)
        ) {
          selectedInstructions.splice(selectedIndex, 1);
        } else {
          if (!selectedInstructions.includes(instruction)) {
            selectedInstructions.push(instruction);
          }
          selectedInstructions.push(previousInstruction);
        }
        setInstructionIndex(instructionIndex - 1);
        setSelectedInstructions(selectedInstructions);
      } else if (!shiftKey) {
        selectedInstructions.splice(0, selectedInstructions.length);
        setSelectedInstructions(selectedInstructions.slice());
        setInstructionIndex(Math.max(instructionIndex - 1, 0));
      }
    } else if (key === "ArrowDown") {
      if (shiftKey && instructionIndex < collapsedInstructions.length - 1) {
        const nextInstruction = collapsedInstructions[instructionIndex + 1]!;
        const selectedIndex = selectedInstructions.findIndex(
          (i) => i === instruction
        );
        if (
          selectedIndex > -1 &&
          selectedInstructions.includes(nextInstruction)
        ) {
          selectedInstructions.splice(selectedIndex, 1);
        } else {
          selectedInstructions.push(nextInstruction);
          if (!selectedInstructions.includes(instruction)) {
            selectedInstructions.push(instruction);
          }
        }
        setSelectedInstructions(selectedInstructions);
        setInstructionIndex(instructionIndex + 1);
      } else if (!shiftKey) {
        selectedInstructions.splice(0, selectedInstructions.length);
        setSelectedInstructions(selectedInstructions.slice());
        setInstructionIndex(
          Math.min(instructionIndex + 1, collapsedInstructions.length - 1)
        );
      }
    } else if (key === "m") {
      macros.push({
        name: "Untitled",
        instructions: JSON.parse(JSON.stringify(selectedInstructions)),
        placeholders: [],
      });
      setMacros(macros.slice());
      setActiveRightTab("macros");
      setFocusIndex(macros.length);
    }
    return;
  }

  let increment: "instruction" | "cursor" | "none" = "none";

  function parseVarType(
    fragment?: VarTypeVar | VarTypeConst | VarTypePlaceholder,
    disableConst?: boolean
  ) {
    let newFragment = fragment;
    if (typeof newFragment === "undefined" || fragment?.value === "_") {
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
        case "_": {
          if (isMacro) {
            newFragment = {
              type: "varType",
              value: "_",
            };
          }
          break;
        }
      }
    } else if (newFragment.value === "var") {
      if (key === " " || key.match(/[a-z]/)) {
        increment = "cursor";
      }
      if (typeof newFragment.stackPosition === "undefined") {
        newFragment.stackPosition = parseInt(key, 10);
      } else {
        newFragment.stackPosition = parseInt(
          newFragment.stackPosition.toString() + key,
          10
        );
      }
    } else if (newFragment.value === "const") {
      if (key === " " || key.match(/[a-z]/)) {
        increment = "cursor";
      }
      if (typeof newFragment?.constValue === "undefined") {
        newFragment.constValue = parseInt(key, 10);
      } else {
        newFragment.constValue = parseInt(
          newFragment.constValue.toString() + key,
          10
        );
      }
    }
    return newFragment;
  }

  if (instruction.type === "emptyInstruction" || cursorPos === 0) {
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
            fragments: [{ type: "instruction", value: "_" }],
          };
        }
        increment = "instruction";
        break;
      }
      default:
        break;
    }
  } else if (key.match(/^[ -~]$/)) {
    switch (instruction.type) {
      case "scopeInstruction": {
        switch (cursorPos) {
          case 1: {
            switch (key) {
              case "o": {
                instruction.fragments[1] = {
                  type: "scopeAction",
                  value: "open",
                };
                increment = "instruction";
                break;
              }
              case "c": {
                instruction.fragments[1] = {
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
            const nameFragment = instruction.fragments[1];
            if (key === " ") {
              increment = "cursor";
            } else if (!nameFragment) {
              instruction.fragments[1] = { type: "defName", value: key };
            } else {
              nameFragment.value += key;
            }
            setInstructions(instructions.slice());
            break;
          }
          case 2: {
            if (isMacro && key === "_") {
              instruction.fragments[2] = {
                type: "size",
                value: "_",
              };
              increment = "instruction";
            } else {
              let value = 8;
              switch (key) {
                case "8":
                  break;
                case "1":
                  value = 16;
                  break;
                case "3":
                  value = 32;
                  break;
                case "6":
                  value = 64;
                  break;
                default:
                  return;
              }
              instruction.fragments[2] = {
                type: "size",
                value,
              };
              modifyStackPositionsAfter(1, collapsedIndex, instructions);
              increment = "cursor";
              setInstructions(instructions.slice());
              break;
            }
          }
        }
        break;
      }
      case "assignInstruction": {
        switch (cursorPos) {
          case 1:
            instruction.fragments[1] = parseVarType(
              instruction.fragments[1],
              true
            ) as VarTypeVar;
            setInstructions(instructions.slice());
            break;
          case 2: {
            switch (key) {
              case "=": {
                instruction.fragments[2] = {
                  type: "assignAction",
                  value: "=",
                };
                increment = "cursor";
                break;
              }
              case "+": {
                instruction.fragments[2] = {
                  type: "assignAction",
                  value: "+",
                };
                increment = "cursor";
                break;
              }
              case "-": {
                instruction.fragments[2] = {
                  type: "assignAction",
                  value: "-",
                };
                increment = "cursor";
                break;
              }
              case "*": {
                instruction.fragments[2] = {
                  type: "assignAction",
                  value: "*",
                };
                increment = "cursor";
                break;
              }
              case "/": {
                instruction.fragments[2] = {
                  type: "assignAction",
                  value: "/",
                };
                increment = "cursor";
                break;
              }
              case "%": {
                instruction.fragments[2] = {
                  type: "assignAction",
                  value: "%",
                };
                increment = "cursor";
                break;
              }
              case "_": {
                if (isMacro) {
                  instruction.fragments[2] = {
                    type: "assignAction",
                    value: "_",
                  };
                  increment = "cursor";
                }
                break;
              }
            }
            break;
          }
          case 3: {
            instruction.fragments[3] = parseVarType(instruction.fragments[3]);
            setInstructions(instructions.slice());
            break;
          }
        }
        break;
      }
      case "compareInstruction": {
        switch (cursorPos) {
          case 1:
            instruction.fragments[1] = parseVarType(instruction.fragments[1]);
            setInstructions(instructions.slice());
            break;
          case 2: {
            if (isMacro && key === "_") {
              instruction.fragments[2] = {
                type: "comparator",
                value: "_",
              };
              increment = "cursor";
              break;
            } else {
              if (
                instruction.fragments[2] &&
                (key === " " || key.match(/[a-z]/))
              ) {
                increment = "cursor";
                break;
              }
              switch (key) {
                case "=": {
                  if (!instruction.fragments[2]) {
                    instruction.fragments[2] = {
                      type: "comparator",
                      value: "==",
                    };
                  } else {
                    switch (instruction.fragments[2].value) {
                      case "<": {
                        instruction.fragments[2] = {
                          type: "comparator",
                          value: "<=",
                        };
                        increment = "cursor";
                        break;
                      }
                      case ">": {
                        instruction.fragments[2] = {
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
                  instruction.fragments[2] = {
                    type: "comparator",
                    value: "!=",
                  };
                  increment = "cursor";
                  break;
                }
                case "<": {
                  instruction.fragments[2] = {
                    type: "comparator",
                    value: "<",
                  };
                  setInstructions(instructions.slice());
                  break;
                }
                case ">": {
                  instruction.fragments[2] = {
                    type: "comparator",
                    value: ">",
                  };
                  setInstructions(instructions.slice());
                  break;
                }
              }
            }
            break;
          }
          case 3: {
            instruction.fragments[3] = parseVarType(instruction.fragments[3]);
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
                instruction.fragments[1] = {
                  type: "jumpPosition",
                  value: "start",
                };
                break;
              case "e":
                instruction.fragments[1] = {
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
                instruction.fragments[1] = {
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
            instruction.fragments[2] = parseVarType(
              instruction.fragments[2],
              true
            );
            setInstructions(instructions.slice());
            break;
          }
        }
        break;
      }
      case "macroInstruction": {
        const fragment = instruction.fragments[cursorPos];
        if (fragment.type === "varType") {
          const newVarType = parseVarType(fragment);
          if (newVarType) {
            fragment.value = newVarType.value;
            if (fragment.value === "var") {
              fragment.stackPosition =
                newVarType.value === "var"
                  ? newVarType.stackPosition
                  : undefined;
            } else if (fragment.value === "const") {
              fragment.constValue =
                newVarType.value === "const"
                  ? newVarType.constValue
                  : undefined;
            }
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
    setCursorPos(0);
  } else if (increment === "cursor") {
    setCursorPos(cursorPos + 1);
  }

  // ---------------------------------------------
  if (key === "Backspace") {
    // Delete multiple lines
    if (selectedInstructions.length > 0) {
      let earliest = instructions.findIndex(
        (i) => i === selectedInstructions[0]
      );
      for (const selected of selectedInstructions) {
        const index = instructions.findIndex((i) => i === selected);
        earliest = Math.min(earliest, index);
        instructions.splice(index, 1);
      }
      setSelectedInstructions([]);
      if (instructions.length === 0) {
        instructions.push({ type: "emptyInstruction", fragments: [undefined] });
      }
      setInstructionIndex(Math.max(earliest - 1, 0));
      setInstructions(instructions.slice(0));
    } else if (cursorPos > 0) {
      if (cursorPos >= instruction.fragments.length) {
        setCursorPos(cursorPos - 1);
      } else {
        if (instruction.type === "macroInstruction") {
          instruction.fragments[cursorPos].value = "_";
        } else {
          instruction.fragments[cursorPos] = undefined;
        }
        setInstructions(instructions.slice());
      }
    } else if (cursorPos === 0) {
      if (instructionIndex === 0 && instructions.length === 1) {
        instructions[instructionIndex] = {
          type: "emptyInstruction",
          fragments: [undefined],
        };
      } else {
        instructions.splice(collapsedIndex, 1);
        if (instruction.type === "scopeInstruction") {
          let numOpen = 0;
          for (let i = instructionIndex; i < instructions.length; i++) {
            const instruction = instructions[i];
            if (instruction.type === "scopeInstruction") {
              if (instruction.fragments[1]?.value === "close") {
                if (numOpen === 0) {
                  instructions.splice(i, 1);
                  if (instructionIndex >= i) {
                    setInstructionIndex(
                      Math.min(
                        Math.max(instructionIndex - 1, 0),
                        collapsedInstructions.length - 1
                      )
                    );
                  }
                } else {
                  numOpen--;
                }
              } else {
                numOpen++;
              }
            }
          }
        } else if (instruction.type === "defInstruction") {
          modifyStackPositionsAfter(-1, collapsedIndex, instructions);
        } else {
          setInstructionIndex(
            Math.min(
              Math.max(instructionIndex, 0),
              collapsedInstructions.length - 1
            )
          );
        }
      }
      setInstructions(instructions.slice());
    }
    // ---------------------------------------------
  } else if (key === "ArrowRight" && instruction) {
    if (
      cursorPos < getFragmentLength(instruction) - 1 &&
      cursorPos < instruction.fragments.length
    ) {
      setCursorPos(cursorPos + 1);
    } else if (instructionIndex < collapsedInstructions.length - 1) {
      setCursorPos(0);
      setInstructionIndex(instructionIndex + 1);
    }
  } else if (key === "ArrowLeft") {
    if (cursorPos > 0) {
      setCursorPos(cursorPos - 1);
    } else if (instructionIndex > 0 && instruction) {
      setInstructionIndex(instructionIndex - 1);
      setCursorPos(
        Math.max(
          Math.min(
            instructions[instructionIndex - 1]!.fragments.length,
            getFragmentLength(collapsedInstructions[instructionIndex - 1]) - 1
          ),
          0
        )
      );
    }
    // ---------------------------------------------
  } else if (key === "ArrowUp") {
    if (onCursorUnderflow && instructionIndex === 0) {
      onCursorUnderflow();
    } else if (instructionIndex > 0) {
      const previousInstruction = collapsedInstructions[instructionIndex - 1]!;
      if (cursorPos > previousInstruction.fragments.length - 1) {
        setCursorPos(Math.max(previousInstruction.fragments.length - 1, 0));
      }
      setInstructionIndex(instructionIndex - 1);
      if (shiftKey) {
        selectedInstructions.push(instruction);
        selectedInstructions.push(previousInstruction);
        setSelectedInstructions(selectedInstructions.slice());
      }
    }
    // ---------------------------------------------
  } else if (
    key === "ArrowDown" &&
    instructionIndex < collapsedInstructions.length - 1
  ) {
    const nextInstruction = collapsedInstructions[instructionIndex + 1]!;
    if (cursorPos > nextInstruction.fragments.length - 1) {
      setCursorPos(Math.max(nextInstruction.fragments.length - 1, 0));
    }
    setInstructionIndex(instructionIndex + 1);
    if (shiftKey) {
      selectedInstructions.push(instruction);
      selectedInstructions.push(nextInstruction);
      setSelectedInstructions(selectedInstructions.slice());
    }
    // ---------------------------------------------
  } else if (key === "Enter" && instruction) {
    instructions.splice(collapsedIndex + (shiftKey ? 0 : 1), 0, {
      type: "emptyInstruction",
      fragments: [undefined],
    });
    setCursorPos(0);
    setInstructionIndex(instructionIndex + (shiftKey ? 0 : 1));
    setInstructions(instructions.slice());
  }

  if (instructions[instructions.length - 1].type !== "emptyInstruction") {
    instructions.push({ type: "emptyInstruction", fragments: [undefined] });
    setInstructions(instructions.slice());
  }
}
