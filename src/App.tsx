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
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [outputs, setOutputs] = useState<Output[]>([]);

  const instruction: Instruction | null = instructions[instructionIndex];

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      e.preventDefault();
      handleKeyStroke({
        instruction,
        instructions,
        cursorPos,
        instructionIndex,
        key: e.key,
        shiftKey: e.shiftKey,
        setInstructions,
        setInstructionIndex,
        setCursorPos,
      });
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [instructions, setInstructions, cursorPos, instructionIndex, instruction]);

  let indent = 0;
  const instructionsRendered = instructions.map((instruction, li) => {
    const fragments = instruction.fragments.map((c, i) => [
      <div
        key={i}
        className={classnames({
          highlight: instructionIndex === li && cursorPos === i,
        })}
      >
        {c?.value}
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
      <div className="line" key={li}>
        <div className="lineNumber">{li}</div>
        <div className="instruction">
          {indentRendered}
          {fragments}
          {((cursorPos >= instruction.fragments.length &&
            cursorPos < fragmentLength[instruction.type]) ||
            instruction.type === "emptyInstruction") &&
            instructionIndex === li && (
              <div
                className={classnames("empty", {
                  highlight: instructionIndex === li,
                })}
              >
                {fragmentHints[instruction.type][cursorPos]
                  .split(" | ")
                  .map((h) => (
                    <>
                      <b className="bold-hint">{h.slice(0, 1)}</b>
                      {h.slice(1)}
                    </>
                  ))
                  .map((e, i, arr) => (
                    <>
                      {e}
                      {i < arr.length - 1 ? " | " : null}
                    </>
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
      <div className="line">
        <div className="lineNumber">{instructions.length}</div>
        <div className="instruction">
          {indentRendered}
          <div className={"empty highlight"}></div>
        </div>
      </div>
    );
  }

  const outputsRendered = outputs.map((o) => (
    <code className="outputLine">
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
              const [pScopes, pInstructions] = parse(
                (instructions.filter(
                  (i) => i.type !== "emptyInstruction"
                ) as Instruction[])
                  .map((i) => i.fragments.map((f) => f?.value).join(" "))
                  .join("\n")
              );
              console.log(pScopes, pInstructions);
              execute(pScopes, pInstructions, (output: Output) => {
                outputs.push(output);
                setOutputs(outputs.slice());
              });
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
