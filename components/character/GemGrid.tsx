type Gem = {
  Slot?: number;
  Name?: string;
  Icon?: string;
  Level?: number;
  Grade?: string;
  Tooltip?: string;
};

function getGemType(name?: string) {
  if (!name) return "보석";

  if (name.includes("멸화")) return "멸화";
  if (name.includes("홍염")) return "홍염";
  if (name.includes("겁화")) return "겁화";
  if (name.includes("작열")) return "작열";

  return "보석";
}

function getGemColor(type: string) {
  switch (type) {
    case "멸화":
      return "border-red-500/30 bg-red-950/20 text-red-300";
    case "홍염":
      return "border-blue-500/30 bg-blue-950/20 text-blue-300";
    case "겁화":
      return "border-purple-500/30 bg-purple-950/20 text-purple-300";
    case "작열":
      return "border-orange-500/30 bg-orange-950/20 text-orange-300";
    default:
      return "border-zinc-700 bg-zinc-900 text-zinc-300";
  }
}

export default function GemGrid({ gems }: { gems: Gem[] }) {
  if (!gems || gems.length === 0) return null;

  const sorted = [...gems].sort((a, b) => (b.Level ?? 0) - (a.Level ?? 0));

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="text-2xl font-black">보석</h2>

      <div className="mt-5 flex flex-wrap gap-3">
        {sorted.map((gem) => {
          const gemType = getGemType(gem.Name);
          const gemStyle = getGemColor(gemType);

          return (
            <div
              key={`${gem.Slot ?? gem.Name}-${gem.Name}`}
              className={`relative rounded-xl border p-2 ${gemStyle}`}
              title={gem.Name}
            >
              <img
                src={gem.Icon ?? ""}
                alt={gem.Name ?? "보석"}
                className="h-14 w-14 rounded-lg border border-zinc-700"
              />

              <p className="mt-2 text-center text-xs font-bold">{gemType}</p>

              <span className="absolute -bottom-1 -right-1 rounded bg-yellow-500 px-1.5 text-xs font-black text-black">
                {gem.Level ?? "-"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}