import classNames from "classnames";
import React, { Fragment, useEffect, useState } from "react";
import { VisibleVariable } from "./editor";
import {
  ApplicationState,
  FocusInputConstantTypes,
  FocusInputState,
  FocusInputType,
  handleKeyStroke,
} from "./editor_handler2";
import {
  allAssignActions,
  assignActionToString,
  compareActionToString,
  FragmentConst,
  FragmentMissing,
  FragmentType,
  FragmentVar,
  InstructionJump,
  InstructionScope,
  InstructionType,
  jumpActionToString,
  OSAction,
  OSActionToString,
} from "./parse2";
import {
  EditorInstructionAssign,
  EditorInstructionCompare,
  EditorInstructionDef,
  EditorInstructionOS,
  EditorInstructionType,
  ExtendedInstruction,
  preprocess,
} from "./preprocess2";
import { baseTypes } from "./types/river_types";

export function getFragmentHints(instructionType: InstructionType | EditorInstructionType) {
  switch (instructionType) {
    case EditorInstructionType.EMPTY:
      return ["scope | def | assign | compare | jump | os | macro"];
    case InstructionType.DEF:
      return ["def", "name", baseTypes.map((b) => b.name).join(" | ")];
    case InstructionType.ASSIGN:
      return ["assign", "var", "= | + | - | * | / | && | ||", "var | const | macro"];
    case InstructionType.SCOPE:
      return ["scope", "open | close"];
    case InstructionType.COMPARE:
      return ["compare", "var | const | macro", "== | != | > | >= | < | <=", "var | const | macro"];
    case InstructionType.JUMP:
      return ["jump", "start | end"];
    case InstructionType.OS:
      return ["os", "stdout", "var | const | macro"];
  }
}

function VarTypeFragment({
  cursorFocus,
  fragment,
  variable,
  focusInputState,
}: {
  cursorFocus: boolean;
  fragment: FragmentVar | FragmentConst | FragmentMissing;
  variable?: VisibleVariable;
  focusInputState?: FocusInputState;
}) {
  if (cursorFocus && focusInputState?.type === FocusInputType.SELECT_VARIABLE_TYPE) {
    return (
      <div
        className={classNames("fragment selectVar", {
          highlight: cursorFocus,
        })}
      >
        {"var | const | macro"}
      </div>
    );
  } else if (fragment.type === FragmentType.VAR) {
    return <VarFragment cursorFocus={cursorFocus} variable={variable} />;
  } else if (fragment.type === FragmentType.CONST) {
    return <ConstFragment cursorFocus={cursorFocus} value={fragment.value} />;
  } else {
    return <MissingFragment cursorFocus={cursorFocus} name={fragment.name} placeholder={"var | const | macro"} />;
  }
}

function VarFragment({ cursorFocus, variable }: { cursorFocus: boolean; variable?: VisibleVariable }) {
  return (
    <div
      className={classNames("fragment var", {
        highlight: cursorFocus,
      })}
    >
      {typeof variable !== "undefined" ? variable.name : cursorFocus && "var | const | macro"}
    </div>
  );
}

function ConstFragment({ cursorFocus, value }: { cursorFocus: boolean; value: number }) {
  return (
    <div
      className={classNames("fragment const", {
        highlight: cursorFocus,
      })}
    >
      {value}
    </div>
  );
}

function MissingFragment({
  cursorFocus,
  name,
  placeholder,
}: {
  cursorFocus: boolean;
  name: string;
  placeholder: string;
}) {
  return (
    <div
      className={classNames("fragment missing", {
        highlight: cursorFocus,
        empty: cursorFocus,
      })}
    >
      {cursorFocus ? placeholder : name}
    </div>
  );
}

function EmptyComponent(props: { focus: boolean }) {
  return (
    <div className={classNames("fragment empty", { highlight: props.focus })}>
      {props.focus &&
        getFragmentHints(EditorInstructionType.EMPTY)[0]
          .split(" | ")
          .map((h) => (
            <>
              <b className="bold-hint">{h.slice(0, 1)}</b>
              {h.slice(1)}
            </>
          ))
          .map((e, i, arr) => (
            <React.Fragment key={i}>
              {e}
              {i < arr.length - 1 ? " | " : null}
            </React.Fragment>
          ))}
    </div>
  );
}

