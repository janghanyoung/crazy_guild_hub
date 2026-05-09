import Image from "next/image";
import Link from "next/link";
import PageContainer from "../../../components/ui/PageContainer";

type LostArkProfile = {
  CharacterImage?: string | null;
  CharacterName?: string;
  ServerName?: string;
  CharacterClassName?: string;
  ItemAvgLevel?: string;
  ExpeditionLevel?: number;
};

type LostArkSibling = {
  ServerName: string;
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ItemMaxLevel: string;
};

async function getProfile(characterName: string): Promise<LostArkProfile | null> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/lostark/profile/${encodeURIComponent(characterName)}`,
    { cache: "no-store" }
  );

  if (!response.ok) return null;
  return response.json();
}

async function getSiblings(characterName: string): Promise<LostArkSibling[]> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/lostark/siblings/${encodeURIComponent(characterName)}`,
    { cache: "no-store" }
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

  const [profile, siblings] = await Promise.all([
    getProfile(characterName),
    getSiblings(characterName),
  ]);

  const sortedSiblings = [...siblings].sort(
    (a, b) => parseItemLevel(b.ItemAvgLevel) - parseItemLevel(a.ItemAvgLevel)
  );

  return (
    <PageContainer>
      <Link href="/members" className="text-sm text-zinc-400 hover:text-white">
        ← 길드원 목록
      </Link>

      <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]">
          <div className="relative h-96 bg-zinc-950 lg:h-full">
            {profile?.CharacterImage ? (
              <Image
                src={profile.CharacterImage}
                alt={profile.CharacterName ?? characterName}
                fill
                unoptimized
                className="object-contain object-bottom"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                이미지 없음
              </div>
            )}
          </div>

          <div className="p-8">
            <p className="text-sm font-medium text-violet-300">대표 캐릭터</p>
            <h1 className="mt-2 text-4xl font-black">
              {profile?.CharacterName ?? characterName}
            </h1>

            <p className="mt-3 text-zinc-400">
              {profile?.ServerName ?? "-"} · {profile?.CharacterClassName ?? "-"}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">아이템 레벨</p>
                <p className="mt-2 text-xl font-black">
                  {profile?.ItemAvgLevel ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">원정대 레벨</p>
                <p className="mt-2 text-xl font-black">
                  Lv.{profile?.ExpeditionLevel ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">부캐 수</p>
                <p className="mt-2 text-xl font-black">
                  {sortedSiblings.length}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">서버</p>
                <p className="mt-2 text-xl font-black">
                  {profile?.ServerName ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">원정대 캐릭터</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Lost Ark siblings API 기준입니다.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800">
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
      </section>
    </PageContainer>
  );
}
