
import Link from "next/link";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { getGuides } from "../../lib/supabase/guides";

const categoryLabel: Record<string, string> = {
  raid: "레이드",
  collectible: "내실",
  achievement: "업적",
  general: "일반",
};


export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionTitle
          title="공략집"
          description="레이드, 내실, 업적 공략을 모아둡니다."
        />

        <Link
          href="/guides/new"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
        >
          공략 작성
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.id}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:-translate-y-1 hover:border-violet-500/50"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                {categoryLabel[guide.category] ?? guide.category}
              </span>

              {guide.target_type && (
                <span className="truncate text-xs text-violet-300">
                  {guide.target_type}
                </span>
              )}
            </div>

            <h2 className="mt-4 text-xl font-black text-white">
              {guide.title}
            </h2>

            {guide.target_name && (
              <p className="mt-2 text-sm text-zinc-400">
                대상: {guide.target_name}
              </p>
            )}

            <p className="mt-4 line-clamp-3 text-sm text-zinc-500">
              {guide.content || "내용 없음"}
            </p>
          </Link>
        ))}

        {guides.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center text-zinc-500 md:col-span-2 xl:col-span-3">
            아직 작성된 공략이 없습니다.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
