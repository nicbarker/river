import React, { useEffect, useState } from "react";
import "./App.css";
import { parse, execute } from "./parse";
import classnames from "classnames";
import {
  fragmentHints,
  fragmentLength,
  handleKeyStroke,
  Instruction,
} from "./editor";

type Output = { value: string; lineNumber: number };

function App() {
  const [cursorPos, setCursorPos] = useState(0);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { type: "emptyInstruction", fragments: [] },
  ]);
  const [selectedInstructions, setSelectedInstructions] = useState<
    Instruction[]
  >([]);
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [outputs, setOutputs] = useState<Output[]>([]);

  const instruction: Instruction | null = instructions[instructionIndex];

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
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
          key: e.key,
          shiftKey: e.shiftKey,
          setInstructions,
          setInstructionIndex,
          setCursorPos,
          setSelectedInstructions,
        });
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [
    instructions,
    setInstructions,
    cursorPos,
    instructionIndex,
    instruction,
    selectedInstructions,
  ]);

  let indent = 0;
  const instructionsRendered = instructions.map((instruction, li) => {
    const fragments = instruction.fragments.map((fragment, i) => [
      <div
        key={i}
        className={classnames("fragment", fragment?.value, fragment?.type, {
          highlight:
            instructionIndex === li &&
            cursorPos === i &&
            selectedInstructions.length === 0,
        })}
      >
        {fragment?.value}
      </div>,
      <div key={i + "-space"}> </div>,
    ]);

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

    return (
      <div
        className={classnames("line", {
          selected: selectedInstructions.includes(instruction),
          highlight: li === instructionIndex,
        })}
        key={li}
      >
        <div className="lineNumber">{li}</div>
        <div className="instruction">
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
                    selectedInstructions.length === 0,
                })}
              >
                {selectedInstructions.length === 0 &&
                  fragmentHints[instruction.type][cursorPos]
                    .split(" | ")
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
        </div>
      </div>
    );
  });

  if (instructionIndex === instructions.length) {
    let indentRendered = Array(indent)
      .fill(0)
      .map(() => <div className="indent"> </div>);

    instructionsRendered.push(
      <div className="line" key="end">
        <div className="lineNumber">{instructions.length}</div>
        <div className="instruction">
          {indentRendered}
          <div className={"empty highlight"}></div>
        </div>
      </div>
    );
  }

  const outputsRendered = outputs.map((o, index) => (
    <code className="outputLine" key={index}>
      <div className="lineNumber">main:{o.lineNumber}</div>
      {o.value}
    </code>
  ));

  return (
    <div className="App">
      <code className="top">{instructionsRendered}</code>
      <div className="bottom">
        <div className="buttons">
          <button
            onClick={() => {
              outputs.splice(0, outputs.length);
              const instructionsToParse = (instructions.filter(
                (i) => i.type !== "emptyInstruction"
              ) as Instruction[])
                .map((i) => i.fragments.map((f) => f?.value).join(" "))
                .join("\n");
              console.log(instructionsToParse);
              const [pScopes, pInstructions] = parse(instructionsToParse);
              console.log(pScopes, pInstructions);
              const { peakMemory } = execute(
                pScopes,
                pInstructions,
                (output: Output) => {
                  outputs.push(output);
                  setOutputs(outputs.slice());
                }
              );
              outputs.push({
                lineNumber: instructions.length,
                value: `Execution finished. Peak memory usage: ${
                  peakMemory / 8
                } byte${peakMemory / 8 !== 1 ? "s" : ""}.`,
              });
              setOutputs(outputs.slice());
            }}
          >
            Run
          </button>
        </div>
        <div className="outputs">{outputsRendered}</div>
      </div>
    </div>
  );
}

export default App;
