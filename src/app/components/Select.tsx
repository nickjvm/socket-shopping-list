"use client";

import cn from "@/utils/cn";
import { useState } from "react";
import { RxCaretDown } from "react-icons/rx";

type SelectProps = {
  label: string;
  placeholder?: string;
  className?: string;
  options: { value: string; label: string }[];
} & React.InputHTMLAttributes<HTMLSelectElement>;
export default function Select({
  label,
  options,
  className,
  placeholder,
  ...props
}: SelectProps) {
  const [value, setValue] = useState(props.value || props.defaultValue || "");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (props.onChange) {
      props.onChange(e);
    }
    setValue(e.target.value);
  };
  return (
    <div className={cn("flex gap-2 relative", className)}>
      <label
        className={cn(
          "rounded absolute top-0 transform translate-y-[-50%]  px-1 transition-all duration-200",
          "-translate-y-1/2 pl-4 left-0",
          props.id || props.name ? "pointer-events-none" : "cursor-pointer",
          value || (!value && placeholder)
            ? "text-sm top-0 w-auto bg-white dark:bg-slate-900 pl-2 left-2"
            : "top-1/2 w-full text-base text-slate-500 cursor-pointer"
        )}
        htmlFor={props.id}
      >
        {label}
      </label>
      <select
        className="appearance-none w-full px-4 py-2 border border-gray-500 rounded dark:bg-slate-900"
        {...props}
        onChange={handleChange}
      >
        {!value && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <RxCaretDown className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none" />
    </div>
  );
}