function DefComponent({
  instruction,
  focus,
  cursorPos,
  focusInputState,
}: {
  instruction: EditorInstructionDef;
  focus: boolean;
  cursorPos: number;
  focusInputState?: FocusInputState;
}) {
  const fragments = [
    <div key={"def"} className={classNames("fragment def", { highlight: focus && cursorPos === 0 })}>
      def
    </div>,
    instruction.name.type === FragmentType.DEF_NAME ? (
      <div
        key={"name"}
        className={classNames("fragment defName", {
          highlight: focus && cursorPos === 1,
        })}
      >
        {instruction.name.name}
      </div>
    ) : (
      <MissingFragment
        name={instruction.name.name}
        cursorFocus={focus && cursorPos === 1}
        placeholder={getFragmentHints(InstructionType.DEF)[1]}
      />
    ),
    instruction.defType.type === FragmentType.DEF_TYPE ? (
      <div key="type" className={classNames("fragment defType", { highlight: focus && cursorPos === 2 })}>
        {instruction.defType.name}
      </div>
    ) : (
      <MissingFragment
        name={instruction.defType.name}
        cursorFocus={focus && cursorPos === 2}
        placeholder={getFragmentHints(InstructionType.DEF)[2]}
      />
    ),
  ];

  if (focus && focusInputState) {
    if (focusInputState.type === FocusInputType.GENERIC_STRING) {
      const empty = focusInputState.text.length === 0;
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight", { empty })}>
          {!empty ? focusInputState.text : focusInputState.placeholder}
        </div>
      );
    } else if (focusInputState.type === FocusInputType.SEARCH_TYPE) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {focusInputState.matchedTypes.map((t) => t.name).join(" | ")}
        </div>
      );
    }
  }
  return <>{fragments}</>;
}

function AssignComponent({
  instruction,
  focus,
  cursorPos,
  focusInputState,
}: {
  instruction: EditorInstructionAssign;
  focus: boolean;
  cursorPos: number;
  focusInputState?: FocusInputState;
}) {
  const fragments = [
    <div key={"assign"} className={classNames("fragment assign", { highlight: focus && cursorPos === 0 })}>
      assign
    </div>,
    <VarTypeFragment
      cursorFocus={focus && cursorPos === 1}
      variable={instruction.leftVariable}
      fragment={instruction.left}
      focusInputState={focusInputState}
    />,
    instruction.action.type === FragmentType.ASSIGN_ACTION ? (
      <div key="action" className={classNames("fragment assignAction", { highlight: focus && cursorPos === 2 })}>
        {assignActionToString(instruction.action.action)}
      </div>
    ) : (
      <MissingFragment
        name={instruction.action.name}
        cursorFocus={focus && cursorPos === 2}
        placeholder={getFragmentHints(InstructionType.ASSIGN)[2]}
      />
    ),
    <VarTypeFragment
      cursorFocus={focus && cursorPos === 3}
      variable={instruction.rightVariable}
      fragment={instruction.right}
      focusInputState={focusInputState}
    />,
  ];
  if (focus && focusInputState) {
    if (focusInputState.type === FocusInputType.SEARCH_VARIABLE) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {focusInputState.matchedVariables.length === 0
            ? "no variables found"
            : focusInputState.matchedVariables.map((v) => v.name).join(" | ")}
        </div>
      );
    } else if (focusInputState.type === FocusInputType.ACTION_ASSIGN) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {allAssignActions.map((a) => assignActionToString(a)).join(" | ")}
        </div>
      );
    } else if (FocusInputConstantTypes.includes(focusInputState.type)) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {focusInputState.text || "number"}
        </div>
      );
    }
  }
  return <>{fragments}</>;
}

