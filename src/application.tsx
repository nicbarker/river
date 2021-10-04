import React, { useEffect, useState } from "react";
import "./application.css";
import { instructionsToText, parse } from "./parse";
import { execute } from "./vm";
import classnames from "classnames";
import { Editor } from "./editor";
import { Instruction, Macro } from "./editor_handler";
import { MacroEditor } from "./macro_editor";
import { ASMTab } from "./asm_tab";
import { standardMacros } from "./standard_macros";

export type Output = { value: string; lineNumber: number };

export function App() {
  const [macros, setMacros] = useState<Macro[]>(standardMacros);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { type: "emptyInstruction", fragments: [] },
  ]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [activeRightTab, setActiveRightTab] = useState<
    "build" | "asm" | "macros"
  >("build");
  const [instructionIndex, setInstructionIndex] = useState(0);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Tab" && activeRightTab === "macros") {
        if (e.shiftKey) {
          if (focusIndex > 0) {
            setFocusIndex(focusIndex - 1);
          } else {
            setFocusIndex(macros.length - 1);
          }
        } else {
          if (focusIndex < macros.length) {
            setFocusIndex(focusIndex + 1);
          } else {
            setFocusIndex(0);
          }
        }
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  });

  const editor = (
    <Editor
      hasFocus={focusIndex === 0}
      isMacro={false}
      macros={macros}
      setMacros={setMacros}
      instructions={instructions}
      setInstructions={setInstructions}
      setActiveRightTab={setActiveRightTab}
      setFocusIndex={setFocusIndex}
      setInstructionIndex={setInstructionIndex}
    />
  );

  const macrosRendered = macros.map((macro, i) => (
    <MacroEditor
      key={i}
      macro={macro}
      macros={macros}
      hasFocus={focusIndex === i + 1}
      focusIndex={focusIndex}
      setMacros={setMacros}
      setActiveRightTab={setActiveRightTab}
      setFocusIndex={setFocusIndex}
    />
  ));

  const outputsRendered = outputs.map((o, index) => (
    <code className="outputLine" key={index}>
      <div className="lineNumber">main:{o.lineNumber}</div>
      {o.value}
    </code>
  ));

  function runInInterpreter() {
    outputs.splice(0, outputs.length);
    const [pScopes, pInstructions] = parse(instructionsToText(instructions));
    const { peakMemory } = execute(pScopes, pInstructions, (output: Output) => {
      outputs.push(output);
      setOutputs(outputs.slice());
    });
    outputs.push({
      lineNumber: instructions.length,
      value: `Execution finished. Peak memory usage: ${peakMemory / 8} byte${
        peakMemory / 8 !== 1 ? "s" : ""
      }.`,
    });
    setOutputs(outputs.slice());
  }

  return (
    <div className="App">
      <div className={classnames("left", { hasFocus: focusIndex === 0 })}>
        <div className="header">
          <button className="active">untitled.rvr</button>
        </div>
        {editor}
      </div>
      <div className="right">
        <div className="header">
          <button
            className={activeRightTab === "build" ? "active" : ""}
            onClick={() => {
              setActiveRightTab("build");
            }}
          >
            VM
          </button>
          <button
            className={activeRightTab === "asm" ? "active" : ""}
            onClick={() => {
              setActiveRightTab("asm");
            }}
          >
            Assembly
          </button>
          <button
            className={activeRightTab === "macros" ? "active" : ""}
            onClick={() => {
              setActiveRightTab("macros");
            }}
          >
            Macros
          </button>
        </div>
        {activeRightTab === "build" && (
          <div className="buildContainer">
            <div className="header subheader">
              <button onClick={() => runInInterpreter()}>Run</button>
            </div>
            <div className="outputs">{outputsRendered}</div>
          </div>
        )}
        {activeRightTab === "asm" && (
          <ASMTab
            instructions={instructions}
            instructionIndex={instructionIndex}
          />
        )}
        {activeRightTab === "macros" && (
          <div className="macros">
            <div className="header subheader">
              <button>New Macro</button>
            </div>
            {macrosRendered}
          </div>
        )}
      </div>
    </div>
  );
}
