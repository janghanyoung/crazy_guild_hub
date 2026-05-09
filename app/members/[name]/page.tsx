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

  return (
    <PageContainer>
      <Link href="/members" className="text-sm text-zinc-400 hover:text-white">
        ← 길드원 목록
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-black">{characterName} 원정대</h1>
        <p className="mt-2 text-zinc-400">
          로스트아크 siblings API로 불러온 부캐 목록입니다.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="px-4 py-3">캐릭터명</th>
              <th className="px-4 py-3">직업</th>
              <th className="px-4 py-3">서버</th>
              <th className="px-4 py-3">전투 레벨</th>
              <th className="px-4 py-3">아이템 레벨</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {sortedSiblings.map((character) => (
              <tr key={character.CharacterName} className="hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-bold text-white">
                  {character.CharacterName}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {character.CharacterClassName}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {character.ServerName}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  Lv.{character.CharacterLevel}
                </td>
                <td className="px-4 py-3 font-bold text-violet-300">
                  {character.ItemAvgLevel}
                </td>
              </tr>
            ))}

            {sortedSiblings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  원정대 캐릭터를 불러오지 못했습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
