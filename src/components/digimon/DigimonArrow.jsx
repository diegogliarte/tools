import Tooltip from "@components/Tooltip.jsx";

export default function DigimonArrow({ targetDigimon }) {
    return (
        <div className="relative flex items-center h-16">
            <div className="text-neutral-500 text-2xl font-bold select-none cursor-pointer transition transform group-hover:text-violet-400 group-hover:scale-125">
                &rarr;
            </div>

            {targetDigimon?.requirements?.length > 0 && (
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
