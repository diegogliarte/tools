import { useState, useEffect, useRef } from "react";
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
    const [showPersonality, setShowPersonality] = useState(false);
    const tooltipRef = useRef(null);
    const typeIcon = typeIconFor(digimon.type);

    const reqs = digimon.requirements || [];
    const dnaReqs = reqs.filter(
        (r) => /Jogress|Partner|[\(\)]/.test(r) && !r.includes("Digi-Egg")
    );
    const eggReqs = reqs.filter((r) => /Digi-?Egg/i.test(r));
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
        compact ? "cursor-pointer" : "cursor-help"
    }`;
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

    const pressTimer = useRef(null);

    const handleTouchStart = (e) => {
        e.preventDefault();
        setShowPersonality(false);
        pressTimer.current = setTimeout(() => setShowPersonality(true), 450);
    };

    const handleTouchEnd = () => {
        clearTimeout(pressTimer.current);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
                setShowPersonality(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div
            className={`flex flex-col items-center gap-0.5 ${
                compact
                    ? "cursor-pointer hover:bg-neutral-700 rounded p-1 transition"
                    : ""
            } w-20 relative`}
            onClick={compact ? onClick : undefined}
            ref={tooltipRef}
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
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onContextMenu={handleContextMenu}
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
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onContextMenu={handleContextMenu}
                    />
                )}

                {!compact && badgeProps && <Badge {...badgeProps} />}
            </div>

            <span
                className="text-xs text-neutral-200 text-center truncate max-w-full cursor-pointer"
                title={digimon.name}
                onClick={() => setShowPersonality((prev) => !prev)}
            >
                {digimon.name}
            </span>

            {showPersonality && digimon.base_personality && (
                <div className="absolute top-full mt-1 px-2 py-1 text-[11px] bg-neutral-800 text-white rounded shadow-lg z-10">
                    {digimon.base_personality}
                </div>
            )}

            {compact && (
                <span className="text-[12px] text-neutral-400">
                    {digimon.stage}
                </span>
            )}
        </div>
    );
}