function CompareComponent({
  instruction,
  focus,
  cursorPos,
  focusInputState,
}: {
  instruction: EditorInstructionCompare;
  focus: boolean;
  cursorPos: number;
  focusInputState?: FocusInputState;
}) {
  const fragments = [
    <div key={"compare"} className={classNames("fragment compare", { highlight: focus && cursorPos === 0 })}>
      compare
    </div>,
    <VarTypeFragment
      cursorFocus={focus && cursorPos === 1}
      variable={instruction.leftVariable}
      fragment={instruction.left}
      focusInputState={focusInputState}
    />,
    instruction.action.type === FragmentType.COMPARE_ACTION ? (
      <div key="action" className={classNames("fragment compareAction", { highlight: focus && cursorPos === 2 })}>
        {compareActionToString(instruction.action.action)}
      </div>
    ) : (
      <MissingFragment
        name={instruction.action.name}
        cursorFocus={focus && cursorPos === 2}
        placeholder={getFragmentHints(InstructionType.COMPARE)[2]}
      />
    ),
    <VarTypeFragment
      cursorFocus={focus && cursorPos === 3}
      variable={instruction.rightVariable}
      fragment={instruction.right}
      focusInputState={focusInputState}
    />,
  ];
  if (focus && focusInputState) {
    if (focusInputState.type === FocusInputType.SEARCH_VARIABLE) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {focusInputState.matchedVariables.length === 0
            ? "no variables found"
            : focusInputState.matchedVariables.map((v) => v.name).join(" | ")}
        </div>
      );
    } else if (focusInputState.type === FocusInputType.ACTION_COMPARE) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {focusInputState.matchedCompareActions.map((a) => compareActionToString(a)).join(" | ")}
        </div>
      );
    } else if (FocusInputConstantTypes.includes(focusInputState.type)) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {focusInputState.text || "number"}
        </div>
      );
    }
  }
  return <>{fragments}</>;
}

function JumpComponent({
  instruction,
  focus,
  cursorPos,
  focusInputState,
}: {
  instruction: InstructionJump;
  focus: boolean;
  cursorPos: number;
  focusInputState?: FocusInputState;
}) {
  const fragments = [
    <div key={"def"} className={classNames("fragment jump", { highlight: focus && cursorPos === 0 })}>
      jump
    </div>,
    instruction.action.type === FragmentType.JUMP_ACTION ? (
      <div
        key={"name"}
        className={classNames("fragment jumpTarget", {
          highlight: focus && cursorPos === 1,
          empty: !instruction.action,
        })}
      >
        {jumpActionToString(instruction.action.action)}
      </div>
    ) : (
      <MissingFragment
        name={instruction.action.name}
        cursorFocus={focus && cursorPos === 1}
        placeholder={getFragmentHints(InstructionType.JUMP)[1]}
      />
    ),
  ];
  if (focus && focusInputState) {
    if (focusInputState.type === FocusInputType.ACTION_JUMP) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          start | end
        </div>
      );
    }
  }
  return <>{fragments}</>;
}

function ScopeComponent({
  instruction,
  focus,
  cursorPos,
}: {
  instruction: InstructionScope;
  focus: boolean;
  cursorPos: number;
}) {
  const fragments = [
    <div key={"def"} className={classNames("fragment scope", { highlight: focus && cursorPos === 0 })}>
      scope
    </div>,
    <div
      key={"name"}
      className={classNames("fragment scopeAction", {
        highlight: focus && cursorPos === 1,
        empty: !instruction.action,
      })}
    >
      {instruction.action}
    </div>,
  ];
  return <>{fragments}</>;
}

