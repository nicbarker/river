import { Macro, ScopeInstruction } from "./editor_handler";

const scopeOpen: ScopeInstruction = {
  type: "scopeInstruction",
  fragments: [
    { type: "instruction", value: "scope" },
    { type: "scopeAction", value: "open" },
  ],
};

const scopeClose: ScopeInstruction = {
  type: "scopeInstruction",
  partner: scopeOpen,
  fragments: [
    { type: "instruction", value: "scope" },
    { type: "scopeAction", value: "close" },
  ],
};

scopeOpen.partner = scopeClose;

export const standardMacros: Macro[] = [
  {
    name: "for",
    instructions: [
      scopeOpen,
      {
        type: "defInstruction",
        fragments: [
          { type: "instruction", value: "def" },
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
          { type: "varType", value: "const", constValue: 0 },
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
          { type: "varType", value: "const", constValue: 1 },
        ],
        valid: true,
      },
      {
        type: "compareInstruction",
        fragments: [
          { type: "instruction", value: "compare" },
          { type: "varType", value: "var", stackPosition: 0 },
          { type: "comparator", value: "<" },
          { type: "varType", value: "const", constValue: 10 },
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
      scopeClose,
    ],
  },
];
