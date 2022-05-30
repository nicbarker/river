import raw from "raw.macro";
import { InstructionMacro, Macro, parse } from "../parse2";

export const standardMacros: Macro[] = [
  {
    name: "for",
    instructions: parse({ file: raw("./for.rvr"), macro: true })[0] as InstructionMacro[],
    inline: false,
  },
  // {
  //   name: "expr",
  //   instructions: parse({ file: raw("./expr.rvr"), macro: true })[0],
  //   inline: true,
  // },
  // {
  //   name: "bool",
  //   instructions: parse({ file: raw("./bool.rvr"), macro: true })[0],
  //   inline: true,
  // },
  // {
  //   name: "if",
  //   instructions: parse({ file: raw("./if.rvr"), macro: true })[0],
  //   inline: false,
  // },
];
