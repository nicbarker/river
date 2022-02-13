import raw from "raw.macro";
import { Macro } from "../editor_handler";
import { parseTextFile } from "../parse";

export const standardMacros: Macro[] = [
  {
    name: "for",
    instructions: parseTextFile(raw("./for.rvr"), true),
    inline: false,
  },
  {
    name: "expr",
    instructions: parseTextFile(raw("./expr.rvr"), true),
    inline: true,
  },
  {
    name: "bool",
    instructions: parseTextFile(raw("./bool.rvr"), true),
    inline: true,
  },
  {
    name: "if",
    instructions: parseTextFile(raw("./if.rvr"), true),
    inline: false,
  },
];
