import React, { useEffect, useState } from "react";
import "./App.css";
import { parse } from "./parse";
import { execute } from "./vm";
import classnames from "classnames";
import {
  fragmentHints,
  fragmentLength,
  handleKeyStroke,
  Instruction,
  Macro,
} from "./editor";
import { compile } from "./compile";

type Output = { value: string; lineNumber: number };

function downloadFile(data: string, fileName: string, type = "text/plain") {
  // Create an invisible A element
  const a = document.createElement("a");
  a.style.display = "none";
  document.body.appendChild(a);

  // Set the HREF to a Blob representation of the data to be downloaded
  a.href = window.URL.createObjectURL(new Blob([data], { type }));

  // Use download attribute to set set desired file name
  a.setAttribute("download", fileName);

  // Trigger the download by simulating click
  a.click();

  // Cleanup
  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

function compileAsm(instructions: Instruction[]) {
  const instructionsToParse = (instructions.filter(
    (i) => i.type !== "emptyInstruction" && i.valid
  ) as Instruction[])
    .map((i) => i.fragments.map((f) => f?.value).join(" "))
    .join("\n");
  const [pScopes, pInstructions, pMaxMemory, jumps] = parse(
    instructionsToParse
  );
  const compiled = compile(pScopes, pInstructions, pMaxMemory, jumps);
  return compiled;
}

function App() {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { type: "emptyInstruction", fragments: [] },
  ]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [activeRightTab, setActiveRightTab] = useState<
    "build" | "asm" | "macros"
  >("build");
  const [asm, setAsm] = useState("");

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

  useEffect(() => {
    setAsm(compileAsm(instructions));
  }, [instructions]);

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
    />
  );

  const macrosRendered = macros.map((macro, i) => (
    <div
      className={classnames("macroOuter", { hasFocus: focusIndex === i + 1 })}
    >
      <div className={"macroTitle"}>{macro.name}</div>
      <Editor
        hasFocus={focusIndex === i + 1}
        isMacro={true}
        macros={macros}
        setMacros={setMacros}
        instructions={macro.instructions}
        setInstructions={(instructions: Instruction[]) => {
          macro.instructions = instructions;
          setMacros(macros.slice());
        }}
        setActiveRightTab={setActiveRightTab}
        setFocusIndex={setFocusIndex}
      />
    </div>
  ));

  const outputsRendered = outputs.map((o, index) => (
    <code className="outputLine" key={index}>
      <div className="lineNumber">main:{o.lineNumber}</div>
      {o.value}
    </code>
  ));

  // function runInInterpreter() {
  //   outputs.splice(0, outputs.length);
  //   const instructionsToParse = (instructions.filter(
  //     (i) => i.type !== "emptyInstruction"
  //   ) as Instruction[])
  //     .map((i) => i.fragments.map((f) => f?.value).join(" "))
  //     .join("\n");
  //   const [pScopes, pInstructions] = parse(instructionsToParse);
  //   const { peakMemory } = execute(pScopes, pInstructions, (output: Output) => {
  //     outputs.push(output);
  //     setOutputs(outputs.slice());
  //   });
  //   outputs.push({
  //     lineNumber: instructions.length,
  //     value: `Execution finished. Peak memory usage: ${peakMemory / 8} byte${
  //       peakMemory / 8 !== 1 ? "s" : ""
  //     }.`,
  //   });
  //   setOutputs(outputs.slice());
  // }

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
            Run
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
          <div className="outputs">{outputsRendered}</div>
        )}
        {activeRightTab === "asm" && (
          <div className="assemblyContainer">
            <div className="header subheader">
              <button onClick={() => downloadFile(asm, "untitled.asm")}>
                Download
              </button>
            </div>
            <textarea readOnly className="asm" value={asm} />
          </div>
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

function renderInstructions(
  instructions: Instruction[],
  selectedInstructions: Instruction[],
  instructionIndex: number,
  cursorPos: number,
  hasFocus: boolean,
  macros: Macro[],
  macroSearchString: string | undefined
) {
  let indent = 0;
  return instructions.map((instruction, li) => {
    const fragments = instruction.fragments.map((fragment, i) => [
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

function Editor({
  instructions,
  macros,
  isMacro,
  hasFocus,
  setMacros,
  setInstructions,
  setActiveRightTab,
  setFocusIndex,
}: {
  instructions: Instruction[];
  macros: Macro[];
  isMacro: boolean;
  hasFocus: boolean;
  setMacros: (macros: Macro[]) => void;
  setInstructions: (instructions: Instruction[]) => void;
  setActiveRightTab: (rightTab: "build" | "asm" | "macros") => void;
  setFocusIndex: (focusIndex: number) => void;
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
          macros,
          macroSearchString,
          key: e.key,
          shiftKey: e.shiftKey,
          setInstructions,
          setInstructionIndex,
          setCursorPos,
          setSelectedInstructions,
          setMacros,
          setMacroSearchString,
          setActiveRightTab,
          setFocusIndex,
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
  ]);

  const instructionsRendered = renderInstructions(
    instructions,
    selectedInstructions,
    instructionIndex,
    cursorPos,
    hasFocus,
    macros,
    macroSearchString
  );

  return <code className={"code"}>{instructionsRendered}</code>;
}

export default App;
