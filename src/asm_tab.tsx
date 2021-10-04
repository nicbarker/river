import classNames from "classnames";
import { useEffect, useState } from "react";
import {
  ASMBlock,
  BackendTarget,
  compile,
  formatASM,
} from "./compiler/compiler";
import { Instruction } from "./editor_handler";
import { instructionsToText, parse } from "./parse";

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

function compileAsm(
  instructions: Instruction[],
  target: BackendTarget,
  fileName: string
) {
  const [, pInstructions, pMaxMemory, jumps] = parse(
    instructionsToText(instructions)
  );
  const compiled = compile(target, fileName, pInstructions, pMaxMemory, jumps);
  return compiled;
}

const targetValues: [BackendTarget, string][] = [
  ["x64_OSX", "Mac OSX (64 bit)"],
  ["x64_win", "Windows (64 bit)"],
];

export function ASMTab(props: {
  instructions: Instruction[];
  instructionIndex: number;
}) {
  const [asm, setAsm] = useState<ASMBlock[]>([]);
  const [targetDropdownVisible, setTargetDropdownVisible] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState<BackendTarget>(
    "x64_OSX"
  );

  useEffect(() => {
    setAsm(compileAsm(props.instructions, targetPlatform, "untitled"));
  }, [props.instructions, targetPlatform]);

  const renderedBlocks = asm.map((block) => {
    const renderedLines = block[1].map((line) => {
      const columns: React.ReactNode[] = [];
      for (let i = 0; i < 3; i++) {
        const column = line[i];
        if (line[0]?.charAt(0) === ";" && i > 0) {
          continue;
        }
        columns.push(
          <code
            className={classNames({
              purple:
                column?.charAt(0) !== ";" &&
                (i === 0 ||
                  column === "section" ||
                  column === ".text" ||
                  column === ".data"),
              red: i === 1 && column?.charAt(0) !== ";",
              blue: i === 2 && column?.charAt(0) !== "_",
            })}
          >
            {(column || "").padEnd(10, " ")}
          </code>
        );
      }
      return <div className={"asmLine"}>{columns}</div>;
    });
    return (
      <div
        className={classNames("asmBlock", {
          highlight: props.instructionIndex === block[0],
        })}
      >
        {renderedLines}
      </div>
    );
  });

  const targets = targetValues.map((platform) => (
    <button
      className={"item"}
      onClick={() => {
        setTargetPlatform(platform[0]);
        setTargetDropdownVisible(false);
      }}
    >
      {platform[1]}
    </button>
  ));

  return (
    <div className="assemblyContainer">
      <div className="header subheader">
        <div className={"dropdownOuter"}>
          <button
            className={classNames({ active: targetDropdownVisible })}
            onClick={() => setTargetDropdownVisible(true)}
          >
            {targetDropdownVisible
              ? "Select Target"
              : `Target: ${
                  targetValues.find((t) => t[0] === targetPlatform)![1]
                }`}
          </button>
          {targetDropdownVisible && (
            <div className={"targetDropdown"}>{targets}</div>
          )}
        </div>
        <div className={"divider"} />
        <button onClick={() => downloadFile(formatASM(asm), "untitled.asm")}>
          Download
        </button>
      </div>
      <div className={"asmInner"}>{renderedBlocks}</div>
    </div>
  );
}
