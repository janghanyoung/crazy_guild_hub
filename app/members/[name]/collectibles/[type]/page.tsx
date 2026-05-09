import Link from "next/link";
import PageContainer from "../../../../../components/ui/PageContainer";
import CollectibleSummary from "../../../../../components/character/CollectibleSummary";
import { getGuidesByTarget } from "../../../../../lib/supabase/guides";

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

export const dynamic = "force-dynamic";

function getVal<T>(
  obj: Record<string, unknown>,
  upper: string,
  lower: string
): T | undefined {
  return (obj[upper] ?? obj[lower]) as T | undefined;
}

function normalizeMaxPoint(value: unknown) {
  const n = Number(value ?? 1);
  return n > 0 ? n : 1;
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
      cache: "no-store",
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
    const itemType = getVal<string>(
      item as Record<string, unknown>,
      "Type",
      "type"
    );

    return itemType === collectibleType;
  });

  const selectedRecord = selected as Record<string, unknown> | undefined;

  const point = Number(
    selectedRecord
      ? getVal<number>(selectedRecord, "Point", "point") ?? 0
      : 0
  );

  const maxPoint = Number(
    selectedRecord
      ? getVal<number>(selectedRecord, "MaxPoint", "maxPoint") ?? 0
      : 0
  );

  const icon = selectedRecord
    ? getVal<string>(selectedRecord, "Icon", "icon")
    : undefined;

  const detailRows = selectedRecord
    ? getVal<CollectiblePoint[]>(
        selectedRecord,
        "CollectiblePoints",
        "collectiblePoints"
      ) ?? []
    : [];

  const incompleteRows = detailRows.filter((row) => {
    const rowRecord = row as Record<string, unknown>;

    const rowPoint = Number(
      getVal<number>(rowRecord, "Point", "point") ?? 0
    );

    const rawMaxPoint = getVal<number>(rowRecord, "MaxPoint", "maxPoint");

    const rowMaxPoint = normalizeMaxPoint(rawMaxPoint);

    return rowPoint < rowMaxPoint;
  });

  const guides = await getGuidesByTarget({
    category: "collectible",
    targetType: collectibleType,
  });

  const guideMap = new Map(
    guides.map((guide) => [guide.target_name, guide])
  );

  const percent = maxPoint > 0 ? Math.round((point / maxPoint) * 100) : 0;
  const remain = Math.max(maxPoint - point, 0);

  const summaryCollectibles = collectibles.map((item) => ({
    Type:
      getVal<string>(item as Record<string, unknown>, "Type", "type") ?? "",
    Icon:
      getVal<string>(item as Record<string, unknown>, "Icon", "icon") ?? "",
    Point: Number(
      getVal<number>(item as Record<string, unknown>, "Point", "point") ?? 0
    ),
    MaxPoint: Number(
      getVal<number>(item as Record<string, unknown>, "MaxPoint", "maxPoint") ??
        0
    ),
  }));

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
        collectibles={summaryCollectibles}
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
            <h2 className="text-xl font-black">미획득 상세 현황</h2>
            <p className="mt-2 text-sm text-zinc-400">
              아직 완료하지 못한 항목만 모아 보여줍니다.
            </p>
          </div>

          <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
            미획득 {incompleteRows.length}개
          </span>
        </div>

        <div className="space-y-3">
          {incompleteRows.map((row) => {
            const rowRecord = row as Record<string, unknown>;

            const rowName =
              getVal<string>(rowRecord, "PointName", "pointName") ??
              "이름 없음";

            const rowPoint = Number(
              getVal<number>(rowRecord, "Point", "point") ?? 0
            );

            const rawMaxPoint = getVal<number>(
              rowRecord,
              "MaxPoint",
              "maxPoint"
            );

            const rowMaxPoint = normalizeMaxPoint(rawMaxPoint);

            const rowPercent =
              rowMaxPoint > 0
                ? Math.round((rowPoint / rowMaxPoint) * 100)
                : 0;

            const guide = guideMap.get(rowName);

            return (
              <article
                key={rowName}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-violet-500/40"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-white">{rowName}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {rowPoint} / {rowMaxPoint}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-sm font-black text-orange-300">
                      {rowPercent}%
                    </p>

                    {guide ? (
                      <Link
                        href={`/guides/${guide.id}`}
                        className="rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/10"
                      >
                        공략 보기
                      </Link>
                    ) : (
                      <Link
                        href={`/guides/new?category=collectible&targetType=${encodeURIComponent(
                          collectibleType
                        )}&targetName=${encodeURIComponent(rowName)}`}
                        className="rounded-lg border border-violet-500/40 px-3 py-1.5 text-xs font-bold text-violet-300 transition hover:bg-violet-500/10"
                      >
                        공략 작성
                      </Link>

                      



                    )}
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${rowPercent}%` }}
                  />
                </div>
              </article>
            );
          })}

          {incompleteRows.length === 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-6 text-center text-sm text-emerald-300">
              모든 항목을 완료했습니다.
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}