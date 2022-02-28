import classNames from "classnames";
import { useState } from "react";
import {
  baseTypes,
  getTypeSize,
  RiverType,
  RiverTypeCategory,
} from "./river_types";
import "./types_tab.css";

function renderType(
  type: RiverType,
  displayBits: boolean,
  stripe?: boolean,
  subType?: boolean
) {
  const typeSize = getTypeSize(type);
  switch (type.category) {
    case RiverTypeCategory.BASE: {
      return (
        <div className={classNames("type", { subType, stripe })}>
          <span className="typeName">{type.name}</span>
          <span className={classNames("baseType", type.numberType)}>
            {type.numberType}
          </span>{" "}
          <span className="typeSize">
            {displayBits ? typeSize : typeSize / 8}
          </span>
          <span className="typeArray"></span>
        </div>
      );
    }
    case RiverTypeCategory.DERIVED: {
      return (
        <div className={classNames("type", { subType, stripe })}>
          <span className="typeName">
            {subType && "- "}
            {type.name}
          </span>
          <span className="derivedTypeName">{type.baseType.name}</span>
          <span className="typeSize">
            {displayBits ? typeSize : typeSize / 8}
          </span>
        </div>
      );
    }
    case RiverTypeCategory.STRUCT: {
      const subTypes = type.members.map((m, i) =>
        renderType(m, displayBits, stripe, true)
      );
      return (
        <div className="struct">
          <div className={classNames("type", { subType, stripe })}>
            <span className="typeName">{type.name}</span>
            <span className="baseType">struct</span>
            <span className="typeSize">
              {displayBits ? typeSize : typeSize / 8}
            </span>
          </div>
          <div className="subTypes"></div>
          {subTypes}
        </div>
      );
    }
  }
}

export function TypesTab(props: { types: RiverType[] }) {
  const [displayBits, setDisplayBits] = useState(true);
  const baseTypesRendered = baseTypes.map((m, i) =>
    renderType(m, displayBits, i % 2 === 0, false)
  );
  const userTypesRendered = props.types.map((m, i) =>
    renderType(m, displayBits, i % 2 === 0, false)
  );
  return (
    <div className="typesContainer">
      <div className="type typeHeader">
        <span className="typeName">Type</span>
        <span className="baseType">Base Type</span>
        <span className="typeSize" onClick={() => setDisplayBits(!displayBits)}>
          Size ({displayBits ? "bits" : "bytes"})
        </span>
      </div>
      <div className="type typeSection">Standard Types</div>
      {baseTypesRendered}
      {userTypesRendered.length > 0 && (
        <>
          <div className="type typeSection">User Types</div>
          {userTypesRendered}
        </>
      )}
    </div>
  );
}
