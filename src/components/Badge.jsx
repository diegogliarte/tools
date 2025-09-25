import Tooltip from "@components/Tooltip.jsx";

export default function Badge({ icon, label, tooltip }) {
    return (
        <div className="absolute -top-2 -right-2 group">
            <div className="cursor-pointer w-6 h-6 flex items-center justify-center text-sm font-bold rounded-md bg-neutral-700/80 text-white shadow-sm">
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
