import raw from "raw.macro";

export enum RiverTypeCategory {
  BASE,
  DERIVED,
  STRUCT,
}
export enum NumberType {
  UINT,
  INT,
  FLOAT,
}
export type RiverTypeBase = {
  category: RiverTypeCategory.BASE;
  name: string;
  numberType: NumberType;
  size: 8 | 16 | 32 | 64;
};
export type RiverTypeDerived = {
  category: RiverTypeCategory.DERIVED;
  name: string;
  baseType: RiverType;
  size: number;
};
export type RiverTypeStruct = {
  category: RiverTypeCategory.STRUCT;
  name: string;
  members: RiverType[];
  size: number;
};
export type RiverType = RiverTypeBase | RiverTypeDerived | RiverTypeStruct;

export const Unsigned8: RiverTypeBase = {
  name: "u8",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.UINT,
  size: 8,
};

export const Unsigned16: RiverTypeBase = {
  name: "u16",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.UINT,
  size: 16,
};

export const Unsigned32: RiverTypeBase = {
  name: "u32",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.UINT,
  size: 32,
};

export const Unsigned64: RiverTypeBase = {
  name: "u64",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.UINT,
  size: 64,
};

export const Signed8: RiverTypeBase = {
  name: "i8",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.INT,
  size: 8,
};

export const Signed16: RiverTypeBase = {
  name: "i16",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.INT,
  size: 16,
};

export const Signed32: RiverTypeBase = {
  name: "i32",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.INT,
  size: 32,
};

export const Signed64: RiverTypeBase = {
  name: "i64",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.INT,
  size: 64,
};

export const Float32: RiverTypeBase = {
  name: "f32",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.FLOAT,
  size: 32,
};

export const Float64: RiverTypeBase = {
  name: "f64",
  category: RiverTypeCategory.BASE,
  numberType: NumberType.FLOAT,
  size: 64,
};

export const baseTypes: RiverTypeBase[] = [
  Unsigned8,
  Unsigned16,
  Unsigned32,
  Unsigned64,
  Signed8,
  Signed16,
  Signed32,
  Signed64,
  Float32,
  Float64,
];

export function getBaseTypeWithName(name: string): RiverTypeBase | undefined {
  switch (name) {
    case "u8":
      return Unsigned8;
    case "u16":
      return Unsigned16;
    case "u32":
      return Unsigned32;
    case "u64":
      return Unsigned64;
    case "i8":
      return Signed8;
    case "i16":
      return Signed16;
    case "i32":
      return Signed32;
    case "i64":
      return Signed64;
    case "f32":
      return Float32;
    case "f64":
      return Float64;
    default: {
      return undefined;
    }
  }
}

export function getTypeWithName(name: string, userTypes: RiverType[]) {
  const baseType = getBaseTypeWithName(name);
  if (!baseType) {
    const type = userTypes.find((type) => type.name === name);
    if (type) {
      return type;
    }
    throw new Error("Invalid name for type: " + name);
  } else {
    return baseType;
  }
}

export function getTypeSize(type: RiverType): number {
  if (type.category === RiverTypeCategory.BASE) {
    return type.size;
  } else if (type.category === RiverTypeCategory.DERIVED) {
    return getTypeSize(type.baseType);
  } else {
    let size = 0;
    for (const member of type.members) {
      size += getTypeSize(member);
    }
    return size;
  }
}

export function parseTypes(file: string): RiverType[] {
  // Todo: speed this up
  const lines = file.length === 0 ? [] : file.split("\n");
  const toReturn: RiverType[] = [];
  let openStruct: RiverTypeStruct | undefined;
  for (const line of lines) {
    const tokens = line.split(" ");
    switch (tokens[0]) {
      case "type": {
        const baseType = getTypeWithName(tokens[2], toReturn);
        const newType: RiverTypeDerived = {
          category: RiverTypeCategory.DERIVED,
          name: tokens[1],
          baseType: baseType,
          size: getTypeSize(baseType) * parseInt(tokens[3], 10),
        };
        if (!openStruct) {
          toReturn.push(newType);
        } else {
          openStruct.members!.push(newType);
        }
        break;
      }
      case "struct": {
        switch (tokens[2]) {
          case "open": {
            openStruct = {
              category: RiverTypeCategory.STRUCT,
              name: tokens[1],
              members: [],
              size: 0,
            };
            break;
          }
          case "close": {
            if (openStruct) {
              openStruct.size = getTypeSize(openStruct);
              toReturn.push(openStruct);
              openStruct = undefined;
            }
          }
        }
        break;
      }
    }
  }
  return toReturn;
}

export const standardTypes: RiverType[] = parseTypes(raw("./types.rvr"));

export const allTypes = (baseTypes as RiverType[]).concat(standardTypes);
