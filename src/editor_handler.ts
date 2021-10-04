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
export type DefLocal = {
  type: "defLocation";
  value: "local";
};

export type DefParent = {
  type: "defLocation";
  value: "parent";
};

export type DefPlaceholder = {
  type: "defLocation";
  value: "_";
};

export type DefLocationFragment = DefLocal | DefParent | DefPlaceholder;

// SET ----------------------------------
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

export type InstructionNumberFragment =
  | {
      type: "instructionNumber";
      value: number;
    }
  | {
      type: "instructionNumber";
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

export type OSActionFragment = {
  type: "OSAction";
  value: "stdout";
};

export type Fragment =
  | InstructionFragment
  | ScopeFragment
  | DefLocationFragment
  | AssignActionFragment
  | VarTypeFragment
  | VarSizeFragment
  | ComparatorFragment
  | InstructionNumberFragment
  | OSActionFragment;

// scope open
export type ScopeInstruction = {
  type: "scopeInstruction";
  partner?: ScopeInstruction;
  fragments: Partial<[InstructionScope, ScopeFragment]>;
};

// def local 16
export type DefInstruction = {
  type: "defInstruction";
  fragments: Partial<[InstructionDef, DefLocationFragment, VarSizeFragment]>;
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
  fragments: Partial<[InstructionJump, InstructionNumberFragment]>;
};

export type OSInstruction = {
  type: "OSInstruction";
  fragments: Partial<[InstructionOS, OSActionFragment, VarTypeFragment]>;
};

export type EmptyInstruction = {
  type: "emptyInstruction";
  fragments: [];
};

export type PlaceholderInstruction = {
  type: "placeholderInstruction";
  fragments: [InstructionPlaceholder];
};

export type Instruction = (
  | EmptyInstruction
  | DefInstruction
  | AssignInstruction
  | ScopeInstruction
  | CompareInstruction
  | JumpInstruction
  | OSInstruction
  | PlaceholderInstruction
) & {
  valid?: boolean;
};

export type Macro = {
  name: string;
  instructions: Instruction[];
};

/*
scope open
def local 16
scope open
def parent 16
assign 1 eq const 0
assign 1 add const 1
os stdout var 1
compare lt var 1 const 1000
jump 6
scope close
scope close
*/

export const fragmentLength: { [k in Instruction["type"]]: number } = {
  emptyInstruction: 0,
  defInstruction: 3,
  assignInstruction: 4,
  scopeInstruction: 2,
  compareInstruction: 4,
  jumpInstruction: 2,
  OSInstruction: 3,
  placeholderInstruction: 1,
};

export const fragmentHints: { [k in Instruction["type"]]: string[] } = {
  emptyInstruction: ["scope | def | assign | compare | jump | os | macro"],
  placeholderInstruction: [],
  defInstruction: ["def", "local | parent", "8 | 16 | 32 | 64"],
  assignInstruction: ["assign", "var", "= | + | - | * | / | %", "var | const"],
  scopeInstruction: ["scope", "open | close"],
  compareInstruction: [
    "compare",
    "var | const",
    "= | != | < | <= | > | >=",
    "var | const",
  ],
  jumpInstruction: ["jump", "0.. instruction number"],
  OSInstruction: ["os", "stdout", "var | const"],
};

export function handleKeyStroke({
  instruction,
  instructions,
  cursorPos,
  instructionIndex,
  selectedInstructions,
  isMacro,
  macros,
  macroSearchString,
  key,
  shiftKey,
  onCursorUnderflow,
  setInstructions,
  setInstructionIndex,
  setCursorPos,
  setSelectedInstructions,
  setMacros,
  setMacroSearchString,
  setActiveRightTab,
  setFocusIndex,
}: {
  instruction: Instruction;
  instructions: Instruction[];
  cursorPos: number;
  instructionIndex: number;
  selectedInstructions: Instruction[];
  isMacro: boolean;
  macros: Macro[];
  macroSearchString?: string;
  key: string;
  shiftKey: boolean;
  onCursorUnderflow?: () => void;
  setInstructions: (instructions: Instruction[]) => void;
  setInstructionIndex: (instructionIndex: number) => void;
  setCursorPos: (cursorPos: number) => void;
  setSelectedInstructions: (instructions: Instruction[]) => void;
  setMacros: (macros: Macro[]) => void;
  setMacroSearchString: (macroSearchString?: string) => void;
  setActiveRightTab: (rightTab: "build" | "asm" | "macros") => void;
  setFocusIndex: (focusIndex: number) => void;
}) {
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
          instructions.splice(
            instructionIndex,
            1,
            ...JSON.parse(JSON.stringify(found[0].instructions))
          );
          setInstructionIndex(
            instructionIndex + found[0].instructions.length - 1
          );
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

  if (selectedInstructions.length > 0) {
    if (key === "ArrowUp") {
      const previousInstruction = instructions[instructionIndex - 1]!;
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
      if (shiftKey && instructionIndex < instructions.length - 1) {
        const nextInstruction = instructions[instructionIndex + 1]!;
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
          Math.min(instructionIndex + 1, instructions.length - 1)
        );
      }
    } else if (key === "m") {
      macros.push({
        name: "Untitled",
        instructions: JSON.parse(JSON.stringify(selectedInstructions)),
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
    if (typeof newFragment === "undefined") {
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
          partner: openInstruction,
        };
        openInstruction.partner = closeInstruction;
        instructions[instructionIndex] = openInstruction;
        instructions.splice(instructionIndex + 1, 0, {
          type: "emptyInstruction",
          fragments: [],
        });
        instructions.splice(instructionIndex + 2, 0, closeInstruction);
        increment = "instruction";
        break;
      }
      case "a": {
        instructions[instructionIndex] = {
          type: "assignInstruction",
          fragments: [{ type: "instruction", value: "assign" }],
        };
        increment = "cursor";
        break;
      }
      case "d": {
        instructions[instructionIndex] = {
          type: "defInstruction",
          fragments: [{ type: "instruction", value: "def" }],
        };
        increment = "cursor";
        break;
      }
      case "c": {
        instructions[instructionIndex] = {
          type: "compareInstruction",
          fragments: [{ type: "instruction", value: "compare" }],
        };
        increment = "cursor";
        break;
      }
      case "j": {
        instructions[instructionIndex] = {
          type: "jumpInstruction",
          fragments: [{ type: "instruction", value: "jump" }],
        };
        increment = "cursor";
        break;
      }
      case "o": {
        instructions[instructionIndex] = {
          type: "OSInstruction",
          fragments: [{ type: "instruction", value: "os" }],
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
          instructions[instructionIndex] = {
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
            switch (key) {
              case "l": {
                instruction.fragments[1] = {
                  type: "defLocation",
                  value: "local",
                };
                increment = "cursor";
                break;
              }
              case "p": {
                instruction.fragments[1] = {
                  type: "defLocation",
                  value: "parent",
                };
                increment = "cursor";
                break;
              }
              case "_": {
                if (isMacro) {
                  instruction.fragments[1] = {
                    type: "defLocation",
                    value: "_",
                  };
                  instruction.fragments[2] = {
                    type: "size",
                    value: "_",
                  };
                  increment = "cursor";
                }
                break;
              }
            }
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
            if (isMacro && key === "_") {
              if (isMacro) {
                instruction.fragments[1] = {
                  type: "instructionNumber",
                  value: "_",
                };
              }
              break;
            } else {
              if (!instruction.fragments[1]) {
                instruction.fragments[1] = {
                  type: "instructionNumber",
                  value: parseInt(key, 10),
                };
              } else {
                instruction.fragments[1].value = parseInt(
                  instruction.fragments[1].value.toString() + key,
                  10
                );
              }
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
    }
  }
  if (increment === "instruction") {
    if (instructionIndex === instructions.length - 1) {
      instructions.push({ type: "emptyInstruction", fragments: [] });
    }
    // TODO: proper validation / type checking
    if (instruction.fragments.length === fragmentLength[instruction.type]) {
      instruction.valid = true;
    }
    setInstructionIndex(instructionIndex + 1);
    setCursorPos(0);
  } else if (increment === "cursor") {
    setCursorPos(cursorPos + 1);
  }

  // TODO: proper validation / type checking
  if (instruction.fragments.length === fragmentLength[instruction.type]) {
    instruction.valid = true;
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
        instructions.push({ type: "emptyInstruction", fragments: [] });
      }
      setInstructionIndex(Math.max(earliest - 1, 0));
      setInstructions(instructions.slice(0));
    } else if (cursorPos > 0) {
      if (cursorPos >= instruction.fragments.length) {
        setCursorPos(cursorPos - 1);
      } else {
        instruction.fragments.splice(cursorPos, 1);
        instruction.valid = false;
        setInstructions(instructions.slice());
      }
    } else if (cursorPos === 0) {
      if (instructionIndex === 0 && instructions.length === 1) {
        instructions[instructionIndex] = {
          type: "emptyInstruction",
          fragments: [],
        };
      } else {
        if (instructions.length === 1) {
          return;
        }
        instructions.splice(instructionIndex, 1);
        if (instruction.type === "scopeInstruction" && instruction.partner) {
          const deleteIndex = instructions.findIndex(
            (i) => i === instruction.partner
          );
          instructions.splice(deleteIndex, 1);
          if (instructionIndex >= deleteIndex) {
            setInstructionIndex(
              Math.min(
                Math.max(instructionIndex - 1, 0),
                instructions.length - 1
              )
            );
          }
        } else {
          setInstructionIndex(
            Math.min(Math.max(instructionIndex, 0), instructions.length - 1)
          );
        }
      }
      setInstructions(instructions.slice());
    }
    // ---------------------------------------------
  } else if (key === "ArrowRight" && instruction) {
    if (
      cursorPos < fragmentLength[instruction.type] - 1 &&
      cursorPos < instruction.fragments.length
    ) {
      setCursorPos(cursorPos + 1);
    } else if (instructionIndex < instructions.length - 1) {
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
            fragmentLength[instructions[instructionIndex - 1].type] - 1
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
      const previousInstruction = instructions[instructionIndex - 1]!;
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
    instructionIndex < instructions.length - 1
  ) {
    const nextInstruction = instructions[instructionIndex + 1]!;
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
    instructions.splice(instructionIndex + (shiftKey ? 0 : 1), 0, {
      type: "emptyInstruction",
      fragments: [],
    });
    setCursorPos(0);
    setInstructionIndex(instructionIndex + (shiftKey ? 0 : 1));
    setInstructions(instructions.slice());
  }
}
