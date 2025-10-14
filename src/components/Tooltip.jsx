import { useState, useEffect, useId } from "react";

export default function Tooltip({ children, position = "center", triggerId }) {
    const [visible, setVisible] = useState(false);
    const autoId = useId(); // unique fallback ID
    const tooltipId = triggerId || `tooltip-trigger-${autoId}`;

    const posClasses =
        position === "right"
            ? "bottom-full right-0"
            : position === "left"
                ? "bottom-full left-0"
                : "bottom-full left-1/2 -translate-x-1/2";

    useEffect(() => {
        const trigger = document.getElementById(tooltipId);
        if (!trigger) return;

        const toggleTooltip = (e) => {
            e.stopPropagation();
            setVisible((v) => !v);
        };

        const hideTooltip = (e) => {
            if (
                !e.target.closest(`#${tooltipId}`) &&
                !e.target.closest(".tooltip-content")
            ) {
                setVisible(false);
            }
        };

        trigger.addEventListener("touchstart", toggleTooltip);
        document.addEventListener("touchstart", hideTooltip);

        return () => {
            trigger.removeEventListener("touchstart", toggleTooltip);
            document.removeEventListener("touchstart", hideTooltip);
        };
    }, [tooltipId]);

    return (
        <div
            className={`absolute tooltip-content ${posClasses} mb-2 w-56 p-3 rounded-md bg-neutral-900/90 text-neutral-200 text-xs shadow-lg z-20 pointer-events-none
        transition transform
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        group-hover:opacity-100 group-hover:scale-100`}
        >
            {children}
        </div>
    );
}
