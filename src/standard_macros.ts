import { Macro } from "./editor_handler";

export const standardMacros: Macro[] = [
  {
    name: "for",
    instructions: [
      {
        type: "scopeInstruction",
        fragments: [
          { type: "instruction", value: "scope" },
          { type: "scopeAction", value: "open" },
        ],
      },
      {
        type: "defInstruction",
        fragments: [
          { type: "instruction", value: "def" },
          { type: "defName", value: "index" },
          { type: "defLocation", value: "local" },
          { type: "size", value: 64 },
        ],
        valid: true,
      },
      {
        type: "assignInstruction",
        fragments: [
          { type: "instruction", value: "assign" },
          { type: "varType", value: "var", stackPosition: 0 },
          { type: "assignAction", value: "=" },
          { type: "varType", value: "_" },
        ],
        valid: true,
      },
      {
        type: "placeholderInstruction",
        fragments: [{ type: "instruction", value: "_" }],
        valid: true,
      },
      {
        type: "assignInstruction",
        fragments: [
          { type: "instruction", value: "assign" },
          { type: "varType", value: "var", stackPosition: 0 },
          { type: "assignAction", value: "+" },
          { type: "varType", value: "_" },
        ],
        valid: true,
      },
      {
        type: "compareInstruction",
        fragments: [
          { type: "instruction", value: "compare" },
          { type: "varType", value: "var", stackPosition: 0 },
          { type: "comparator", value: "<" },
          { type: "varType", value: "_" },
        ],
        valid: true,
      },
      {
        type: "jumpInstruction",
        fragments: [
          { type: "instruction", value: "jump" },
          { type: "instructionNumber", value: 4 },
        ],
        valid: true,
      },
      {
        type: "scopeInstruction",
        fragments: [
          { type: "instruction", value: "scope" },
          { type: "scopeAction", value: "close" },
        ],
      },
    ],
    placeholders: ["initial", "increment", "max"],
  },
];
