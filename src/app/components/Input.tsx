"use client";

import cn from "@/utils/cn";
import { useEffect, useState } from "react";

type InputProps = {
  label: string;
  inputClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  label,
  className,
  inputClassName,
  ...props
}: InputProps) {
  const [value, setValue] = useState(props.value || props.defaultValue || "");
  const [focused, setFocused] = useState<boolean>(false);

  useEffect(() => {
    if (props.autoFocus) {
      setFocused(true);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (props.onBlur) {
      props.onBlur(e);
    }
    setFocused(false);
    setValue(e.target.value);
  };
  return (
    <div className={cn("flex gap-2 relative", className)}>
      <label
        className={cn(
          "rounded absolute top-0 transform translate-y-[-50%]  px-1 transition-all duration-200",
          "-translate-y-1/2 pl-4 left-0",
          props.id || props.name ? "pointer-events-none" : "cursor-pointer",
          props.placeholder || focused || value
            ? "text-sm top-0 w-auto bg-white dark:bg-slate-900 pl-2 left-2"
            : "top-1/2 w-full text-base text-slate-500 cursor-pointer"
        )}
        htmlFor={props.id}
      >
        {label}
      </label>
      <input
        {...props}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={cn(
          "border border-gray-500 rounded w-full px-4 py-2 dark:bg-slate-900",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          inputClassName
        )}
      />
    </div>
  );
}
