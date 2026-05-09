import Image from "next/image";
import Link from "next/link";
import PageContainer from "../../../components/ui/PageContainer";
import EquipmentGrid from "../../../components/character/EquipmentGrid";

type Profile = {
  CharacterImage?: string | null;
  CharacterName?: string;
  ServerName?: string;
  CharacterClassName?: string;
  CharacterLevel?: number;
  ItemAvgLevel?: string;
  ExpeditionLevel?: number;
  CombatPower?: string;
};

async function loaFetch<T>(path: string): Promise<T | null> {
  const apiKey = process.env.LOA_API_KEY;

  if (!apiKey) return null;

  const response = await fetch(
    `https://developer-lostark.game.onstove.com${path}`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${apiKey}`,
      },
      next: { revalidate: 1800 },
    }
  );

  if (!response.ok) return null;
  return response.json();
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const characterName = decodeURIComponent(name);
  const encodedName = encodeURIComponent(characterName);

  const [profile, equipment] = await Promise.all([
    loaFetch<Profile>(`/armories/characters/${encodedName}/profiles`),
    loaFetch<any[]>(`/armories/characters/${encodedName}/equipment`),
  ]);

  return (
    <PageContainer>
      <Link href="javascript:history.back()" className="text-sm text-zinc-400 hover:text-white">
        ← 뒤로
      </Link>

      <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]">
          <div className="relative h-96 bg-zinc-950">
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
            <p className="text-sm font-medium text-violet-300">
              {profile?.ServerName} · {profile?.CharacterClassName}
            </p>

            <h1 className="mt-2 text-4xl font-black">
              {profile?.CharacterName ?? characterName}
            </h1>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">전투 레벨</p>
                <p className="mt-2 text-xl font-black">
                  Lv.{profile?.CharacterLevel ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">아이템 레벨</p>
                <p className="mt-2 text-xl font-black text-violet-300">
                  {profile?.ItemAvgLevel ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">전투력</p>
                <p className="mt-2 text-xl font-black">
                  {profile?.CombatPower ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">원정대</p>
                <p className="mt-2 text-xl font-black">
                  Lv.{profile?.ExpeditionLevel ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EquipmentGrid equipments={equipment ?? []} />
    </PageContainer>
  );
}
