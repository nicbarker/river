import React, { useEffect, useState } from "react";
import "./App.css";
import { parse, execute } from "./parse";
import classnames from "classnames";

type Output = { value: string; lineNumber: number };

function App() {
  const [cursorPos, setCursorPos] = useState(0);
  const [lines, setLines] = useState<string[][]>([[]]);
  const [lineIndex, setLineIndex] = useState(0);
  const [outputs, setOutputs] = useState<Output[]>([]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key.match(/^[ -~]$/)) {
        lines[lineIndex].splice(cursorPos, 0, e.key);
        setCursorPos(cursorPos + 1);
      } else if (e.key === "Backspace") {
        if (cursorPos > 0) {
          lines[lineIndex].splice(cursorPos - 1, 1);
          setCursorPos(cursorPos - 1);
        } else if (cursorPos === 0 && lineIndex > 0) {
          const removed = lines.splice(lineIndex, 1);
          const newCursorPos = lines[lineIndex - 1].length;
          lines[lineIndex - 1] = lines[lineIndex - 1].concat(removed[0]);
          setLineIndex(lineIndex - 1);
          setCursorPos(newCursorPos);
        }
      } else if (e.key === "ArrowRight") {
        if (cursorPos < lines[lineIndex].length) {
          setCursorPos(cursorPos + 1);
        } else if (lineIndex < lines.length - 1) {
          setLineIndex(lineIndex + 1);
          setCursorPos(0);
        }
      } else if (e.key === "ArrowLeft") {
        if (cursorPos > 0) {
          setCursorPos(cursorPos - 1);
        } else if (lineIndex > 0) {
          setLineIndex(lineIndex - 1);
          setCursorPos(lines[lineIndex - 1].length);
        }
      } else if (e.key === "ArrowUp" && lineIndex > 0) {
        if (cursorPos > lines[lineIndex - 1].length) {
          setCursorPos(lines[lineIndex - 1].length);
        }
        setLineIndex(lineIndex - 1);
      } else if (e.key === "ArrowDown" && lineIndex < lines.length - 1) {
        if (cursorPos > lines[lineIndex + 1].length) {
          setCursorPos(lines[lineIndex + 1].length);
        }
        setLineIndex(lineIndex + 1);
      } else if (e.key === "Enter" && cursorPos > 0) {
        const newLineContents = lines[lineIndex].splice(
          cursorPos,
          lines[lineIndex].length - cursorPos
        );
        lines.splice(lineIndex + 1, 0, newLineContents);
        setLineIndex(lineIndex + 1);
        setCursorPos(0);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [lines, lineIndex, cursorPos]);

  let indent = 0;
  const charsRendered = lines.map((l, li) => {
    const chars = l.map((c, i) =>
      c === "\n" ? (
        <br />
      ) : (
        <span
          className={classnames({
            cursor: lineIndex === li && cursorPos === i + 1,
            cursorLeft: lineIndex === li && cursorPos === 0 && i === 0,
          })}
        >
          {c}
        </span>
      )
    );

    if (l.join("").match("scope close")) {
      indent -= 2;
    }

    let indentRendered = Array(indent)
      .fill(0)
      .map(() => <span className="indent"> </span>);

    if (l.join("").match("scope open")) {
      indent += 2;
    }

    return (
      <div className="line">
        <div className="lineNumber">{li}</div>
        <div className="instruction">
          {indentRendered}
          {chars.length > 0 ? (
            chars
          ) : (
            <span
              className={classnames("empty", {
                cursorLeft: lineIndex === li,
              })}
            ></span>
          )}
        </div>
      </div>
    );
  });

  const outputsRendered = outputs.map((o) => (
    <code>
      <span className="lineNumber">main:{o.lineNumber}</span>
      {o.value}
    </code>
  ));

  return (
    <div className="App">
      <code className="top">{charsRendered}</code>
      <div className="bottom">
        <div className="buttons">
          <button
            onClick={() => {
              outputs.splice(0, outputs.length);
              const [scopes, instructions] = parse(
                lines.map((l) => l.join("")).join("\n")
              );
              console.log(scopes, instructions);
              execute(scopes, instructions, (output: Output) => {
                outputs.push(output);
                setOutputs(outputs.slice());
              });
            }}
          >
            Run
          </button>
        </div>
        <div className="outputs">{outputsRendered}</div>
      </div>
    </div>
  );
}

export default App;
