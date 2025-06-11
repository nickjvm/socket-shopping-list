import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (number | boolean | string | undefined | null)[]) =>
  twMerge(clsx(inputs));

export default cn;
