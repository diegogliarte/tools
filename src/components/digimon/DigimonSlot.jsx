import { useState } from "react";
import Badge from "@components/Badge.jsx";

function portraitSources(d) {
    if (!d?.portrait) return ["/digimon-portraits/placeholder.webp"];
    return [
        `/digimon-portraits/${d.portrait}`,
        "/digimon-portraits/placeholder.webp",
    ];
}

function typeIconFor(type) {
    if (!type) return null;
    const normalized = type.toLowerCase();
    if (normalized.includes("no data")) return "/digimon-icons/no-data.png";
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

    // 🧬 Badge detection (DNA & Armor only)
    const reqs = digimon.requirements || [];

// Detect DNA Jogress evolutions — multiple partners, parentheses, etc.
    const dnaReqs = reqs.filter(
        (r) => /Jogress|Partner|[\(\)]/.test(r) && !r.includes("Digi-Egg")
    );

// Detect Armor evolutions (Digi-Egg based)
    const eggReqs = reqs.filter((r) => /Digi-?Egg/i.test(r));

    // Ignore Agent Skill requirements — don't badge those
    const isAgentSkillEvo = reqs.some((r) => /Agent Skills/i.test(r));

    let badgeProps = null;
    if (!isAgentSkillEvo) {
        if (dnaReqs.length > 1) {
            badgeProps = {
                icon: "🧬",
                label: "DNA Jogress",
                tooltip: (
                    <div className="space-y-1">
                        {dnaReqs.map((r, i) => (
                            <div key={i}>· {r}</div>
                        ))}
                    </div>
                ),
            };
        } else if (eggReqs.length > 0) {
            badgeProps = {
                icon: "🥚",
                label: "Armor Evolution",
                tooltip: (
                    <div className="space-y-1">
                        {eggReqs.map((r, i) => (
                            <div key={i}>· {r}</div>
                        ))}
                    </div>
                ),
            };
        }
    }


    let imgClasses = `w-12 h-12 object-contain rounded-lg transition ${
        compact ? "cursor-pointer" : "cursor-help" }`;
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
            className={`flex flex-col items-center gap-0.5 ${
                compact
                    ? "cursor-pointer hover:bg-neutral-700 rounded p-1 transition"
                    : ""
            } w-20`}
            onClick={compact ? onClick : undefined}
        >
            {!compact && (
                <span className="text-xs text-neutral-400">{digimon.stage}</span>
            )}

            <div className="relative">
                <img
                    src={sources[srcIndex]}
                    alt={digimon.name}
                    onError={handleError}
                    className={imgClasses}
                    onClick={!compact ? onClick : undefined}
                    title={
                        digimon.base_personality
                            ? `${digimon.name} (${digimon.base_personality})`
                            : digimon.name
                    }
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

            {/* Name will truncate instead of resizing container */}
            <span
                className="text-xs text-neutral-200 text-center truncate max-w-full"
                title={digimon.name}
            >
                {digimon.name}
            </span>

            {compact && (
                <span className="text-[12px] text-neutral-400">{digimon.stage}</span>
            )}
        </div>
    );
}

