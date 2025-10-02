import { useState } from "react";
import Badge from "@components/Badge.jsx";

function portraitSources(d) {
    if (!d?.portrait) return ["/digimon-portraits/placeholder.webp"];
    return [
        `/digimon-portraits/${d.portrait}`,
        `/digimon-portraits-new/${d.portrait}`,
        "/digimon-portraits/placeholder.webp",
    ];
}

function typeIconFor(type) {
    if (!type) return null;
    const normalized = type.toLowerCase();
    if (normalized.includes("none")) return "/digimon-icons/none.png";
    if (normalized.includes("vaccine")) return "/digimon-icons/vaccine.png";
    if (normalized.includes("virus")) return "/digimon-icons/virus.png";
    if (normalized.includes("data")) return "/digimon-icons/data.png";
    if (normalized.includes("variable")) return "/digimon-icons/variable.png";
    if (normalized.includes("free")) return "/digimon-icons/free.png";
    if (normalized.includes("unknown")) return "/digimon-icons/unknown.png";
    return null;
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

    const sources = portraitSources(digimon);
    const [srcIndex, setSrcIndex] = useState(0);
    const typeIcon = typeIconFor(digimon.type);

    // Badge detection...
    const dnaReqs = digimon.requirements?.filter((r) =>
        r.includes("personnality is")
    );
    const eggReqs = digimon.requirements?.filter((r) => r.includes("Digi-Egg"));
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

    let imgClasses = "w-12 h-12 object-contain rounded-lg transition";
    if (clickable) {
        imgClasses +=
            side === "left"
                ? " cursor-pointer hover:ring-2 hover:ring-blue-400"
                : " cursor-pointer hover:ring-2 hover:ring-green-400";
    } else if (inChain) {
        imgClasses += " ring-2 ring-yellow-400";
        if (isEnd) imgClasses += " cursor-pointer hover:ring-red-400";
    }

    const handleError = () => {
        if (srcIndex < sources.length - 1) {
            setSrcIndex((i) => i + 1);
        }
    };

    return (
        <div
            className={`flex flex-col items-center gap-1 ${
                compact
                    ? "cursor-pointer hover:bg-neutral-700 rounded p-2 transition"
                    : ""
            } w-20`} // ✅ fixed width for all slots
            onClick={compact ? onClick : undefined}
        >
            {!compact && (
                <span className="text-xs text-neutral-400">{digimon.stage}</span>
            )}

            <div className="relative">
                <img
                    src={sources[srcIndex]}
                    alt={digimon.name}
                    title={digimon.name}
                    onError={handleError}
                    className={imgClasses}
                    onClick={!compact ? onClick : undefined}
                />

                {typeIcon && (
                    <img
                        src={typeIcon}
                        alt={digimon.type}
                        title={digimon.type}
                        className="absolute -bottom-1 -right-2 w-4 h-4 rounded-full bg-neutral-900"
                    />
                )}

                {!compact && badgeProps && <Badge {...badgeProps} />}
            </div>

            {/* ✅ Name will truncate instead of resizing container */}
            <span
                className="text-xs text-neutral-200 text-center truncate max-w-full"
                title={digimon.name} // show full name on hover
            >
                {digimon.name}
            </span>

            {compact && (
                <span className="text-xs text-neutral-400">{digimon.stage}</span>
            )}
        </div>
    );
}

