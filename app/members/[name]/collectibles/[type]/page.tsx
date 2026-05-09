import Link from "next/link";
import PageContainer from "../../../../../components/ui/PageContainer";
import CollectibleSummary from "../../../../../components/character/CollectibleSummary";

type Collectible = {
  Type: string;
  Icon: string;
  Point: number;
  MaxPoint: number;
};

export const revalidate = 1800;

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
  const selected = collectibles.find((item) => item.Type === collectibleType);

  const point = Number(selected?.Point ?? 0);
  const maxPoint = Number(selected?.MaxPoint ?? 0);
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
        collectibles={collectibles}
        characterName={characterName}
      />

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-center gap-4">
          {selected?.Icon && (
            <img
              src={selected.Icon}
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
        <h2 className="text-xl font-black">상세 현황</h2>
        <p className="mt-3 text-sm text-zinc-400">
          현재 공식 API 기준으로는 수집형 포인트의 총합/최대치만 표시합니다.
          지역별 상세 현황은 추후 별도 DB 또는 수동 공략 데이터와 연결할 수 있습니다.
        </p>
      </section>
    </PageContainer>
  );
}
