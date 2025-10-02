import DigimonSlot from "@components/digimon/DigimonSlot.jsx";
import DigimonArrow from "@components/digimon/DigimonArrow.jsx";

export default function EvolutionChain({ digimons, chain, setChain }) {
    if (chain.length === 0) {
        return (
            <p className="text-neutral-400 text-center">
                No Digimon selected yet
            </p>
        );
    }

    const first = digimons[chain[0]];
    const last = digimons[chain[chain.length - 1]];

    const leftOptions =
        first?.pre_evolutions?.filter((id) => !chain.includes(id)) || [];
    const rightOptions =
        last?.evolutions?.filter((id) => !chain.includes(id)) || [];

    return (
        <div className="flex items-center justify-center gap-1">
            {/* Left */}
            {leftOptions.length > 0 && (
                <OptionColumn
                    ids={leftOptions}
                    digimons={digimons}
                    side="left"
                    onClick={(id) => setChain([id, ...chain])}
                />
            )}

            {/* Center */}
            <div className="flex items-center">
                {leftOptions.length > 0 && (
                    <div className="w-px h-22 mx-1 bg-neutral-700" />
                )}
                {chain.map((id, idx) => {
                    const d = digimons[id];
                    const isEnd = idx === 0 || idx === chain.length - 1;

                    return (
                        <div key={id} className="flex items-center gap-1">
                            <DigimonSlot
                                digimon={d}
                                inChain
                                index={idx}
                                isEnd={isEnd}
                                onClick={() =>
                                    isEnd && setChain(chain.filter((cid) => cid !== id))
                                }
                            />
                            {idx < chain.length - 1 && (
                                <DigimonArrow targetDigimon={digimons[chain[idx + 1]]} />
                            )}
                        </div>
                    );
                })}
                {rightOptions.length > 0 && (
                    <div className="w-px h-18 mx-1 bg-neutral-700" />
                )}
            </div>

            {/* Right */}
            {rightOptions.length > 0 && (
                <OptionColumn
                    ids={rightOptions}
                    digimons={digimons}
                    side="right"
                    onClick={(id) => setChain([...chain, id])}
                />
            )}
        </div>
    );
}

function OptionColumn({ ids, digimons, side, onClick }) {
    return (
        <div className="flex flex-col items-center gap-1">
            {ids.map((id) => (
                <DigimonSlot
                    key={id}
                    digimon={digimons[id]}
                    clickable
                    side={side}
                    onClick={() => onClick(id)}
                />
            ))}
        </div>
    );
}
