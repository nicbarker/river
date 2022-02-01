import { Macro } from "./editor_handler";

export const standardMacros: Macro[] = [
  {
    name: "for",
    inline: false,
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
      {
        type: "scopeInstruction",
        fragments: [
          { type: "instruction", value: "scope" },
          { type: "scopeAction", value: "close" },
        ],
      },
    ],
  },
  {
    name: "expr",
    inline: true,
    instructions: [
      {
        type: "defInstruction",
        fragments: [
          {
            type: "instruction",
            value: "def",
          },
          {
            type: "defName",
            value: "output",
          },
          {
            type: "size",
            value: 64,
          },
        ],
      },
      {
        type: "assignInstruction",
        fragments: [
          {
            type: "instruction",
            value: "assign",
          },
          {
            type: "varType",
            value: "var",
            stackPosition: 0,
          },
          {
            type: "assignAction",
            value: "=",
          },
          {
            type: "varType",
            value: "_",
            name: "left",
          },
        ],
      },
      {
        type: "assignInstruction",
        fragments: [
          {
            type: "instruction",
            value: "assign",
          },
          {
            type: "varType",
            value: "var",
            stackPosition: 0,
          },
          {
            type: "assignAction",
            value: "_",
            name: "op",
          },
          {
            type: "varType",
            value: "_",
            name: "right",
          },
        ],
      },
    ],
  },
  {
    "name": "bool",
    "instructions": [
      {
        "type": "defInstruction",
        "fragments": [
          {
            "type": "instruction",
            "value": "def"
          },
          {
            "type": "defName",
            "value": "bool"
          },
          {
            "type": "size",
            "value": 8
          }
        ]
      },
      {
        "type": "assignInstruction",
        "fragments": [
          {
            "type": "instruction",
            "value": "assign"
          },
          {
            "type": "varType",
            "value": "var",
            "stackPosition": 0
          },
          {
            "type": "assignAction",
            "value": "="
          },
          {
            "type": "varType",
            "value": "const",
            "constValue": 0
          }
        ]
      },
      {
        "type": "compareInstruction",
        "fragments": [
          {
            "type": "instruction",
            "value": "compare"
          },
          {
            "type": "varType",
            "value": "_",
            "name": "left"
          },
          {
            "type": "comparator",
            "value": "_",
            "name": "comparator"
          },
          {
            "type": "varType",
            "value": "_",
            "name": "right"
          },
        ]
      },
      {
        "type": "assignInstruction",
        "fragments": [
          {
            "type": "instruction",
            "value": "assign"
          },
          {
            "type": "varType",
            "value": "var",
            "stackPosition": 0
          },
          {
            "type": "assignAction",
            "value": "="
          },
          {
            "type": "varType",
            "value": "const",
            "constValue": 1
          }
        ]
      }
    ],
    "inline": true
  }
];
