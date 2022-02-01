import classnames from "classnames";
import React from "react";
import { useState, useEffect } from "react";
import {
  CollapsedInstruction,
  getFragmentHints,
  handleKeyStroke,
  Instruction,
  Macro,
} from "./editor_handler";
import { preProcess } from "./preprocess";

export type VisibleVariable = { index: number; name: string; visible: boolean };
function renderFragments(
  instruction: CollapsedInstruction,
  hasCursor: boolean,
  hasFocus: boolean,
  isMacro: boolean,
  cursorPositions: number[],
  visibleVariables: VisibleVariable[],
  selectionRange: [number, number],
  macros: Macro[],
  variableSearchString?: string,
  macroSearchString?: string,
  inlineMacro?: boolean
) {
  const cursorPos = cursorPositions.length > 1 ? -1 : cursorPositions[0];
  return instruction.fragments.map((fragment, i) => {
    let fragmentContent: React.ReactNode;
    if (
      typeof variableSearchString !== "undefined" &&
      fragment?.type === "varType" &&
      hasCursor &&
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
    } else if (
      typeof macroSearchString !== "undefined" &&
      hasCursor &&
      cursorPos === i
    ) {
      const found = macros
        .filter(
          (m) =>
            m.inline &&
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
      fragmentContent = (
        <div className={classnames("empty", "fragment")}>{found}</div>
      );
    } else if (fragment?.type === "varType") {
      switch (fragment?.value) {
        case "_": {
          fragmentContent = "_" + fragment.name;
          break;
        }
        case "missing": {
          fragmentContent = "_var";
          break;
        }
        case "var":
          if (typeof fragment.stackPosition !== "undefined") {
            if (
              instruction.inlineMacros.find(
                (m) => m && m.stackPosition === fragment.stackPosition
              )
            ) {
              fragmentContent = (
                <div className="fragment">
                  {renderFragments(
                    instruction.inlineMacros[i].instruction,
                    hasCursor,
                    hasFocus,
                    isMacro,
                    cursorPositions[0] === i ? cursorPositions.slice(1) : [],
                    visibleVariables,
                    selectionRange,
                    macros,
                    variableSearchString,
                    macroSearchString,
                    true
                  )}
                </div>
              );
            } else {
              fragmentContent = visibleVariables[fragment.stackPosition].name;
            }
          }
          break;
        case "const":
          fragmentContent = `const ${typeof fragment.constValue === "undefined"
              ? "0.. value"
              : fragment.constValue
            }`;
          break;
      }
    } else if (fragment?.type === "assignAction") {
      switch (fragment?.value) {
        case "_": {
          fragmentContent = "_" + fragment.name;
          break;
        }
        case "missing": {
          fragmentContent = "_operator";
          break;
        }
        default:
          fragmentContent = fragment.value;
          break;
      }
    } else if (fragment?.type === "comparator") {
      switch (fragment?.value) {
        case "_": {
          fragmentContent = "_" + fragment.name;
          break;
        }
        case "missing": {
          fragmentContent = "_comparator";
          break;
        }
        default:
          fragmentContent = fragment.value;
          break;
      }
    } else if (fragment?.type === "instruction" && fragment.value === "_") {
      fragmentContent = "_block";
    } else if (fragment) {
      fragmentContent = fragment.value;
    } else if (cursorPos === i && hasCursor) {
      fragmentContent = (
        <div className={classnames("empty", "fragment")}>
          {selectionRange[0] === -1 &&
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
        className={classnames("fragment", fragment?.type, {
          [fragment?.value || ""]: fragment?.type !== "defName",
          highlight:
            hasCursor &&
            cursorPos === i &&
            selectionRange[0] === -1 &&
            hasFocus,
          placeholder: fragment?.value === "_",
        })}
      >
        {instruction.type === "macroInstruction" && !inlineMacro && i > 0 && (
          <div className="macro-param-label">
            {instruction.placeholders[i - 1] + ": "}
          </div>
        )}
        {fragmentContent}
      </div>,
      instruction.type === "macroInstruction" && i === 0 && (
        <div className="macro-paren open">
          {instruction.fragments.length > 1 && !inlineMacro && " "}(
        </div>
      ),
      instruction.type === "macroInstruction" &&
      i === instruction.fragments.length - 1 && (
        <div className="macro-paren close">)</div>
      ),
      ((i > 0 && i < instruction.fragments.length - 1) ||
        instruction.type !== "macroInstruction") && (
        <div key={i + "-space"}> </div>
      ),
    ];
  });
}

function renderInstructions(
  instructions: CollapsedInstruction[],
  selectionRange: [number, number],
  instructionIndex: number,
  cursorPositions: number[],
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
    const previousInstruction = li > 0 ? instructions[li - 1] : undefined;
    const instruction = instructions[li];
    const fragments = renderFragments(
      instruction,
      li === instructionIndex,
      hasFocus,
      isMacro,
      cursorPositions,
      visibleVariables,
      selectionRange,
      macros,
      variableSearchString,
      macroSearchString
    );

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

    if (
      blockRanges.find((br) => br[0] <= instruction.lineNumber) &&
      (!previousInstruction ||
        blockRanges.find((br) => br[0] > previousInstruction.lineNumber))
    ) {
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

    // [index, brace]
    let postLine: [React.ReactNode, React.ReactNode][] = [];
    if (blockRanges.find((br) => br[1] - 1 === instruction.lineNumber)) {
      indent -= 2;
      const braceIndent = Array(Math.max(indent, 0))
        .fill(0)
        .map(() => <div className="indent"> </div>);
      postLine.push([braceIndent, <div>{"}"}</div>]);
    }

    if (
      blockRanges.find(
        (br) =>
          li < instructions.length - 1 &&
          br[1] - 1 > instruction.lineNumber &&
          br[1] - 1 < instructions[li + 1].lineNumber
      )
    ) {
      indent -= 2;
      const braceIndent = Array(Math.max(indent, 0))
        .fill(0)
        .map(() => <div className="indent"> </div>);
      postLine.push([braceIndent, <div>{"}"}</div>]);
    }

    let contents: React.ReactElement;

    if (
      typeof macroSearchString !== "undefined" &&
      instructionIndex === li &&
      cursorPositions[cursorPositions.length - 1] === 0
    ) {
      const found = macros
        .filter(
          (m) =>
            !m.inline &&
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
          selected:
            (li >= selectionRange[0] && li <= selectionRange[1]) ||
            (li >= selectionRange[1] && li <= selectionRange[0]),
          highlight: li === instructionIndex,
        })}
        key={li}
      >
        <div className="lineNumber">{instruction.lineNumber + 1}</div>
        <div className="instruction">{contents}</div>
      </div>,
      postLine.map((l) => (
        <div className="macro-block-braces">
          {l[0]}
          {l[1]}
        </div>
      )),
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
  setInstructionRange,
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
  setInstructionRange?: (range: [number, number]) => void;
}) {
  const isMacro = !!sourceMacro;
  const [cursorPositions, setCursorPositions] = useState([0]);
  const [selectionRange, setSelectionRange] = useState<[number, number]>([
    -1,
    -1,
  ]);
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

  useEffect(() => {
    if (setInstructionRange) {
      let min = instruction.lineNumber;
      let max = instruction.lineNumber + 1;
      if (instruction.type === "macroInstruction") {
        min = Math.min(min, instruction.lineNumber);
        max = Math.max(max, instruction.endLineNumber);
      }
      let toInspect = instruction.inlineMacros.filter((m) => !!m);
      for (let i = 0; i < toInspect.length; i++) {
        const inlineMacro = toInspect[i];
        min = Math.min(min, inlineMacro.instruction.lineNumber);
        max = Math.max(max, inlineMacro.instruction.endLineNumber);
        toInspect.splice(i, 1);
        i--;
        for (const inline of inlineMacro.instruction.inlineMacros) {
          if (inline) {
            toInspect.push(inline);
          }
        }
      }
      setInstructionRange([min, max]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructions, instructions.length, instructionIndex]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const visibleVariables: VisibleVariable[] = [];
  // Gather up visible variables from scope
  for (let i = 0; i < instructions.length; i++) {
    const inst = instructions[i];
    if (inst.type === "defInstruction") {
      const name = inst.fragments[1];
      visibleVariables.push({
        name: name?.value || "",
        index: visibleVariables.length,
        visible: i < instruction.lineNumber,
      });
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
          cursorPositions,
          instructionIndex: fixedInstructionIndex,
          selectionRange,
          isMacro,
          macros,
          macroSearchString,
          variableSearchString,
          visibleVariables,
          key: e.key,
          shiftKey: e.shiftKey,
          setInstructions,
          setInstructionIndex,
          setCursorPositions,
          setSelectionRange,
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
    hasFocus,
    instructionIndex,
    instruction,
    selectionRange,
    macros,
    setMacros,
    macroSearchString,
    setActiveRightTab,
    setFocusIndex,
    onCursorUnderflow,
    isMacro,
    collapsedInstructions,
    fixedInstructionIndex,
    visibleVariables,
    variableSearchString,
    cursorPositions,
  ]);

  const instructionsRendered = renderInstructions(
    collapsedInstructions,
    selectionRange,
    instructionIndex,
    cursorPositions,
    hasFocus,
    isMacro,
    macros,
    macroSearchString,
    visibleVariables,
    variableSearchString
  );

  return <code className={"code"}>{instructionsRendered}</code>;
}
