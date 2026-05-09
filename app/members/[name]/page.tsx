import Link from "next/link";
import PageContainer from "../../../components/ui/PageContainer";

type LostArkSibling = {
  ServerName: string;
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ItemMaxLevel: string;
};

async function getSiblings(characterName: string): Promise<LostArkSibling[]> {
  const apiKey = process.env.LOA_API_KEY;

  const response = await fetch(
    `https://developer-lostark.game.onstove.com/characters/${encodeURIComponent(
      characterName
    )}/siblings`,
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

function parseItemLevel(value: string) {
  return Number(value.replaceAll(",", ""));
}

function groupByServer(characters: LostArkSibling[]) {
  return characters.reduce<Record<string, LostArkSibling[]>>((acc, character) => {
    if (!acc[character.ServerName]) {
      acc[character.ServerName] = [];
    }

    acc[character.ServerName].push(character);
    return acc;
  }, {});
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const characterName = decodeURIComponent(name);

  const siblings = await getSiblings(characterName);

  const sortedSiblings = [...siblings].sort(
    (a, b) => parseItemLevel(b.ItemAvgLevel) - parseItemLevel(a.ItemAvgLevel)
  );

  const groupedByServer = groupByServer(sortedSiblings);

  return (
    <PageContainer>
      <Link href="/members" className="text-sm text-zinc-400 hover:text-white">
        ← 길드원 목록
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-violet-300">원정대 캐릭터</p>
        <h1 className="mt-2 text-3xl font-black">{characterName}</h1>
        <p className="mt-2 text-zinc-400">
          서버별로 정렬한 원정대 부캐 목록입니다.
        </p>
      </div>

      <div className="mt-8 space-y-10">
        {Object.entries(groupedByServer).map(([serverName, characters]) => (
          <section key={serverName}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-2xl font-black">{serverName}</h2>
              <span className="rounded-full border border-zinc-800 px-3 py-1 text-sm text-zinc-400">
                {characters.length}캐릭터
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {characters.map((character) => {
                const isMain = character.CharacterName === characterName;

                return (
                  <article
                    key={character.CharacterName}
                    className={`rounded-2xl border p-5 transition hover:-translate-y-1 ${
                      isMain
                        ? "border-violet-500/70 bg-violet-950/30"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-zinc-500">
                          {character.CharacterClassName}
                        </p>
                        <h3 className="mt-1 text-xl font-black text-white">
                          {character.CharacterName}
                        </h3>
                      </div>

                      {isMain && (
                        <span className="shrink-0 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-200">
                          대표
                        </span>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-zinc-950/80 p-3">
                        <p className="text-zinc-500">전투 레벨</p>
                        <p className="mt-1 font-bold text-zinc-100">
                          Lv.{character.CharacterLevel}
                        </p>
                      </div>

                      <div className="rounded-xl bg-zinc-950/80 p-3">
                        <p className="text-zinc-500">아이템 레벨</p>
                        <p className="mt-1 font-bold text-violet-300">
                          {character.ItemAvgLevel}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {sortedSiblings.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center text-zinc-500">
            원정대 캐릭터를 불러오지 못했습니다.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
