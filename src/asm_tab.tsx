import classNames from "classnames";
import { useEffect, useState } from "react";
import {
  ASMBlock,
  BackendTarget,
  compile,
  formatASM,
  formatWASM,
} from "./compiler/compiler";
import { InlineDropdown } from "./components/inline_dropdown";
import { Instruction } from "./editor_handler";
import { instructionsToText, parse } from "./parse";
import { validate } from "./validate";

export function downloadFile(
  data: string,
  fileName: string,
  type = "text/plain"
) {
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
  const [, pInstructions, pMaxMemory] = parse(
    instructionsToText(instructions),
    target === "wasm" ? 32 : 8
  );
  const compiled = compile(target, fileName, pInstructions, pMaxMemory);
  return compiled;
}

const targetValues: [BackendTarget, string][] = [
  ["x64_OSX", "Mac OSX (x64)"],
  ["x64_win", "Windows (x64)"],
  ["wasm", "WebAssembly"],
];

function renderX64(props: {
  asm: ASMBlock[];
  instructionRange: [number, number];
}) {
  return props.asm.map((block, bi) => {
    const renderedLines = block[1].map((line, li) => {
      const columns: React.ReactNode[] = [];
      for (let i = 0; i < line.length || i < 3; i++) {
        const column = line[i];
        if (line[0]?.charAt(0) === ";" && i > 0) {
          continue;
        }
        columns.push(
          <code
            key={i}
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
      return (
        <div key={li} className={"asmLine"}>
          {columns}
        </div>
      );
    });
    return (
      <div
        key={bi}
        className={classNames("asmBlock", {
          highlight:
            props.instructionRange[0] <= block[0] &&
            props.instructionRange[1] > block[0],
        })}
      >
        {renderedLines}
      </div>
    );
  });
}

function renderWasm(props: {
  asm: ASMBlock[];
  instructionRange: [number, number];
}) {
  return props.asm.map((block, bi) => {
    const renderedLines = block[1].map((line, li) => {
      const columns: React.ReactNode[] = [];
      for (let i = 0; i < line.length || i < 3; i++) {
        const column = line[i];
        if (line[0]?.charAt(0) === ";" && i > 0) {
          continue;
        }
        columns.push(
          <code
            key={i}
            className={classNames({
              purple:
                column?.startsWith("block") ||
                column?.startsWith("loop") ||
                column?.startsWith("end") ||
                column?.startsWith("if"),
              grey: column?.startsWith(";;"),
              red: i === 1 && column?.charAt(0) !== ";",
              blue: i === 2 && column?.charAt(0) !== "_",
            })}
          >
            {(column || "").padEnd(2, " ")}
          </code>
        );
      }
      return (
        <div key={li} className={"asmLine"}>
          {columns}
        </div>
      );
    });
    return (
      <div
        key={bi}
        className={classNames("asmBlock", {
          highlight:
            props.instructionRange[0] <= block[0] &&
            props.instructionRange[1] > block[0],
        })}
      >
        {renderedLines}
      </div>
    );
  });
}

export function ASMTab(props: {
  instructions: Instruction[];
  instructionRange: [number, number];
}) {
  const [asm, setAsm] = useState<ASMBlock[]>([]);
  const [targetPlatform, setTargetPlatform] = useState<BackendTarget>(
    "x64_win"
  );

  useEffect(() => {
    if (validate(props.instructions)) {
      setAsm(compileAsm(props.instructions, targetPlatform, "untitled"));
    }
  }, [props.instructions, targetPlatform]);

  const renderedBlocks =
    targetPlatform === "wasm"
      ? renderWasm({ asm, instructionRange: props.instructionRange })
      : renderX64({ asm, instructionRange: props.instructionRange });

  const targets = targetValues.map((platform, index) => (
    <button
      className={"dropdownItem"}
      onClick={() => {
        setTargetPlatform(platform[0]);
      }}
      key={index}
    >
      {platform[1]}
    </button>
  ));

  return (
    <div className="assemblyContainer">
      <div className="header subheader">
        <InlineDropdown
          classNames="subheaderButton"
          label={`Target: ${
            targetValues.find((t) => t[0] === targetPlatform)![1]
          }`}
          openLabel="Select Target"
          dismissOnClick
        >
          {targets}
        </InlineDropdown>
        <div className={"divider"} />
        <button
          className="subheaderButton"
          onClick={() =>
            downloadFile(
              targetPlatform === "wasm" ? formatWASM(asm) : formatASM(asm),
              "untitled.asm"
            )
          }
        >
          Download
        </button>
      </div>
      <div className={"asmInner"}>{renderedBlocks}</div>
    </div>
  );
}
