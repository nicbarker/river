import { InstructionValid } from "../parse2";
import { compileWasm } from "./wasm";
import { compileX64 } from "./x64";

export type ASMLine = (string | undefined)[];

export type ASMBlock = [number, ASMLine[]];

export function formatASM(blocks: ASMBlock[], width = 10) {
  return (
    blocks
      .map((block) =>
        block[1]
          .map((line) => `${(line[0] || "").padEnd(width, " ")}${(line[1] || " ").padEnd(width, " ")}${line[2] || ""}`)
          .join("\n")
      )
      .join("\n") + "\n"
  );
}

export function formatWASM(blocks: ASMBlock[], width = 2) {
  return (
    blocks
      .map((block) =>
        block[1].map((line) => line.map((fragment) => (fragment || "").padEnd(width, " ")).join("")).join("\n")
      )
      .join("\n") + "\n"
  );
}

export type BackendTarget = "x64_OSX" | "x64_win" | "wasm";

export function compile(
  target: BackendTarget,
  fileName: string,
  instructions: InstructionValid[],
  serializedInstructions: string[],
  maxMemory: number
) {
  switch (target) {
    case "x64_win":
    case "x64_OSX": {
      return compileX64(target, fileName, instructions, serializedInstructions, maxMemory);
    }
    case "wasm": {
      return compileWasm(fileName, instructions, serializedInstructions, maxMemory);
    }
    default:
      return [];
  }
}
