interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  position: "left" | "right";
}

export function ResizeHandle({ onMouseDown, position }: ResizeHandleProps) {
  const roundedClass = position === "left" ? "rounded-l-md" : "rounded-r-md";

  return (
    <div
      className="h-full w-2 cursor-ew-resize opacity-0 transition-opacity group-hover:opacity-100"
      onMouseDown={onMouseDown}
    >
      <div className={`h-full w-full bg-amber-400 ${roundedClass}`} />
    </div>
  );
}