function OSComponent({
  instruction,
  focus,
  cursorPos,
  focusInputState,
}: {
  instruction: EditorInstructionOS;
  focus: boolean;
  cursorPos: number;
  focusInputState?: FocusInputState;
}) {
  const fragments = [
    <div key={"os"} className={classNames("fragment os", { highlight: focus && cursorPos === 0 })}>
      os
    </div>,
    <div
      key={"name"}
      className={classNames("fragment osAction", {
        highlight: focus && cursorPos === 1,
        empty: !instruction.action,
      })}
    >
      {OSActionToString(instruction.action.action)}
    </div>,
    <VarTypeFragment
      key={"var"}
      cursorFocus={focus && cursorPos === 2}
      variable={instruction.action.action === OSAction.STDOUT ? instruction.variable : undefined}
      fragment={instruction.action.varType}
      focusInputState={focusInputState}
    />,
  ];
  if (focus && focusInputState) {
    if (focusInputState.type === FocusInputType.SEARCH_VARIABLE) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {focusInputState.matchedVariables.length === 0
            ? "no variables found"
            : focusInputState.matchedVariables.map((v) => v.name).join(" | ")}
        </div>
      );
    } else if (FocusInputConstantTypes.includes(focusInputState.type)) {
      fragments[cursorPos] = (
        <div key="focusInput" className={classNames("fragment highlight empty")}>
          {focusInputState.text || "number"}
        </div>
      );
    }
  }
  return <>{fragments}</>;
}

export function Editor({ applicationState, rerender }: { applicationState: ApplicationState; rerender: () => void }) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!e.metaKey) {
        if (e.key.match(/^[ -~]$/) || e.key.match(/Arrow/)) {
          e.preventDefault();
        }
        handleKeyStroke({ key: e.key, applicationState });
        rerender();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [applicationState, rerender]);

  const instructionsRendered = applicationState.editorInstructions.map((instruction, i) => {
    const focus = applicationState.cursorPositions[0] === i;
    let instructionRendered: React.ReactElement = <div></div>;
    switch (instruction.type) {
      case EditorInstructionType.EMPTY: {
        instructionRendered = <EmptyComponent key={i} focus={focus} />;
        break;
      }
      case InstructionType.DEF: {
        instructionRendered = (
          <DefComponent
            key={i}
            instruction={instruction}
            focus={focus}
            cursorPos={applicationState.cursorPositions[1]}
            focusInputState={applicationState.focusInputState}
          />
        );
        break;
      }
      case InstructionType.ASSIGN: {
        instructionRendered = (
          <AssignComponent
            key={i}
            instruction={instruction}
            focus={focus}
            cursorPos={applicationState.cursorPositions[1]}
            focusInputState={applicationState.focusInputState}
          />
        );
        break;
      }
      case InstructionType.COMPARE: {
        instructionRendered = (
          <CompareComponent
            key={i}
            instruction={instruction}
            focus={focus}
            cursorPos={applicationState.cursorPositions[1]}
            focusInputState={applicationState.focusInputState}
          />
        );
        break;
      }
      case InstructionType.JUMP: {
        instructionRendered = (
          <JumpComponent
            key={i}
            instruction={instruction}
            focus={focus}
            cursorPos={applicationState.cursorPositions[1]}
            focusInputState={applicationState.focusInputState}
          />
        );
        break;
      }
      case InstructionType.SCOPE: {
        instructionRendered = (
          <ScopeComponent
            key={i}
            instruction={instruction}
            focus={focus}
            cursorPos={applicationState.cursorPositions[1]}
          />
        );
        break;
      }
      case InstructionType.OS: {
        instructionRendered = (
          <OSComponent
            key={i}
            instruction={instruction}
            focus={focus}
            cursorPos={applicationState.cursorPositions[1]}
            focusInputState={applicationState.focusInputState}
          />
        );
        break;
      }
    }

    const indent = Array(instruction.indent)
      .fill(0)
      .map(() => <div className="indent" />);

    const compareIndent =
      i > 0 && applicationState.editorInstructions[i - 1].type === InstructionType.COMPARE ? (
        <div className="indent compare" />
      ) : null;

    return (
      <div className="line" key={i}>
        <div className="lineNumber">{instruction.originalLineNumber + 1}</div>
        <div className="instruction">
          {indent}
          {compareIndent}
          {instructionRendered}
        </div>
      </div>
    );
  });
  return <code className={"code"}>{instructionsRendered}</code>;
}
