import Tooltip from "@components/Tooltip.jsx";

export default function Badge({
                                  icon,
                                  label,
                                  tooltip,
                                  position = "absolute -top-2 -right-2",
                                  withBackground = true,
                                  className = "",
                              }) {
    return (
        <div className={`${position} group ${className}`}>
            <div
                className={`cursor-pointer w-5 h-5 flex items-center justify-center text-xs font-bold rounded-md shadow-sm
                ${withBackground ? "bg-neutral-700/80 text-white" : ""}`}
            >
                {icon}
            </div>

            {tooltip && (
                <Tooltip>
                    {label && <div className="font-semibold mb-1">{label}</div>}
                    {tooltip}
                </Tooltip>
            )}
        </div>
    );
}
