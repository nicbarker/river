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
  {
    name: "Even Fibonacci numbers",
    file: raw("./sum_of_even_fibonacci.rvr"),
  },
  {
    name: "Largest Prime Factor",
    file: raw("./largest_prime_factor.rvr"),
  },
];
