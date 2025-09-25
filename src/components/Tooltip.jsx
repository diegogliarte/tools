export default function Tooltip({ children, position = "center" }) {
    if (!children) return null;

    const posClasses =
        position === "right"
            ? "bottom-full right-0"
            : position === "left"
                ? "bottom-full left-0"
                : "bottom-full left-1/2 -translate-x-1/2";

    return (
        <div
            className={`absolute ${posClasses} mb-2 w-56 p-3 rounded-md bg-neutral-900/90 text-neutral-200 text-xs shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition transform z-20 pointer-events-none`}
        >
            {children}
        </div>
    );
}
