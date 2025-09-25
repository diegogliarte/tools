import Badge from "@components/Badge.jsx";

function portraitFor(d) {
    return d?.portrait ? `/digimon-portraits/${d.portrait}` : "/digimon-portraits/placeholder.webp";
}

export default function DigimonSlot({
                                        digimon,
                                        clickable,
                                        side,
                                        inChain,
                                        isEnd,
                                        onClick,
                                        compact = false,
                                    }) {
    if (!digimon) return null;

    const portrait = portraitFor(digimon);

    // Badge detection (Digimon-specific)
    const dnaReqs = digimon.requirements?.filter((r) =>
        r.includes("personnality is")
    );
    const eggReqs = digimon.requirements?.filter((r) =>
        r.includes("Digi-Egg")
    );

    const reqs = dnaReqs?.length ? dnaReqs : eggReqs?.length ? eggReqs : null;

    const badgeProps = reqs
        ? {
            icon: dnaReqs?.length ? "🧬" : "🥚",
            label: dnaReqs?.length ? "DNA Jogress" : "Armor Evolution",
            tooltip: (
                <div className="space-y-1">
                    {reqs.map((r, i) => (
                        <div key={i}>· {r}</div>
                    ))}
                </div>
            ),
        }
        : null;

    // Image classes
    let imgClasses = "w-16 h-16 object-contain rounded-lg transition";
    if (clickable) {
        imgClasses +=
            side === "left"
                ? " cursor-pointer hover:ring-2 hover:ring-blue-400"
                : " cursor-pointer hover:ring-2 hover:ring-green-400";
    } else if (inChain) {
        imgClasses += " ring-2 ring-yellow-400";
        if (isEnd) imgClasses += " cursor-pointer hover:ring-red-400";
    }

    return (
        <div
            className={`flex flex-col items-center gap-1 ${
                compact
                    ? "cursor-pointer hover:bg-neutral-700 rounded p-2 transition"
                    : ""
            }`}
            onClick={compact ? onClick : undefined} // 👈 only clickable in compact mode
        >
            {!compact && (
                <span className="text-xs text-neutral-400">{digimon.stage}</span>
            )}

            <div className="relative">
                <img
                    src={portrait}
                    alt={digimon.name}
                    title={digimon.name}
                    onError={(e) => (e.currentTarget.src = "/digimon-portraits/placeholder.webp")}
                    className={imgClasses}
                    onClick={!compact ? onClick : undefined}
                />

                {!compact && badgeProps && <Badge {...badgeProps} />}
            </div>

            <span className="text-xs text-neutral-200 text-center">
        {digimon.name}
      </span>

            {compact && (
                <span className="text-xs text-neutral-400">{digimon.stage}</span>
            )}
        </div>
    );
}
