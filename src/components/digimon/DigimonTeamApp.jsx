import { useEffect, useRef, useState } from "react";
import { fetchDigimons } from "@lib/api/digimon.ts";
import oldDigimons from "@lib/data/digimon_data_old.json";
import SearchResults from "@components/digimon/SearchResults.jsx";
import EvolutionChain from "@components/digimon/EvolutionChain.jsx";

const stageOrder = {
    "In-Training I": 0,
    "In-Training II": 1,
    Rookie: 2,
    Champion: 3,
    Ultimate: 4,
    Mega: 5,
    Ultra: 6,
    Armor: 7,
};

const STORAGE_KEY = "digimon-team";
const TEAM_VERSION = "v2";

function migrateOldTeam(oldTeam, oldDigimons, newDigimons) {
    const normalizeData = (data) => (Array.isArray(data) ? data : Object.values(data));
    const normalizeName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newList = normalizeData(newDigimons);
    const oldList = normalizeData(oldDigimons);

    const nameToNewId = Object.fromEntries(newList.map((d) => [normalizeName(d.name), d.id]));
    const oldIdToName = Object.fromEntries(oldList.map((d) => [d.id, d.name]));

    return oldTeam.map((chain) =>
        chain
            .map((oldId) => {
                const oldName = oldIdToName[oldId];
                if (!oldName) return null;
                const normalized = normalizeName(oldName);
                const newId = nameToNewId[normalized];
                if (!newId) {
                    console.warn(`⚠️ No match for ${oldName} → skipped`);
                    return null;
                }
                return newId;
            })
            .filter(Boolean)
    );
}

function encodeTeam(team) {
    const json = JSON.stringify(team);
    const base64 = btoa(json);
    return `${TEAM_VERSION}:${base64}`;
}

function decodeTeam(str, newDigimons) {
    try {
        if (str.startsWith(`${TEAM_VERSION}:`)) {
            const base64 = str.slice(TEAM_VERSION.length + 1);
            return JSON.parse(atob(base64));
        }
        const oldTeam = JSON.parse(atob(str));
        return migrateOldTeam(oldTeam, oldDigimons, newDigimons);
    } catch (err) {
        console.warn("❌ Failed to decode or migrate team", err);
        return [];
    }
}

