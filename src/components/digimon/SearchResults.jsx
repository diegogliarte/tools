import DigimonSlot from "@components/digimon/DigimonSlot.jsx";

export default function SearchResults({ query, matches, onSelect }) {
    if (!query || matches.length === 0) {
        return (
            <ul className="mt-2 space-y-2 text-neutral-300">
                <li className="text-neutral-500 italic col-span-full">
                    {!query ? "Start typing to search Digimon..." : "No Digimon found"}
                </li>
            </ul>
        );
    }

    return (
        <ul className="flex flex-wrap gap-3 justify-center mt-2">
            {matches.slice(0, 50).map((d) => (
                <DigimonSlot
                    key={d.id}
                    digimon={d}
                    compact
                    onClick={() => onSelect(d)}
                />
            ))}
        </ul>
    );
}
