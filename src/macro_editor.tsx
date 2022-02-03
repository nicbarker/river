import classnames from "classnames";
import { useState, useEffect } from "react";
import { Editor } from "./editor";
import { Instruction, Macro } from "./editor_handler";

export function MacroEditor({
  macro,
  macros,
  focusIndex,
  hasFocus,
  setMacros,
  setActiveRightTab,
  setFocusIndex,
}: {
  macro: Macro;
  macros: Macro[];
  focusIndex: number;
  hasFocus: boolean;
  setMacros: (macros: Macro[]) => void;
  setActiveRightTab: (tab: "build" | "asm" | "macros") => void;
  setFocusIndex: (focusIndex: number) => void;
}) {
  const [internalFocus, setInternalFocus] = useState(1);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (internalFocus === 0) {
        if (!e.metaKey) {
          if (e.key.match(/^[ -~]$/)) {
            e.preventDefault();
            macro.name += e.key;
            setMacros(macros.slice());
          } else if (e.key === "ArrowUp" && focusIndex > 1) {
            setFocusIndex(focusIndex - 1);
          } else if (e.key === "ArrowDown" || e.key === "Enter") {
            setInternalFocus(1);
          } else if (e.key === "Backspace") {
            macro.name = macro.name.slice(0, macro.name.length - 1);
            setMacros(macros.slice());
          }
        }
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [focusIndex, internalFocus, macro, macros, setFocusIndex, setMacros]);

  return (
    <div className={classnames("macroOuter", { hasFocus })}>
      <div className="macroHeader">
        <div
          className={classnames("macroTitle", {
            hasFocus: internalFocus === 0,
          })}
        >
          {macro.name || "Macro Title"}
        </div>
        <div className="divider"></div>
        {macro.inline && <div className="inline">inline</div>}
      </div>
      <Editor
        onCursorUnderflow={() => setInternalFocus(0)}
        hasFocus={hasFocus && internalFocus === 1}
        sourceMacro={macro}
        macros={macros}
        setMacros={setMacros}
        instructions={macro.instructions}
        macrosExpanded={false}
        setInstructions={(instructions: Instruction[]) => {
          macro.instructions = instructions;
          setMacros(macros.slice());
        }}
        setActiveRightTab={setActiveRightTab}
        setFocusIndex={setFocusIndex}
      />
    </div>
  );
}
