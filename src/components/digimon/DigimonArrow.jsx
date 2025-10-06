import Tooltip from "@components/Tooltip.jsx";

export default function DigimonArrow({ targetDigimon, direction = "neutral" }) {
    let colorClass = "text-neutral-500";
    let hoverClass = "group-hover:text-violet-400"; // default for neutral arrows

    if (direction === "evolution") {
        colorClass = "text-green-400";
        hoverClass = ""; // no hover color override
    } else if (direction === "deevolution") {
        colorClass = "text-red-400";
        hoverClass = ""; // no hover color override
    }

    return (
        <div className="relative group flex items-center">
            <div
                className={`text-2xl font-bold select-none cursor-default transition transform ${colorClass} ${hoverClass} group-hover:scale-125`}
            >
                &rarr;
            </div>

            {targetDigimon?.requirements?.length > 0 &&
                direction !== "deevolution" && (
                    <Tooltip>
                        <div className="space-y-1">
                            {targetDigimon.requirements.map((r, i) => (
                                <div key={i}>{r}</div>
                            ))}
                        </div>
                    </Tooltip>
                )}
        </div>
    );
}
