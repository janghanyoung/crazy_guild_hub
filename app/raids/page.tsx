import Link from "next/link";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { getRaidMasters } from "../../lib/supabase/raidMaster";

export const dynamic = "force-dynamic";

export default async function RaidsPage() {
  const raids = await getRaidMasters();

  return (
    <PageContainer>
      <SectionTitle
        title="레이드 허브"
        description="레이드 공략과 모집글을 확인할 수 있습니다."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {raids.map((raid) => (
          <Link
            key={raid.id}
            href={`/raids/${raid.slug}`}
            className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition hover:-translate-y-1 hover:border-violet-500/50"
          >
            <div className="relative h-44 overflow-hidden bg-zinc-950">
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
                <p className="text-2xl font-black text-white">
                  {raid.name}
                </p>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-orange-500/40 px-3 py-1 text-xs font-bold text-orange-300">
                  입장 Lv. {raid.min_item_level ?? 0}
                </span>

                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  최대 {raid.max_players ?? 8}인
                </span>
              </div>

              <p className="line-clamp-2 text-sm leading-6 text-zinc-400">
                {raid.description || "설명 없음"}
              </p>
            </div>
          </Link>
        ))}

        {raids.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center text-zinc-500 md:col-span-2 xl:col-span-3">
            등록된 레이드가 없습니다.
          </div>
        )}
      </div>
    </PageContainer>
  );
}