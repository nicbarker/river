import classNames from "classnames";
import "./inline_dropdown.css";
import React, { useContext, useEffect, useState } from "react";
import { DismissContext } from "../context/dismiss_context";

export function InlineDropdown(props: {
  label: string;
  openLabel?: string;
  classNames?: string;
  dismissOnClick?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const DismissProvider = useContext(DismissContext);

  useEffect(() => {
    function dismiss() {
      setOpen(false);
    }
    if (open) {
      DismissProvider.push(dismiss);
      return () => {
        DismissProvider.splice(DismissProvider.indexOf(dismiss), 1);
      };
    }
  }, [open, DismissProvider]);

  return (
    <button
      onClick={(e) => {
        setOpen(!open);
        e.stopPropagation();
      }}
      className={classNames(props.classNames, "dropdownOuter", { open })}
    >
      {props.openLabel && open ? props.openLabel : props.label}
      <div
        className={classNames("dropdownInner", { visible: open })}
        onClick={(e) => !props.dismissOnClick && e.stopPropagation()}
      >
        {props.children}
      </div>
    </button>
  );
}
