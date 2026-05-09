type Collectible = {
  Type: string;
  Icon: string;
  Point: number;
  MaxPoint: number;
};

export default function CollectibleSummary({
  collectibles,
}: {
  collectibles: Collectible[];
}) {
  if (!collectibles || collectibles.length === 0) return null;

  return (
    <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black">내실 요약</h2>
          <p className="mt-1 text-xs text-zinc-500">원정대 수집형 포인트</p>
        </div>

        <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
          {collectibles.length}종
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {collectibles.map((item) => {
          const point = Number(item.Point ?? 0);
          const maxPoint = Number(item.MaxPoint ?? 0);

          const percent =
            maxPoint > 0 ? Math.round((point / maxPoint) * 100) : 0;

          let textColor = "text-red-300";

          if (percent >= 90) {
            textColor = "text-emerald-300";
          } else if (percent >= 70) {
            textColor = "text-yellow-300";
          } else if (percent >= 40) {
            textColor = "text-orange-300";
          }

          return (
            <div
              key={item.Type}
              title={`${item.Type}: ${point} / ${maxPoint} (${percent}%)`}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <img
                src={item.Icon}
                alt={item.Type}
                className="h-6 w-6 rounded"
              />

              <div className="leading-none">
                <p className="max-w-20 truncate text-[11px] text-zinc-500">
                  {item.Type}
                </p>
                <p className={`mt-1 text-sm font-black ${textColor}`}>
                  {point}
                  <span className="ml-1 text-[10px] font-medium text-zinc-500">
                    / {maxPoint}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}