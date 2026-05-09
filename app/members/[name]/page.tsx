import Image from "next/image";
import Link from "next/link";
import PageContainer from "../../../components/ui/PageContainer";
import EquipmentGrid from "../../../components/character/EquipmentGrid";

type LostArkSibling = {
  ServerName: string;
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ItemMaxLevel: string;
};

type LostArkProfile = {
  CharacterImage?: string | null;
  CharacterName?: string;
  ServerName?: string;
  CharacterClassName?: string;
  CharacterLevel?: number;
  ItemAvgLevel?: string;
  ExpeditionLevel?: number;
  CombatPower?: string;
};

type CharacterDetail = LostArkSibling & {
  image?: string | null;
  combatPower?: string | null;
  expeditionLevel?: number | null;
  arkGridText?: string;
};

export const revalidate = 1800;

async function lostarkFetch<T>(path: string): Promise<T | null> {
  const apiKey = process.env.LOA_API_KEY;

  if (!apiKey) return null;

  const response = await fetch(
    `https://developer-lostark.game.onstove.com${path}`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${apiKey}`,
      },
      next: {
        revalidate: 1800,
        tags: [`lostark:${path}`],
      },
    }
  );

  if (!response.ok) return null;
  return response.json();
}

async function getSiblings(characterName: string): Promise<LostArkSibling[]> {
  const data = await lostarkFetch<LostArkSibling[]>(
    `/characters/${encodeURIComponent(characterName)}/siblings`
  );

  return data ?? [];
}

async function getProfile(characterName: string): Promise<LostArkProfile | null> {
  return lostarkFetch<LostArkProfile>(
    `/armories/characters/${encodeURIComponent(characterName)}/profiles`
  );
}

async function getCharacterData(characterName: string) {
  const apiKey = process.env.LOA_API_KEY;

  const response = await fetch(
    `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(
      characterName
    )}/equipment`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${apiKey}`,
      },
      next: {
        revalidate: 1800,
      },
    }
  );

  if (!response.ok) return [];

  return response.json();
}




async function getArkGrid(characterName: string) {
  return lostarkFetch<unknown>(
    `/armories/characters/${encodeURIComponent(characterName)}/arkgrid`
  );
}

function parseItemLevel(value: string) {
  return Number(value.replaceAll(",", ""));
}

function groupByServer(characters: CharacterDetail[]) {
  return characters.reduce<Record<string, CharacterDetail[]>>((acc, character) => {
    if (!acc[character.ServerName]) acc[character.ServerName] = [];
    acc[character.ServerName].push(character);
    return acc;
  }, {});
}

function summarizeArkGrid(data: unknown) {
  if (!data) return "아크그리드 정보 없음";

  if (typeof data === "object") {
    const text = JSON.stringify(data);

    if (text.length > 80) {
      return "아크그리드 정보 있음";
    }

    return text;
  }

  return String(data);
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const characterName = decodeURIComponent(name);

  const [siblings, equipments] = await Promise.all([
    getSiblings(characterName),
    getCharacterData(characterName),
  ]);

  const sortedSiblings = [...siblings].sort(
    (a, b) => parseItemLevel(b.ItemAvgLevel) - parseItemLevel(a.ItemAvgLevel)
  );

  const details = await Promise.all(
    sortedSiblings.map(async (character) => {
      const [profile, arkGrid] = await Promise.all([
        getProfile(character.CharacterName),
        getArkGrid(character.CharacterName),
      ]);

      return {
        ...character,
        image: profile?.CharacterImage ?? null,
        combatPower: profile?.CombatPower ?? null,
        expeditionLevel: profile?.ExpeditionLevel ?? null,
        arkGridText: summarizeArkGrid(arkGrid),
      };
    })
  );

  const groupedByServer = groupByServer(details);
<EquipmentGrid equipments={equipments} />
  return (
    
    <PageContainer>
      <Link href="/members" className="text-sm text-zinc-400 hover:text-white">
        ← 길드원 목록
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-violet-300">원정대 캐릭터</p>
        <h1 className="mt-2 text-3xl font-black">{characterName}</h1>
        <p className="mt-2 text-zinc-400">
          부캐 프로필 이미지, 전투력, 아크그리드 정보를 함께 불러옵니다.
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

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {characters.map((character) => {
                const isMain = character.CharacterName === characterName;

                return (
                  <Link
                    key={character.CharacterName}
                    href={`/characters/${encodeURIComponent(character.CharacterName)}`}
                    className={`overflow-hidden rounded-2xl border transition hover:-translate-y-1 ${
                      isMain
                        ? "border-violet-500/70 bg-violet-950/30"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="relative h-72 bg-zinc-950">
                      {character.image ? (
                        <Image
                          src={character.image}
                          alt={character.CharacterName}
                          fill
                          unoptimized
                          className="object-contain object-bottom"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-500">
                          이미지 없음
                        </div>
                      )}

                      {isMain && (
                        <span className="absolute right-4 top-4 rounded-full bg-violet-500/80 px-3 py-1 text-xs font-bold text-white">
                          대표
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-sm text-zinc-500">
                        {character.CharacterClassName}
                      </p>

                      <h3 className="mt-1 text-2xl font-black text-white">
                        {character.CharacterName}
                      </h3>

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

                        <div className="rounded-xl bg-zinc-950/80 p-3">
                          <p className="text-zinc-500">전투력</p>
                          <p className="mt-1 font-bold text-zinc-100">
                            {character.combatPower ?? "-"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-zinc-950/80 p-3">
                          <p className="text-zinc-500">원정대 레벨</p>
                          <p className="mt-1 font-bold text-zinc-100">
                            Lv.{character.expeditionLevel ?? "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                        <p className="text-xs text-zinc-500">아크그리드</p>
                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {character.arkGridText}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {details.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center text-zinc-500">
            원정대 캐릭터를 불러오지 못했습니다.
          </div>
        )}
      </div>
    </PageContainer>
  );
}