export default function DigimonTeamApp() {
    const [digimons, setDigimons] = useState({});
    const [team, setTeam] = useState([]);
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const decodedOnce = useRef(false);
    const itemRefs = useRef(new Map());

    useEffect(() => {
        fetchDigimons().then(setDigimons);
    }, []);

    useEffect(() => {
        if (!digimons || Object.keys(digimons).length === 0) return;
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get("team");
        let decoded = [];

        if (encoded) decoded = decodeTeam(encoded, digimons);
        else {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) decoded = decodeTeam(saved, digimons);
        }

        const allIds = new Set(Object.keys(digimons).map(Number));
        const cleanedTeam = (decoded || []).filter((chain) => {
            if (!Array.isArray(chain) || chain.length === 0) return false;
            const valid = chain.every((id) => allIds.has(id));
            if (!valid) console.warn("⚠️ Removing invalid chain:", chain);
            return valid;
        });

        if (cleanedTeam.length > 0) setTeam(cleanedTeam);
        else {
            setTeam([]);
            localStorage.removeItem(STORAGE_KEY);
            const url = new URL(window.location.href);
            url.searchParams.delete("team");
            window.history.replaceState({}, "", url);
        }
        decodedOnce.current = true;
    }, [digimons]);

    useEffect(() => {
        if (!decodedOnce.current) return;
        const url = new URL(window.location.href);
        if (team.length === 0) {
            url.searchParams.delete("team");
            window.history.replaceState({}, "", url);
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        const encoded = encodeTeam(team);
        url.searchParams.set("team", encoded);
        window.history.replaceState({}, "", url);
        localStorage.setItem(STORAGE_KEY, encoded);
    }, [team]);

    useEffect(() => {
        const input = document.getElementById("digimon-search");
        if (!input) return;
        function handleInput(e) {
            setQuery(e.target.value);
            setShowResults(true);
        }
        input.value = query;
        input.addEventListener("input", handleInput);
        return () => input.removeEventListener("input", handleInput);
    }, [query]);

    useEffect(() => {
        function handleButtonClick(e) {
            const action = e.target?.dataset?.action;
            if (!action) return;

            switch (action) {
                case "random-team":
                    generateRandomTeam();
                    break;
                default:
                    console.warn(`⚠️ Unknown button action: ${action}`);
            }
        }

        document.addEventListener("click", handleButtonClick);

        return () => {
            document.removeEventListener("click", handleButtonClick);
        };
    }, [digimons]);

    useEffect(() => {
        const title = document.getElementById("team-title");
        if (!title) return;
        title.textContent = `Your Team (${team.length})`;
    }, [team]);


    const matches = Object.values(digimons)
        .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => {
            const sa = stageOrder[a.stage] ?? 999;
            const sb = stageOrder[b.stage] ?? 999;
            if (sa !== sb) return sa - sb;
            return a.name.localeCompare(b.name);
        });

    function selectDigimon(d) {
        setTeam([...team, [d.id]]);
        setQuery("");
        setShowResults(false);
    }

    function updateChain(index, newChain) {
        if (newChain.length === 0) {
            removeChain(index);
            return;
        }
        const updated = [...team];
        updated[index] = newChain;
        setTeam(updated);
    }

    function removeChain(index) {
        setTeam(team.filter((_, i) => i !== index));
    }

    function animateReorder(oldRects) {
        const newRects = new Map();
        itemRefs.current.forEach((node, key) => {
            if (node) newRects.set(key, node.getBoundingClientRect());
        });
        newRects.forEach((newRect, key) => {
            const oldRect = oldRects.get(key);
            if (!oldRect) return;
            const dy = oldRect.top - newRect.top;
            if (dy) {
                const el = itemRefs.current.get(key);
                el.style.transform = `translateY(${dy}px)`;
                el.style.transition = "transform 0s";
                requestAnimationFrame(() => {
                    el.style.transform = "";
                    el.style.transition = "transform 150ms";
                });
            }
        });
    }

    function moveChainUp(index) {
        if (index === 0) return;
        const oldRects = new Map();
        itemRefs.current.forEach((node, key) => {
            if (node) oldRects.set(key, node.getBoundingClientRect());
        });
        const updated = [...team];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        setTeam(updated);
        requestAnimationFrame(() => animateReorder(oldRects));
    }

    function moveChainDown(index) {
        if (index === team.length - 1) return;
        const oldRects = new Map();
        itemRefs.current.forEach((node, key) => {
            if (node) oldRects.set(key, node.getBoundingClientRect());
        });
        const updated = [...team];
        [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
        setTeam(updated);
        requestAnimationFrame(() => animateReorder(oldRects));
    }

    function generateRandomTeam() {
        if (!digimons || Object.keys(digimons).length === 0) return;

        const all = Object.values(digimons);
        const byId = Object.fromEntries(all.map((d) => [d.id, d]));
        const inTraining = all.filter((d) => d.stage === "In-Training I");

        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        function buildChain(start) {
            const chain = [start.id];
            let current = start;
            const visited = new Set([current.id]);
            console.log(current)
            while (Array.isArray(current.evolutions) && current.evolutions.length > 0) {
                const nextId = getRandom(current.evolutions);
                if (visited.has(nextId) || !byId[nextId]) break;
                current = byId[nextId];
                visited.add(current.id);
                chain.push(current.id);
            }
            return chain;
        }

        const randomChains = [];
        const teamSize = 6;
        while (randomChains.length < teamSize) {
            const start = getRandom(inTraining);
            randomChains.push(buildChain(start));
        }

        setTeam(randomChains);
        setShowResults(false);
        setQuery("");
    }

    return (
        <div className="space-y-6">
            {showResults && (
                <div>
                    <SearchResults query={query} matches={matches} onSelect={selectDigimon} />
                    <p className="mt-2 text-xs text-neutral-500 text-center">
                        Click a Digimon to start a new chain
                    </p>
                </div>
            )}

            {team.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-neutral-600 rounded-lg text-center text-neutral-400">
                    No Digimon selected yet. Use the search above or the Random button to start building your team.
                </div>
            ) : (
                <div className="grid gap-4 relative">
                    {team.map((chain, i) => (
                        <div
                            key={`${chain.join("-")}-${i}`}
                            ref={(el) => itemRefs.current.set(`${chain.join("-")}-${i}`, el)}
                            className="p-2 rounded-lg bg-neutral-800 shadow-sm relative border border-neutral-700 transition-transform duration-300"
                        >
                            <button
                                onClick={() => removeChain(i)}
                                className="absolute top-2 right-2 text-neutral-400 hover:text-violet-500 transition cursor-pointer"
                                title="Remove this chain"
                            >
                                ✕
                            </button>

                            <div className="absolute left-1 top-0 flex flex-col gap-1">
                                {i > 0 && (
                                    <button
                                        onClick={() => moveChainUp(i)}
                                        className="text-neutral-400 hover:text-violet-400 transition cursor-pointer"
                                        title="Move up"
                                    >
                                        ↑
                                    </button>
                                )}
                                {i < team.length - 1 && (
                                    <button
                                        onClick={() => moveChainDown(i)}
                                        className="text-neutral-400 hover:text-violet-400 transition cursor-pointer"
                                        title="Move down"
                                    >
                                        ↓
                                    </button>
                                )}
                            </div>

                            <EvolutionChain
                                digimons={digimons}
                                chain={chain}
                                setChain={(newChain) => updateChain(i, newChain)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
