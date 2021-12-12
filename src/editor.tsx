import classnames from "classnames";
import React from "react";
import { useState, useEffect } from "react";
import {
  CollapsedInstruction,
  Fragment,
  getFragmentHints,
  fragmentPlaceholderMessage,
  handleKeyStroke,
  Instruction,
  Macro,
} from "./editor_handler";
import { preProcess } from "./preprocess";

export type VisibleVariable = { index: number; name: string; visible: boolean };

function isPlaceholderInstruction(fragment?: Fragment) {
  if (!fragment) {
    return false;
  }
  switch (fragment.type) {
    case "instruction":
      return fragment.value === "_";
    case "assignAction":
      return fragment.value === "_";
    case "varType":
      return fragment.value === "_";
    case "comparator":
      return fragment.value === "_";
    case "instructionNumber":
      return fragment.value === "_";
    default:
      return false;
  }
}

function useRenderInstructions(
  instructions: CollapsedInstruction[],
  selectedInstructions: CollapsedInstruction[],
  instructionIndex: number,
  cursorPos: number,
  hasFocus: boolean,
  isMacro: boolean,
  macros: Macro[],
  macroSearchString: string | undefined,
  visibleVariables: VisibleVariable[],
  variableSearchString: string | undefined
) {
  let indent = 0;
  let instructionsRendered: React.ReactNode[] = [];
  let blockRanges: [number, number][] = [];
  for (let li = 0; li < instructions.length; li++) {
    const instruction = instructions[li];
    const fragments = instruction.fragments.map((fragment, i) => {
      let fragmentContent: React.ReactNode;
      const isPlaceholder = isPlaceholderInstruction(fragment);
      if (isPlaceholder) {
        fragmentContent = fragmentPlaceholderMessage[fragment!.type];
      } else if (
        typeof variableSearchString !== "undefined" &&
        fragment?.type === "varType" &&
        instructionIndex === li &&
        cursorPos === i
      ) {
        const found = visibleVariables
          .filter((m) =>
            m.name
              .toLocaleLowerCase()
              .startsWith(variableSearchString.toLocaleLowerCase())
          )
          .map((m) => (
            <>
              <b className="bold-hint">
                {m.name.slice(0, variableSearchString.length)}
              </b>
              {m.name.slice(variableSearchString.length)}
            </>
          ))
          .map((e, i, arr) => (
            <React.Fragment key={i}>
              {e}
              {i < arr.length - 1 ? " | " : null}
            </React.Fragment>
          ));
        fragmentContent = (
          <div className={classnames("empty", "fragment")}>{found}</div>
        );
      } else if (fragment?.type === "varType") {
        switch (fragment?.value) {
          case "_":
            fragmentContent = "_";
            break;
          case "var":
            if (typeof fragment.stackPosition !== "undefined") {
              fragmentContent = visibleVariables[fragment.stackPosition].name;
            }
            break;
          case "const":
            fragmentContent = `const ${
              typeof fragment.constValue === "undefined"
                ? "0.. value"
                : fragment.constValue
            }`;
            break;
        }
      } else if (fragment) {
        fragmentContent = fragment.value;
      } else if (cursorPos === i && instructionIndex === li) {
        fragmentContent = (
          <div className={classnames("empty", "fragment")}>
            {selectedInstructions.length === 0 &&
              getFragmentHints(instruction)
                [cursorPos].split(" | ")
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
        );
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
            placeholder: isPlaceholderInstruction(fragment),
          })}
        >
          {instruction.type === "macroInstruction" && i > 0 && (
            <div className="macro-param-label">
              {instruction.macro.placeholders[i - 1] + ": "}
            </div>
          )}
          {fragmentContent}
        </div>,
        <div key={i + "-space"}> </div>,
      ];
    });

    if (instruction.type === "macroInstruction") {
      blockRanges = blockRanges.concat(instruction.blockRanges);
    }

    let preLine: React.ReactNode = null;

    if (
      instruction.type === "scopeInstruction" &&
      instruction.fragments[1]?.value === "close"
    ) {
      indent -= 2;
    }

    if (blockRanges.find((br) => br[0] === instruction.lineNumber)) {
      indent += 2;
      preLine = <div>{"{"}</div>;
    }

    let indentRendered = Array(Math.max(indent, 0))
      .fill(0)
      .map(() => <div className="indent"> </div>);

    let braceIndentRendered = Array(Math.max(indent - 2, 0))
      .fill(0)
      .map(() => <div className="indent"> </div>);

    if (
      instruction.type === "scopeInstruction" &&
      instruction.fragments[1]?.value === "open"
    ) {
      indent += 2;
    }

    let postLine: React.ReactNode = null;
    if (blockRanges.find((br) => br[1] - 1 === instruction.lineNumber)) {
      postLine = <div>{"}"}</div>;
      indent -= 2;
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
        </>
      );
    }

    instructionsRendered.push([
      preLine && (
        <div className="macro-block-braces">
          {braceIndentRendered}
          {preLine}
        </div>
      ),
      <div
        className={classnames("line", {
          selected: selectedInstructions.includes(instruction),
          highlight: li === instructionIndex,
        })}
        key={li}
      >
        <div className="lineNumber">{instruction.lineNumber + 1}</div>
        <div className="instruction">{contents}</div>
      </div>,
      postLine && (
        <div className="macro-block-braces">
          {braceIndentRendered}
          {postLine}
        </div>
      ),
    ]);
  }
  return instructionsRendered;
}

