type Gem = {
  Slot?: number;
  Name?: string;
  Icon?: string;
  Level?: number;
  Grade?: string;
  Tooltip?: string;
};

export default function GemGrid({ gems }: { gems: Gem[] }) {
  if (!gems || gems.length === 0) return null;

  const sorted = [...gems].sort((a, b) => (b.Level ?? 0) - (a.Level ?? 0));

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="text-2xl font-black">보석</h2>

      <div className="mt-5 flex flex-wrap gap-3">
        {sorted.map((gem) => (
          <div key={`${gem.Slot ?? gem.Name}-${gem.Name}`} className="relative">
            <img
              src={gem.Icon ?? ""}
              alt={gem.Name ?? "보석"}
              className="h-14 w-14 rounded-lg border border-zinc-700"
              title={gem.Name}
            />
            <span className="absolute -bottom-1 -right-1 rounded bg-yellow-500 px-1.5 text-xs font-black text-black">
              {gem.Level}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
