import Link from "next/link";
import PageContainer from "../../../../../components/ui/PageContainer";
import CollectibleSummary from "../../../../../components/character/CollectibleSummary";

type CollectiblePoint = {
  PointName?: string;
  pointName?: string;
  Point?: number;
  point?: number;
  MaxPoint?: number;
  maxPoint?: number;
};

type Collectible = {
  Type?: string;
  type?: string;
  Icon?: string;
  icon?: string;
  Point?: number;
  point?: number;
  MaxPoint?: number;
  maxPoint?: number;
  CollectiblePoints?: CollectiblePoint[];
  collectiblePoints?: CollectiblePoint[];
};

export const revalidate = 1800;

function getVal<T>(obj: Record<string, unknown>, upper: string, lower: string): T | undefined {
  return (obj[upper] ?? obj[lower]) as T | undefined;
}

async function getCollectibles(characterName: string): Promise<Collectible[]> {
  const apiKey = process.env.LOA_API_KEY;

  if (!apiKey) return [];

  const response = await fetch(
    `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(
      characterName
    )}/collectibles`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${apiKey}`,
      },
      next: { revalidate: 1800 },
    }
  );

  if (!response.ok) return [];
  return response.json();
}

export default async function CollectibleDetailPage({
  params,
}: {
  params: Promise<{ name: string; type: string }>;
}) {
  const { name, type } = await params;

  const characterName = decodeURIComponent(name);
  const collectibleType = decodeURIComponent(type);

  const collectibles = await getCollectibles(characterName);

  const selected = collectibles.find((item) => {
    const itemType = getVal<string>(item as Record<string, unknown>, "Type", "type");
    return itemType === collectibleType;
  });

  const selectedRecord = selected as Record<string, unknown> | undefined;

  const point = Number(
    selectedRecord ? getVal<number>(selectedRecord, "Point", "point") ?? 0 : 0
  );

  const maxPoint = Number(
    selectedRecord ? getVal<number>(selectedRecord, "MaxPoint", "maxPoint") ?? 0 : 0
  );

  const icon = selectedRecord
    ? getVal<string>(selectedRecord, "Icon", "icon")
    : undefined;

  const detailRows =
    selectedRecord
      ? getVal<CollectiblePoint[]>(
          selectedRecord,
          "CollectiblePoints",
          "collectiblePoints"
        ) ?? []
      : [];

  const percent = maxPoint > 0 ? Math.round((point / maxPoint) * 100) : 0;
  const remain = Math.max(maxPoint - point, 0);

  return (
    <PageContainer>
      <Link
        href={`/members/${encodeURIComponent(characterName)}`}
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← 원정대 페이지
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-violet-300">내실 상세</p>
        <h1 className="mt-2 text-3xl font-black">{collectibleType}</h1>
        <p className="mt-2 text-zinc-400">
          {characterName} 원정대 기준 수집형 포인트 현황입니다.
        </p>
      </div>

      <CollectibleSummary
        collectibles={collectibles.map((item) => ({
          Type: getVal<string>(item as Record<string, unknown>, "Type", "type") ?? "",
          Icon: getVal<string>(item as Record<string, unknown>, "Icon", "icon") ?? "",
          Point: Number(
            getVal<number>(item as Record<string, unknown>, "Point", "point") ?? 0
          ),
          MaxPoint: Number(
            getVal<number>(item as Record<string, unknown>, "MaxPoint", "maxPoint") ?? 0
          ),
        }))}
        characterName={characterName}
      />

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-center gap-4">
          {icon && (
            <img
              src={icon}
              alt={collectibleType}
              className="h-14 w-14 rounded-xl"
            />
          )}

          <div>
            <h2 className="text-2xl font-black">{collectibleType}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              현재 {point}개 / 총 {maxPoint}개
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">현재 진행도</p>
            <p className="mt-2 text-2xl font-black text-violet-300">
              {percent}%
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">획득</p>
            <p className="mt-2 text-2xl font-black">{point}</p>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">전체</p>
            <p className="mt-2 text-2xl font-black">{maxPoint}</p>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">남은 개수</p>
            <p className="mt-2 text-2xl font-black text-orange-300">
              {remain}
            </p>
          </div>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-violet-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">상세 현황</h2>
            <p className="mt-2 text-sm text-zinc-400">
              로스트아크 API의 CollectiblePoints 기준입니다.
            </p>
          </div>

          <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
            {detailRows.length}개 항목
          </span>
        </div>

        <div className="space-y-3">
          {detailRows.map((row) => {
            const rowRecord = row as Record<string, unknown>;

            const rowName =
              getVal<string>(rowRecord, "PointName", "pointName") ?? "이름 없음";

            const rowPoint = Number(
              getVal<number>(rowRecord, "Point", "point") ?? 0
            );

            const rowMaxPoint = Number(
              getVal<number>(rowRecord, "MaxPoint", "maxPoint") ?? 0
            );

            const rowPercent =
              rowMaxPoint > 0
                ? Math.round((rowPoint / rowMaxPoint) * 100)
                : 0;

            const isComplete = rowMaxPoint > 0 && rowPoint >= rowMaxPoint;

            return (
              <article
                key={rowName}
                className={`rounded-xl border p-4 ${
                  isComplete
                    ? "border-emerald-500/20 bg-emerald-950/10"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-white">{rowName}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {rowPoint} / {rowMaxPoint}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-black ${
                      isComplete ? "text-emerald-300" : "text-violet-300"
                    }`}
                  >
                    {rowPercent}%
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${
                      isComplete ? "bg-emerald-500" : "bg-violet-500"
                    }`}
                    style={{ width: `${rowPercent}%` }}
                  />
                </div>
              </article>
            );
          })}

          {detailRows.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-500">
              상세 항목이 없습니다.
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}