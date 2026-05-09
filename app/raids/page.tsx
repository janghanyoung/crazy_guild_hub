import Link from "next/link";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { getRaidMasters } from "../../lib/supabase/raidMaster";

export const dynamic = "force-dynamic";

const typeLabel: Record<string, string> = {
  guardian: "가디언 토벌",
  abyss: "어비스 던전",
  legion: "군단장 레이드",
  epic: "에픽 레이드",
  shadow: "그림자 레이드",
  kazeros: "카제로스 레이드",
};

export default async function RaidsPage() {
  const raids = await getRaidMasters();

  const grouped = Object.entries(
    raids.reduce<Record<string, typeof raids>>((acc, raid) => {
      if (!acc[raid.raid_type]) {
        acc[raid.raid_type] = [];
      }

      acc[raid.raid_type].push(raid);

      return acc;
    }, {})
  );

  return (
    <PageContainer>
      <div className="flex items-end justify-between">
        <SectionTitle
          title="레이드 허브"
          description="레이드 공략과 모집글을 확인할 수 있습니다."
        />

        <Link
          href="/admin/raids/new"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500"
        >
          새 레이드 등록
        </Link>
      </div>

      <div className="space-y-12">
        {grouped.map(([type, typeRaids]) => (
          <section key={type}>
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-3xl font-black">
                {typeLabel[type] ?? type}
              </h2>

              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                {typeRaids.length}개
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {typeRaids.map((raid) => (
                <Link
                  key={raid.id}
                  href={`/raids/${raid.slug}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition hover:-translate-y-1 hover:border-violet-500/50"
                >
                  <div className="relative h-48 overflow-hidden bg-zinc-950">
                    {raid.image_url ? (
                      <img
                        src={raid.image_url}
                        alt={raid.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        RAID
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute bottom-4 left-4">
                      <p className="text-3xl font-black text-white">
                        {raid.name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <p className="line-clamp-2 text-sm leading-6 text-zinc-400">
                      {raid.description || "설명 없음"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {raid.difficulties
                        ?.sort((a, b) => a.sort_order - b.sort_order)
                        .map((difficulty) => (
                          <div
                            key={difficulty.id}
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2"
                          >
                            <p className="text-xs text-zinc-500">
                              {difficulty.difficulty}
                            </p>

                            <p className="mt-1 text-sm font-black text-orange-300">
                              Lv. {difficulty.min_item_level}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}