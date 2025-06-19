import { useRef, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import cn from "@/utils/cn";

export default function EditableHeading({
  text,
  onChange,
  className = "",
}: {
  text: string;
  onChange: (newText: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef(text);

  const beginEditing = () => {
    setEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(inputRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }, 0);
  };

  const handleSubmit = (e: React.FocusEvent) => {
    setEditing(false);
    const newText = e.target.textContent?.trim() || "";
    if (newText && newText !== text) {
      onChange(newText);
      textRef.current = newText;
    } else {
      e.target.textContent = textRef.current;
    }
  };

  return (
    <button
      onClick={beginEditing}
      className="without-ring flex group items-center justify-start text-left cursor-pointer"
      aria-label="edit list name"
    >
      <h1 className={cn("text-2xl font-bold ml-3", className)}>
        <span
          ref={inputRef}
          contentEditable={editing}
          suppressContentEditableWarning
          className={cn("without-ring", !editing && "line-clamp-1")}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLSpanElement).blur();
            }
          }}
        >
          {text}
        </span>
      </h1>
      {!editing && (
        <span className="opacity-30 group-hover:opacity-100 transition-opacity px-2 py-1">
          <MdModeEdit className="w-5 h-5" />
        </span>
      )}
    </button>
  );
}
