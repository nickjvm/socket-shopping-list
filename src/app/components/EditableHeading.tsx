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
  const inputRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef(text);

  const beginEditing = () => {
    if (editing) return; // Prevent re-entrance if already editing
    setEditing(true);
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
    <h1
      ref={inputRef}
      contentEditable
      role="textbox"
      aria-multiline="true"
      aria-label="edit list name"
      suppressContentEditableWarning
      className={cn(
        "text-2xl font-bold ml-1 px-2 py-1 -my-1 relative w-full",
        className,
        !editing && "line-clamp-1 pr-10 w-auto cursor-pointer"
      )}
      onFocus={beginEditing}
      onBlur={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLSpanElement).blur();
        }
      }}
    >
      {text}
      {!editing && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity px-2 py-1 pointer-events-none">
          <MdModeEdit className="w-5 h-5" />
        </span>
      )}
    </h1>
  );
}
