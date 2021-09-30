import classNames from "classnames";
import { useEffect, useState } from "react";
import { ASMBlock, compile, formatASM } from "./compile";
import { Instruction } from "./editor_handler";
import { parse } from "./parse";

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

export function ASMTab(props: {
  instructions: Instruction[];
  instructionIndex: number;
}) {
  let [asm, setAsm] = useState<ASMBlock[]>([]);

  useEffect(() => {
    setAsm(compileAsm(props.instructions));
  }, [props.instructions]);

  const renderedBlocks = asm.map((block) => {
    const renderedLines = block[1].map((line) => {
      const columns: React.ReactNode[] = [];
      for (let i = 0; i < 3; i++) {
        const column = line[i];
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
  return (
    <div className="assemblyContainer">
      <div className="header subheader">
        <button onClick={() => downloadFile(formatASM(asm), "untitled.asm")}>
          Download
        </button>
      </div>
      <div className={"asmInner"}>{renderedBlocks}</div>
    </div>
  );
}
