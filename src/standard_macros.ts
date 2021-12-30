import { Macro } from "./editor_handler";

export const standardMacros: Macro[] = [
  {
    name: "for",
    instructions: [
      {
        type: "defInstruction",
        fragments: [
          { type: "instruction", value: "def" },
          { type: "defName", value: "index" },
          { type: "size", value: 64 },
        ],
      },
      {
        type: "assignInstruction",
        fragments: [
          { type: "instruction", value: "assign" },
          { type: "varType", value: "var", stackPosition: 0 },
          { type: "assignAction", value: "=" },
          { type: "varType", value: "_", name: "initial" },
        ],
      },
      {
        type: "scopeInstruction",
        fragments: [
          { type: "instruction", value: "scope" },
          { type: "scopeAction", value: "open" },
        ],
      },
      {
        type: "placeholderInstruction",
        fragments: [{ type: "instruction", value: "_", name: "body" }],
      },
      {
        type: "assignInstruction",
        fragments: [
          { type: "instruction", value: "assign" },
          { type: "varType", value: "var", stackPosition: 0 },
          { type: "assignAction", value: "+" },
          { type: "varType", value: "_", name: "increment" },
        ],
      },
      {
        type: "compareInstruction",
        fragments: [
          { type: "instruction", value: "compare" },
          { type: "varType", value: "var", stackPosition: 0 },
          { type: "comparator", value: "<" },
          { type: "varType", value: "_", name: "max" },
        ],
      },
      {
        type: "jumpInstruction",
        fragments: [
          { type: "instruction", value: "jump" },
          { type: "jumpPosition", value: "start" },
        ],
      },
      {
        type: "scopeInstruction",
        fragments: [
          { type: "instruction", value: "scope" },
          { type: "scopeAction", value: "close" },
        ],
      },
    ],
  },
];
