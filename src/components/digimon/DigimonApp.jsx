import { useEffect, useState } from "react";
import { fetchDigimons } from "@lib/api/digimon.ts";
import SearchResults from "@components/digimon/SearchResults.jsx";
import EvolutionChain from "@components/digimon/EvolutionChain.jsx";

const stageOrder = {
    Baby: 0,
    "In-Training": 1,
    Rookie: 2,
    Champion: 3,
    Ultimate: 4,
    Mega: 5,
    Ultra: 6,
    Armor: 7,
};

const STORAGE_KEY = "digimon-team";

function encodeTeam(team) {
    const json = JSON.stringify(team);
    return btoa(json); // base64
}

function decodeTeam(str) {
    try {
        return JSON.parse(atob(str));
    } catch {
        return [];
    }
}

export default function DigimonApp() {
    const [digimons, setDigimons] = useState({});
    const [team, setTeam] = useState([]);
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchDigimons().then(setDigimons);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get("team");

        if (encoded) {
            setTeam(decodeTeam(encoded));
        } else {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setTeam(JSON.parse(saved));
                } catch {
                    console.warn("Invalid team in localStorage");
                }
            }
        }
    }, []);

    useEffect(() => {
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

        localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
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
            removeChain(index)
            return
        }

        const updated = [...team];
        updated[index] = newChain;
        setTeam(updated);
    }

    function removeChain(index) {
        setTeam(team.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            {showResults && (
                <div>
                    <SearchResults
                        query={query}
                        matches={matches}
                        onSelect={selectDigimon}
                    />
                    <p className="mt-2 text-xs text-neutral-500 text-center">
                        Click a Digimon to start a new chain
                    </p>
                </div>
            )}

            {/* Team section */}
            <div>
                <h2 className="text-lg font-semibold text-neutral-200 mb-3">
                    Your Team {team.length > 0 && `(${team.length})`}
                </h2>

                {team.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-neutral-600 rounded-lg text-center text-neutral-400">
                        No Digimon selected yet. Use the search above to start building your
                        team.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {team.map((chain, i) => (
                            <div
                                key={i}
                                className="p-2 rounded-lg bg-neutral-800 shadow-sm relative border border-neutral-700"
                            >
                                <button
                                    onClick={() => removeChain(i)}
                                    className="absolute cursor-pointer top-2 right-2 text-neutral-400 hover:text-violet-500 transition"
                                    title="Remove this chain"
                                >
                                    ✕
                                </button>
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
        </div>
    );
}