export function Editor({
  instructions,
  macros,
  sourceMacro,
  hasFocus,
  macrosExpanded,
  setMacros,
  setInstructions,
  setActiveRightTab,
  setFocusIndex,
  onCursorUnderflow,
  setInstructionIndex: setParentInstructionIndex,
}: {
  instructions: Instruction[];
  macros: Macro[];
  sourceMacro?: Macro;
  hasFocus: boolean;
  macrosExpanded: boolean;
  setMacros: (macros: Macro[]) => void;
  setInstructions: (instructions: Instruction[]) => void;
  setActiveRightTab: (rightTab: "build" | "asm" | "macros") => void;
  setFocusIndex: (focusIndex: number) => void;
  onCursorUnderflow?: () => void;
  setInstructionIndex?: (instructionIndex: number) => void;
}) {
  const isMacro = !!sourceMacro;
  const [cursorPos, setCursorPos] = useState(0);
  const [selectedInstructions, setSelectedInstructions] = useState<
    CollapsedInstruction[]
  >([]);
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [macroSearchString, setMacroSearchString] = useState<
    string | undefined
  >(undefined);
  const [variableSearchString, setVariableSearchString] = useState<
    string | undefined
  >(undefined);
  const collapsedInstructions = preProcess(
    instructions,
    macros,
    sourceMacro,
    macrosExpanded
  );

  const fixedInstructionIndex = Math.min(
    instructionIndex,
    collapsedInstructions.length - 1
  );
  const instruction = collapsedInstructions[fixedInstructionIndex];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const visibleVariables: VisibleVariable[] = [];
  // Gather up visible variables from scope
  for (let i = 0; i < instructions.length; i++) {
    const inst = instructions[i];
    if (inst.type === "defInstruction") {
      const name = inst.fragments[1];
      if (name) {
        visibleVariables.push({
          name: name.value,
          index: visibleVariables.length,
          visible: i < instruction.lineNumber,
        });
      }
    }
  }

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
          collapsedInstructions,
          cursorPos,
          instructionIndex: fixedInstructionIndex,
          selectedInstructions,
          isMacro,
          macros,
          macroSearchString,
          variableSearchString,
          visibleVariables,
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
          setVariableSearchString,
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
    collapsedInstructions,
    fixedInstructionIndex,
    visibleVariables,
    variableSearchString,
  ]);

  const instructionsRendered = useRenderInstructions(
    collapsedInstructions,
    selectedInstructions,
    instructionIndex,
    cursorPos,
    hasFocus,
    isMacro,
    macros,
    macroSearchString,
    visibleVariables,
    variableSearchString
  );

  return <code className={"code"}>{instructionsRendered}</code>;
}
