import classnames from "classnames";
import React from "react";
import { useState, useEffect } from "react";
import {
  fragmentHints,
  fragmentLength,
  handleKeyStroke,
  Instruction,
  Macro,
} from "./editor_handler";

function renderInstructions(
  instructions: Instruction[],
  selectedInstructions: Instruction[],
  instructionIndex: number,
  cursorPos: number,
  hasFocus: boolean,
  isMacro: boolean,
  macros: Macro[],
  macroSearchString: string | undefined
) {
  let indent = 0;
  return instructions.map((instruction, li) => {
    const fragments = instruction.fragments.map((fragment, i) => {
      let fragmentContent: React.ReactNode;
      if (fragment?.type === "varType") {
        switch (fragment?.value) {
          case "_":
            fragmentContent = "_";
            break;
          case "var":
            fragmentContent = `var ${
              typeof fragment.stackPosition === "undefined"
                ? "0.. variable"
                : fragment.stackPosition
            }`;
            break;
          case "const":
            fragmentContent = `const ${
              typeof fragment.constValue === "undefined"
                ? "0.. value"
                : fragment.constValue
            }`;
            break;
        }
      } else {
        fragmentContent = fragment?.value;
      }
      return [
        <div
          key={i}
          className={classnames("fragment", fragment?.value, fragment?.type, {
            highlight:
              instructionIndex === li &&
              cursorPos === i &&
              selectedInstructions.length === 0 &&
              hasFocus,
          })}
        >
          {fragmentContent}
        </div>,
        <div key={i + "-space"}> </div>,
      ];
    });

    if (
      instruction.type === "scopeInstruction" &&
      instruction.fragments[1]?.value === "close"
    ) {
      indent -= 2;
    }

    let indentRendered = Array(indent)
      .fill(0)
      .map(() => <div className="indent"> </div>);

    if (
      instruction.type === "scopeInstruction" &&
      instruction.fragments[1]?.value === "open"
    ) {
      indent += 2;
    }

    let contents: React.ReactElement;

    if (typeof macroSearchString !== "undefined" && instructionIndex === li) {
      const found = macros
        .filter((m) =>
          m.name
            .toLocaleLowerCase()
            .startsWith(macroSearchString.toLocaleLowerCase())
        )
        .map((m) => (
          <>
            <b className="bold-hint">
              {m.name.slice(0, macroSearchString.length)}
            </b>
            {m.name.slice(macroSearchString.length)}
          </>
        ))
        .map((e, i, arr) => (
          <React.Fragment key={i}>
            {e}
            {i < arr.length - 1 ? " | " : null}
          </React.Fragment>
        ));
      contents = (
        <>
          {indentRendered}
          <div className={"empty fragment highlight"}>{found}</div>
        </>
      );
    } else {
      contents = (
        <>
          {indentRendered}
          {fragments}
          {((cursorPos >= instruction.fragments.length &&
            cursorPos < fragmentLength[instruction.type]) ||
            instruction.type === "emptyInstruction") &&
            instructionIndex === li && (
              <div
                className={classnames("empty", "fragment", {
                  highlight:
                    instructionIndex === li &&
                    selectedInstructions.length === 0 &&
                    hasFocus,
                })}
              >
                {selectedInstructions.length === 0 &&
                  fragmentHints[instruction.type][cursorPos]
                    .split(" | ")
                    .concat(isMacro ? ["_"] : [])
                    .map((h) => (
                      <>
                        <b className="bold-hint">{h.slice(0, 1)}</b>
                        {h.slice(1)}
                      </>
                    ))
                    .map((e, i, arr) => (
                      <React.Fragment key={i}>
                        {e}
                        {i < arr.length - 1 ? " | " : null}
                      </React.Fragment>
                    ))}
              </div>
            )}
        </>
      );
    }

    return (
      <div
        className={classnames("line", {
          selected: selectedInstructions.includes(instruction),
          highlight: li === instructionIndex,
        })}
        key={li}
      >
        <div className="lineNumber">{li + 1}</div>
        <div className="instruction">{contents}</div>
      </div>
    );
  });
}

export function Editor({
  instructions,
  macros,
  isMacro,
  hasFocus,
  setMacros,
  setInstructions,
  setActiveRightTab,
  setFocusIndex,
  onCursorUnderflow,
  setInstructionIndex: setParentInstructionIndex,
}: {
  instructions: Instruction[];
  macros: Macro[];
  isMacro: boolean;
  hasFocus: boolean;
  setMacros: (macros: Macro[]) => void;
  setInstructions: (instructions: Instruction[]) => void;
  setActiveRightTab: (rightTab: "build" | "asm" | "macros") => void;
  setFocusIndex: (focusIndex: number) => void;
  onCursorUnderflow?: () => void;
  setInstructionIndex?: (instructionIndex: number) => void;
}) {
  const [cursorPos, setCursorPos] = useState(0);
  const [selectedInstructions, setSelectedInstructions] = useState<
    Instruction[]
  >([]);
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [macroSearchString, setMacroSearchString] = useState<
    string | undefined
  >(undefined);

  const instruction: Instruction | null = instructions[instructionIndex];

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!hasFocus) {
        return;
      }
      if (!e.metaKey) {
        if (e.key.match(/^[ -~]$/) || e.key.match(/Arrow/)) {
          e.preventDefault();
        }
        handleKeyStroke({
          instruction,
          instructions,
          cursorPos,
          instructionIndex,
          selectedInstructions,
          isMacro,
          macros,
          macroSearchString,
          key: e.key,
          shiftKey: e.shiftKey,
          setInstructions,
          setInstructionIndex: (instructionIndex: number) => {
            setInstructionIndex(instructionIndex);
            setParentInstructionIndex &&
              setParentInstructionIndex(instructionIndex);
          },
          setCursorPos,
          setSelectedInstructions,
          setMacros,
          setMacroSearchString,
          setActiveRightTab,
          setFocusIndex,
          onCursorUnderflow,
        });
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [
    instructions,
    setInstructions,
    cursorPos,
    hasFocus,
    instructionIndex,
    instruction,
    selectedInstructions,
    macros,
    setMacros,
    macroSearchString,
    setActiveRightTab,
    setFocusIndex,
    onCursorUnderflow,
    setParentInstructionIndex,
    isMacro,
  ]);

  const instructionsRendered = renderInstructions(
    instructions,
    selectedInstructions,
    instructionIndex,
    cursorPos,
    hasFocus,
    isMacro,
    macros,
    macroSearchString
  );

  return <code className={"code"}>{instructionsRendered}</code>;
}
