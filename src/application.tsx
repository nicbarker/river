import React, { useEffect, useState } from "react";
import "./application.css";
import { instructionsToText, parse, parseTextFile } from "./parse";
import { execute } from "./vm";
import classnames from "classnames";
import { Editor } from "./editor";
import { Instruction, Macro } from "./editor_handler";
import { MacroEditor } from "./macro_editor";
import { ASMTab, downloadFile } from "./asm_tab";
import { standardMacros } from "./standard_macros";
import { InlineDropdown } from "./components/inline_dropdown";
import { DismissMap, DismissProvider } from "./context/dismiss_context";
import classNames from "classnames";
import { examples } from "./examples/examples";

export type Output = { value: string; lineNumber: number };

export type File = {
  name: string;
  instructions: Instruction[];
};

export function App() {
  const [macros, setMacros] = useState<Macro[]>(standardMacros);
  const [openFiles, setOpenFiles] = useState<File[]>([
    {
      name: "untitled.rvr",
      instructions: [{ type: "emptyInstruction", fragments: [undefined] }],
    },
  ]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const selectedFile = openFiles[selectedFileIndex];
  const instructions = openFiles[selectedFileIndex].instructions;
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [activeRightTab, setActiveRightTab] = useState<
    "build" | "asm" | "macros"
  >("asm");
  const [instructionRange, setInstructionRange] = useState<[number, number]>([
    0,
    0,
  ]);
  const [macrosExpanded, setMacrosExpanded] = useState(false);
  const [dismissMap] = useState<DismissMap>([]);

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
      if (e.key === "Escape") {
        if (dismissMap.length > 0) {
          for (const func of dismissMap) {
            func();
          }
        } else {
          setMacrosExpanded(!macrosExpanded);
        }
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  });

  function setInstructions(instructions: Instruction[]) {
    selectedFile.instructions = instructions;
    setOpenFiles(openFiles.slice());
  }

  const editor = (
    <Editor
      hasFocus={focusIndex === 0}
      macros={macros}
      setMacros={setMacros}
      instructions={instructions}
      macrosExpanded={macrosExpanded}
      setInstructions={setInstructions}
      setActiveRightTab={setActiveRightTab}
      setFocusIndex={setFocusIndex}
      setInstructionRange={setInstructionRange}
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

  const openFileTabs = openFiles.map((file, index) => (
    <button
      className={classnames("headerButton", {
        active: index === selectedFileIndex,
      })}
      onClick={() => setSelectedFileIndex(index)}
    >
      {file.name}
    </button>
  ));

  const exampleMenuItems = examples.map((e) => (
    <div
      className="dropdownItem"
      onClick={() => {
        openFiles.splice(selectedFileIndex + 1, 0, {
          name: e.name.toLocaleLowerCase().replaceAll(" ", "_") + ".rvr",
          instructions: parseTextFile(e.file),
        });
        setOpenFiles(openFiles.slice());
        setSelectedFileIndex(selectedFileIndex + 1);
      }}
    >
      {e.name}
    </div>
  ));

  return (
    <DismissProvider value={dismissMap}>
      <div
        className="App"
        onClick={() => {
          for (const func of dismissMap) {
            func();
          }
        }}
      >
        <div className="topBar">
          <InlineDropdown label="File" classNames={"menuButton"} dismissOnClick>
            <div
              className="dropdownItem"
              onClick={() => {
                openFiles.splice(selectedFileIndex, 0, {
                  name: "untitled.rvr",
                  instructions: [
                    { type: "emptyInstruction", fragments: [undefined] },
                  ],
                });
                setOpenFiles(openFiles.slice());
                setSelectedFileIndex(selectedFileIndex + 1);
              }}
            >
              New File
            </div>
            <div
              className="dropdownItem"
              onClick={() =>
                downloadFile(
                  instructionsToText(instructions),
                  selectedFile.name,
                  ".rvr"
                )
              }
            >
              Save To Disk...
            </div>
            <label className="dropdownItem">
              Open File...
              <input
                type="file"
                accept=".rvr,.rvrm,.rvrt"
                onChange={async (e) => {
                  if (e.target.files) {
                    const text = await e.target.files[0].text();
                    setInstructions(parseTextFile(text));
                  }
                }}
              />
            </label>
          </InlineDropdown>
          <InlineDropdown
            label="Examples"
            classNames={"menuButton"}
            dismissOnClick
          >
            {exampleMenuItems}
          </InlineDropdown>
        </div>
        <div className="editorContainer">
          <div className={classnames("left", { hasFocus: focusIndex === 0 })}>
            <div className="header">{openFileTabs}</div>
            {editor}
          </div>
          <div className="right">
            <div className="header">
              <button
                className={classNames(
                  "headerButton",
                  activeRightTab === "build" ? "active" : ""
                )}
                onClick={() => {
                  setActiveRightTab("build");
                }}
              >
                VM
              </button>
              <button
                className={classNames(
                  "headerButton",
                  activeRightTab === "asm" ? "active" : ""
                )}
                onClick={() => {
                  setActiveRightTab("asm");
                }}
              >
                Assembly
              </button>
              <button
                className={classNames(
                  "headerButton",
                  activeRightTab === "macros" ? "active" : ""
                )}
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
                  <button
                    className="subheaderButton"
                    onClick={() => runInInterpreter()}
                  >
                    Run
                  </button>
                </div>
                <div className="outputs">{outputsRendered}</div>
              </div>
            )}
            {activeRightTab === "asm" && (
              <ASMTab
                instructions={instructions}
                instructionRange={instructionRange}
              />
            )}
            {activeRightTab === "macros" && (
              <div className="macros">
                <div className="header subheader">
                  <button
                    className="subheaderButton"
                    onClick={() => {
                      macros.push({
                        name: "New Macro",
                        instructions: [
                          {
                            type: "emptyInstruction",
                            fragments: [undefined],
                          },
                        ],
                        inline: false,
                      });
                      setMacros(macros.slice());
                    }}
                  >
                    New Macro
                  </button>
                </div>
                {macrosRendered}
              </div>
            )}
          </div>
        </div>
      </div>
    </DismissProvider>
  );
}
