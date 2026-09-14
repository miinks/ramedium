export const SHEET_PAD = "min-h-screen px-4 pt-5 pb-8 wide:px-8 wide:pt-7 wide:pb-10";

const CORNERS = ["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"];

export function Marks() {
  return (
    <div className="pointer-events-none absolute inset-[14px]" aria-hidden="true">
      {CORNERS.map((corner) => (
        <i key={corner} className={`absolute size-3.5 ${corner}`}>
          <span className="absolute left-1/2 h-full w-px bg-ink" />
          <span className="absolute top-1/2 h-px w-full bg-ink" />
        </i>
      ))}
    </div>
  );
}

export function MetaRow({ className = "", children }) {
  return (
    <div
      className={`flex justify-between gap-4 text-[11px] tracking-[0.08em] text-mute uppercase ${className}`}
    >
      {children}
    </div>
  );
}

export function Sheet({ ghost = false, motion = "", className = "", children }) {
  const classes = [
    "sheet relative",
    ghost && "pointer-events-none absolute inset-0 z-[2]",
    className,
    motion,
  ]
    .filter(Boolean)
    .join(" ");

  return <main className={classes}>{children}</main>;
}
