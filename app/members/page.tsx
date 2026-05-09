import Image from "next/image";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import Link from "next/link";

import { getGuildMembers } from "../../lib/supabase/guild-members";

type LostArkProfile = {
  CharacterImage?: string | null;
  CharacterName?: string;
  ServerName?: string;
  CharacterClassName?: string;
  ItemAvgLevel?: string;
  ExpeditionLevel?: number;
};

async function getProfile(characterName: string) {
  const apiKey = process.env.LOA_API_KEY;

  const response = await fetch(
    `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(characterName)}/profiles`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${apiKey}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}


export default async function MembersPage() {
  const members = await getGuildMembers();
  const profiles = await Promise.all(
    members.map((member) => getProfile(member.main_character))
);

  return (
    <PageContainer>
      <SectionTitle
        title="길드원"
        description="오늘도 즐거운 로아생활 되세요."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile, index) => {
          const fallbackName = members[index]?.main_character ?? "Unknown";

          if (!profile) {
            return (
              <article
                key={fallbackName}
                className="rounded-2xl border border-red-900/60 bg-red-950/30 p-5"
              >
                <h3 className="text-xl font-bold">{fallbackName}</h3>
                <p className="mt-2 text-sm text-red-300">
                  API 조회 실패. 캐릭터명 또는 API 키를 확인해야 합니다.
                </p>
              </article>
            );
          }

          return (
             <Link
             key={profile.CharacterName}
             href={`/members/${encodeURIComponent(profile.CharacterName ?? fallbackName)}`}
             className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition hover:-translate-y-1 hover:border-violet-500/60"
             >
              <div className="relative h-80 bg-zinc-950">
                {profile.CharacterImage ? (
                  <Image
                    src={profile.CharacterImage}
                    alt={profile.CharacterName ?? "캐릭터 이미지"}
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

              <div className="p-5">
                <h3 className="text-2xl font-black">
                  {profile.CharacterName}
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  {profile.ServerName} · {profile.CharacterClassName}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-zinc-950 p-3">
                    <p className="text-zinc-500">아이템 레벨</p>
                    <p className="mt-1 font-bold">
                      {profile.ItemAvgLevel ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-950 p-3">
                    <p className="text-zinc-500">원정대 레벨</p>
                    <p className="mt-1 font-bold">
                      Lv.{profile.ExpeditionLevel ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
