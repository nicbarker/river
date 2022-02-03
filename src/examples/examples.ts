import raw from "raw.macro";

export type Example = {
  name: string;
  file: string;
};

export const examples = [
  {
    name: "Multiples of 3 or 5",
    file: raw("./multiples_of_3_or_5.rvr"),
  },
];
