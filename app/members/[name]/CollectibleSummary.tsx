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
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-black">수집형 포인트</h2>
        <p className="mt-2 text-sm text-zinc-400">
          원정대 기준 내실 진행도입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collectibles.map((item) => {
  const percent =
    item.MaxPoint > 0
      ? Math.round((item.Point / item.MaxPoint) * 100)
      : 0;

  const remain = item.MaxPoint - item.Point;

  let progressColor = "bg-red-500";

  if (percent >= 90) {
    progressColor = "bg-emerald-500";
  } else if (percent >= 70) {
    progressColor = "bg-yellow-500";
  } else if (percent >= 40) {
    progressColor = "bg-orange-500";
  }

  return (
    <article
      key={item.Type}
      className="group rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-violet-500/40"
    >
      <div className="flex items-center gap-3">
        <img
          src={item.Icon}
          alt={item.Type}
          className="h-11 w-11 rounded-lg"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate font-bold text-white">
              {item.Type}
            </h3>

            <p className="text-sm font-black text-violet-300">
              {percent}%
            </p>
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {item.Point} / {item.MaxPoint}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all ${progressColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>
            진행도 {percent}%
          </span>

          <span>
            남음 {remain}
          </span>
        </div>
      </div>
    </article>
  );
})}
      </div>
    </section>
  );
}
