import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchDigimons } from "@lib/api/digimon.ts";
import SearchResults from "@components/digimon/SearchResults.jsx";
import DigimonSlot from "@components/digimon/DigimonSlot.jsx";
import DigimonArrow from "@components/digimon/DigimonArrow.jsx";

export default function DigimonRouterApp() {
    const [digimons, setDigimons] = useState({});
    const [queryStart, setQueryStart] = useState("");
    const [queryEnd, setQueryEnd] = useState("");
    const [showStartResults, setShowStartResults] = useState(false);
    const [showEndResults, setShowEndResults] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [pendingStart, setPendingStart] = useState(null);
    const [pendingEnd, setPendingEnd] = useState(null);

    useEffect(() => {
        fetchDigimons().then(setDigimons);
    }, []);

    // Input listeners
    useEffect(() => {
        const input = document.getElementById("digimon-start");
        if (!input) return;
        const handle = (e) => {
            setQueryStart(e.target.value);
            setShowStartResults(true);
        };
        input.addEventListener("input", handle);
        return () => input.removeEventListener("input", handle);
    }, []);

    useEffect(() => {
        const input = document.getElementById("digimon-end");
        if (!input) return;
        const handle = (e) => {
            setQueryEnd(e.target.value);
            setShowEndResults(true);
        };
        input.addEventListener("input", handle);
        return () => input.removeEventListener("input", handle);
    }, []);

    const matchesStart = Object.values(digimons).filter((d) =>
        d.name.toLowerCase().includes(queryStart.toLowerCase())
    );
    const matchesEnd = Object.values(digimons).filter((d) =>
        d.name.toLowerCase().includes(queryEnd.toLowerCase())
    );

    // --- Pathfinding ---
    function buildGraph() {
        const graph = {};
        for (const d of Object.values(digimons)) {
            graph[d.id] = new Set([
                ...(d.evolutions || []),
                ...(d.pre_evolutions || []),
            ]);
        }
        return graph;
    }

    function findShortestPath(startId, endId, blocked = []) {
        if (!startId || !endId) return [];

        const { blockedStages, blockedTypes, agentRank } = getSpecialBlocks();
        const graph = buildGraph();
        const blockedSet = new Set(blocked);
        const queue = [[startId]];
        const visited = new Set([startId]);

        while (queue.length) {
            const path = queue.shift();
            const node = path[path.length - 1];
            if (node === endId) return path;

            for (const neighbor of graph[node] || []) {
                const digimon = digimons[neighbor];
                if (!digimon) continue;

                const stageBlocked = blockedStages.includes(digimon.stage);
                const typeBlocked = blockedTypes.some(t =>
                    digimon.type.toLowerCase().includes(t.toLowerCase())
                );

                const exceedsRank = digimon.requirements?.some(r => {
                    const match = r.match(/Agent Rank >= (\d+)/);
                    return match && agentRank < Number(match[1]);
                });

                if (
                    !visited.has(neighbor) &&
                    !blockedSet.has(neighbor) &&
                    !stageBlocked &&
                    !typeBlocked &&
                    !exceedsRank
                ) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }
        return [];
    }

    function finalizeRoute(start, end) {
        const path = findShortestPath(start.id, end.id);
        setRoutes((prev) => [...prev, { start, end, path, blocked: [] }]);
        setPendingStart(null);
        setPendingEnd(null);
        setQueryStart("");
        setQueryEnd("");
        const sInput = document.getElementById("digimon-start");
        const eInput = document.getElementById("digimon-end");
        if (sInput) sInput.value = "";
        if (eInput) eInput.value = "";
    }

    function removeRoute(index) {
        setRoutes(routes.filter((_, i) => i !== index));
    }

    // 🧱 Toggle blocked Digimon for a specific route + recalc path
    function toggleBlocked(routeIndex, digimonId) {
        setRoutes((prev) =>
            prev.map((r, i) => {
                if (i !== routeIndex) return r;

                const blocked = r.blocked.includes(digimonId)
                    ? r.blocked.filter((id) => id !== digimonId)
                    : [...r.blocked, digimonId];

                const newPath = findShortestPath(r.start.id, r.end.id, blocked);

                return { ...r, blocked, path: newPath };
            })
        );
    }

    function getSpecialBlocks() {
        const stageCheckboxes = document.querySelectorAll('[id^="stage-"]');
        const typeCheckboxes = document.querySelectorAll('[id^="type-"]');

        const blockedStages = Array.from(stageCheckboxes)
            .filter(cb => !cb.checked)
            .map(cb => cb.labels?.[0]?.innerText || cb.id.replace("stage-", ""));

        const blockedTypes = Array.from(typeCheckboxes)
            .filter(cb => !cb.checked)
            .map(cb => cb.labels?.[0]?.innerText || cb.id.replace("type-", ""));

        const rankInput = document.getElementById("agent-rank");
        let agentRank = rankInput ? Number(rankInput.value) : Infinity;
        if (!rankInput || rankInput.value === "") agentRank = Infinity;

        return { blockedStages, blockedTypes, agentRank };
    }

    useEffect(() => {
        const recalcAllRoutes = () => {
            setRoutes(prev =>
                prev.map(route => ({
                    ...route,
                    path: findShortestPath(route.start.id, route.end.id, route.blocked),
                }))
            );
        };

        const checkboxes = document.querySelectorAll(
            '[id^="stage-"], [id^="type-"]'
        );
        const rankInput = document.getElementById("agent-rank");

        checkboxes.forEach(cb => cb.addEventListener("change", recalcAllRoutes));
        if (rankInput) rankInput.addEventListener("input", recalcAllRoutes);

        return () => {
            checkboxes.forEach(cb => cb.removeEventListener("change", recalcAllRoutes));
            if (rankInput) rankInput.removeEventListener("input", recalcAllRoutes);
        };
    }, [digimons]);

    // --- JSX ---
    return (
        <div className="space-y-10">
            {/* 🔍 Search dropdowns anchored under inputs */}
            {showStartResults &&
                createPortal(
                    <div className="absolute top-full left-0 w-full mt-1 z-20 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg p-2">
                        <button
                            onClick={() => setShowStartResults(false)}
                            className="absolute cursor-pointer top-1 right-2 text-neutral-400 hover:text-violet-500 transition"
                            title="Close"
                        >
                            ✕
                        </button>
                        <SearchResults
                            query={queryStart}
                            matches={matchesStart}
                            onSelect={(d) => {
                                setQueryStart("");
                                setShowStartResults(false);

                                const input = document.getElementById("digimon-start");
                                if (input) input.value = "";

                                // Allow selecting Start or End in any order
                                if (pendingEnd) {
                                    finalizeRoute(d, pendingEnd);
                                } else {
                                    setPendingStart(d);
                                }
                            }}
                            maxDigimons={10}
                        />
                    </div>,
                    document.getElementById("start-column")
                )}

            {showEndResults &&
                createPortal(
                    <div className="absolute top-full left-0 w-full mt-1 z-20 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg p-2">
                        <button
                            onClick={() => setShowEndResults(false)}
                            className="absolute cursor-pointer top-1 right-2 text-neutral-400 hover:text-violet-500 transition"
                            title="Close"
                        >
                            ✕
                        </button>
                        <SearchResults
                            query={queryEnd}
                            matches={matchesEnd}
                            onSelect={(d) => {
                                setQueryEnd("");
                                setShowEndResults(false);

                                const input = document.getElementById("digimon-end");
                                if (input) input.value = "";

                                // Allow selecting End or Start in any order
                                if (pendingStart) {
                                    finalizeRoute(pendingStart, d);
                                } else {
                                    setPendingEnd(d);
                                }
                            }}
                            maxDigimons={10}
                        />
                    </div>,
                    document.getElementById("end-column")
                )}

            {/* 🧭 Currently selected start & end */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center text-center">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-neutral-400">Start Digimon</span>
                    {pendingStart ? (
                        <DigimonSlot digimon={pendingStart} />
                    ) : (
                        <span className="text-xs text-neutral-500 italic">
                            None selected
                        </span>
                    )}
                </div>

                <DigimonArrow targetDigimon={null} />

                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-neutral-400">End Digimon</span>
                    {pendingEnd ? (
                        <DigimonSlot digimon={pendingEnd} />
                    ) : (
                        <span className="text-xs text-neutral-500 italic">
                            None selected
                        </span>
                    )}
                </div>
            </div>

            {/* 🧭 Route Visualization */}
            <div className="space-y-6">
                {
                    routes.map((route, i) => {
                        const hasPath = route.path.length > 0;

                        return (
                            <div
                                key={i}
                                className="relative border border-neutral-700 rounded-lg bg-neutral-800 p-4 flex flex-col items-center"
                            >
                                <button
                                    onClick={() => removeRoute(i)}
                                    className="absolute cursor-pointer top-2 right-2 text-neutral-400 hover:text-violet-500 transition"
                                    title="Remove this route"
                                >
                                    ✕
                                </button>

                                <h3 className="text-neutral-300 font-semibold mb-3 text-center">
                                    {route.start?.name} → {route.end?.name}
                                </h3>

                                {hasPath ? (
                                    <div className="flex flex-wrap justify-center items-center gap-1">
                                        {route.path.map((id, idx) => {
                                            const digimon = digimons[id];
                                            const nextId = route.path[idx + 1];
                                            const next = digimons[nextId];
                                            if (!digimon) return null;

                                            const isEvolution = !!(
                                                digimon &&
                                                Array.isArray(digimon.evolutions) &&
                                                digimon.evolutions.includes(nextId)
                                            );
                                            const isBlocked = route.blocked.includes(id);

                                            return (
                                                <div key={id} className="flex items-center gap-1">
                                                    <div
                                                        className={`${
                                                            isBlocked
                                                                ? "opacity-40"
                                                                : "cursor-pointer hover:opacity-75"
                                                        }`}
                                                        onClick={() => toggleBlocked(i, id)}
                                                        title={
                                                            isBlocked
                                                                ? "Unblock this Digimon"
                                                                : "Block this Digimon"
                                                        }
                                                    >
                                                        <DigimonSlot digimon={digimon} />
                                                    </div>

                                                    {idx < route.path.length - 1 && next && (
                                                        <DigimonArrow
                                                            targetDigimon={next}
                                                            direction={isEvolution ? "evolution" : "deevolution"}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 mt-2">
                                        <div className="flex items-center gap-2">
                                            <DigimonSlot digimon={route.start} />
                                            <DigimonArrow targetDigimon={null} />
                                            <DigimonSlot digimon={route.end} />
                                        </div>
                                        <p className="text-red-400 text-sm">
                                            No valid path available with current blocked Digimon.
                                        </p>
                                    </div>
                                )}

                                {/* Blocked Digimons */}
                                {route.blocked.length > 0 && (
                                    <div className="mt-3 text-sm text-neutral-400">
                                        <span className="italic">Blocked Digimon:</span>
                                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                                            {route.blocked.map((id) => (
                                                <div
                                                    key={id}
                                                    className="transform grayscale scale-80 opacity-60 cursor-pointer hover:opacity-100 transition"
                                                    onClick={() => toggleBlocked(i, id)}
                                                    title="Unblock this Digimon"
                                                >
                                                    <DigimonSlot
                                                        digimon={digimons[id]}
                                                        compact
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}
