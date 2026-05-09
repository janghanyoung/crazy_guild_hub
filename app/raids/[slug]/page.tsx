import Link from "next/link";
import PageContainer from "../../../components/ui/PageContainer";
import { getRaidMasterBySlug } from "../../../lib/supabase/raidMaster";
import { supabase } from "../../../lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function RaidHubDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const raid = await getRaidMasterBySlug(slug);

  if (!raid) {
    return (
      <PageContainer>
        <p className="text-zinc-400">레이드를 찾을 수 없습니다.</p>
      </PageContainer>
    );
  }

  const [{ data: guides }, { data: raidPosts }] = await Promise.all([
    supabase
      .from("guides")
      .select("*")
      .eq("target_type", "raid")
      .eq("target_name", raid.slug)
      .order("created_at", { ascending: false }),

    supabase
      .from("raids")
      .select("*")
      .eq("raid_master_id", raid.id)
      .order("raid_date", { ascending: true }),
  ]);

  return (
    <PageContainer>
      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60">
        <div className="relative h-72 overflow-hidden bg-zinc-950">
          {raid.image_url ? (
            <img
              src={raid.image_url}
              alt={raid.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl font-black text-zinc-700">
              RAID
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <div className="absolute bottom-8 left-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-orange-500/40 bg-black/40 px-3 py-1 text-xs font-bold text-orange-300 backdrop-blur">
                입장 Lv. {raid.min_item_level ?? 0}
              </span>

              <span className="rounded-full border border-zinc-700 bg-black/40 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
                최대 {raid.max_players ?? 8}인
              </span>
            </div>

            <h1 className="mt-4 text-5xl font-black text-white">
              {raid.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">
              {raid.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 p-8 xl:grid-cols-[1fr_0.9fr]">
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">레이드 공략</h2>

              <Link
                href={`/guides/new?category=raid&targetType=raid&targetName=${raid.slug}`}
                className="rounded-xl border border-violet-500/40 px-4 py-2 text-sm font-bold text-violet-300 hover:bg-violet-500/10"
              >
                공략 작성
              </Link>
            </div>

            <div className="space-y-4">
              {guides?.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.id}`}
                  className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-violet-500/40"
                >
                  <h3 className="text-lg font-black text-white">
                    {guide.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                    {guide.content}
                  </p>
                </Link>
              ))}

              {!guides?.length && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500">
                  아직 등록된 공략이 없습니다.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">모집중인 공대</h2>

              <Link
                href={`/raids/new?raid=${raid.slug}`}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500"
              >
                모집 생성
              </Link>
            </div>

            <div className="space-y-4">
              {raidPosts?.map((post) => (
                <Link
                  key={post.id}
                  href={`/raid-posts/${post.id}`}
                  className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-violet-500/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-white">
                      {post.title}
                    </h3>

                    <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                      {post.difficulty}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-400">
                    모집 인원 {post.max_players}명
                  </p>
                </Link>
              ))}

              {!raidPosts?.length && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500">
                  현재 모집중인 공대가 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}