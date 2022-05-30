import classNames from "classnames";
import { useState } from "react";
import { ASMTab, downloadFile } from "./asm_tab";
import { InlineDropdown } from "./components/inline_dropdown";
import { DismissMap, DismissProvider } from "./context/dismiss_context";
import { Editor } from "./editor2";
import { ApplicationState, FocusInputType, InsertInstructionType } from "./editor_handler2";
import { examples } from "./examples/examples";
import { standardMacros } from "./macros/macros2";
import { Instruction, parse } from "./parse2";
import { preprocess } from "./preprocess2";

export type File = {
  name: string;
  instructions: Instruction[];
};

export function Application() {
  const [openFiles, setOpenFiles] = useState<File[]>([
    {
      name: "untitled.rvr",
      instructions: [],
    },
  ]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const selectedFile = openFiles[selectedFileIndex];
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [activeRightTab, setActiveRightTab] = useState<"build" | "asm" | "macros">("asm");
  const [applicationState, setApplicationState] = useState<ApplicationState>({
    instructions: selectedFile.instructions,
    editorInstructions: [],
    maxMemory: 0,
    cursorPositions: [0, 0],
    focusInputState: {
      type: FocusInputType.INSERT_INSTRUCTION,
      insertInstructionType: InsertInstructionType.REPLACE,
      text: "",
    },
    macros: standardMacros,
    visibleVariables: [],
    serializedInstructions: [],
    valid: false,
  });
  const [dismissMap] = useState<DismissMap>([]);

  const openFileTabs = openFiles.map((file, index) => (
    <button
      className={classNames("headerButton", {
        active: index === selectedFileIndex,
      })}
      onClick={() => setSelectedFileIndex(index)}
      key={index}
    >
      {file.name}
    </button>
  ));

  const exampleMenuItems = examples.map((e, index) => (
    <div
      className="dropdownItem"
      onClick={() => {
        const instructions = parse({ file: e.file })[0] as Instruction[];
        applicationState.instructions = instructions;
        openFiles.splice(selectedFileIndex + 1, 0, {
          name: e.name.toLocaleLowerCase().replaceAll(" ", "_") + ".rvr",
          instructions,
        });
        setOpenFiles(openFiles.slice());
        setSelectedFileIndex(selectedFileIndex + 1);
      }}
      key={index}
    >
      {e.name}
    </div>
  ));

  const [rerender, setRerender] = useState(0);
  preprocess(applicationState);
  const editor = <Editor applicationState={applicationState} rerender={() => setRerender(rerender + 1)} />;

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
                  instructions: [],
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
                  // todo fix
                  "", //instructionsToText(instructions),
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
                    //setInstructions(parseTextFile(text));
                  }
                }}
              />
            </label>
          </InlineDropdown>
          <InlineDropdown label="Examples" classNames={"menuButton"} dismissOnClick>
            {exampleMenuItems}
          </InlineDropdown>
        </div>
        <div className="editorContainer">
          <div className={classNames("left", { hasFocus: focusIndex === 0 })}>
            <div className="header">{openFileTabs}</div>
            {editor}
          </div>
          <div className="right">
            <div className="header">
              <button
                className={classNames("headerButton", activeRightTab === "build" ? "active" : "")}
                onClick={() => {
                  setActiveRightTab("build");
                }}
              >
                VM
              </button>
              <button
                className={classNames("headerButton", activeRightTab === "asm" ? "active" : "")}
                onClick={() => {
                  setActiveRightTab("asm");
                }}
              >
                Assembly
              </button>
              <button
                className={classNames("headerButton", activeRightTab === "macros" ? "active" : "")}
                onClick={() => {
                  setActiveRightTab("macros");
                }}
              >
                Macros
              </button>
            </div>
            {activeRightTab === "asm" && <ASMTab applicationState={applicationState} />}
          </div>
        </div>
      </div>
    </DismissProvider>
  );
}
