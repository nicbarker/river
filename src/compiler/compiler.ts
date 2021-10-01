import { CompiledInstruction } from "../parse";
import { compileX64 } from "./x64";

export type ASMLine = [string?, string?, string?];

export type ASMBlock = [number, ASMLine[]];

export function formatASM(blocks: ASMBlock[], width = 10) {
    return (
        blocks
            .map((block) =>
                block[1]
                    .map(
                        (line) =>
                            `${(line[0] || "").padEnd(width, " ")}${(line[1] || " ").padEnd(
                                width,
                                " "
                            )}${line[2] || ""}`
                    )
                    .join("\n")
            )
            .join("\n") + "\n"
    );
}

export type BackendTarget = 'x64_OSX' | 'x64_win'

export function compile(
    target: BackendTarget,
    fileName: string,
    instructions: CompiledInstruction[],
    maxMemory: number,
    jumps: number[]
) {
    switch (target) {
        case 'x64_win':
        case 'x64_OSX': {
            return compileX64(target, fileName, instructions, maxMemory, jumps);
        }
        default: return []
    }
}