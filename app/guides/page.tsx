import Link from "next/link";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { getGuides } from "../../lib/supabase/guides";

export const dynamic = "force-dynamic";

const categoryLabel: Record<string, string> = {
  raid: "레이드",
  collectible: "내실",
  achievement: "업적",
  general: "일반",
};

const categoryDescription: Record<string, string> = {
  raid: "레이드 기믹, 관문, 패턴 공략",
  collectible: "섬마, 모코코, 세계수 등 내실 공략",
  achievement: "히든 업적, 전투 업적, 생활 업적 공략",
  general: "기타 길드 팁과 자유 공략",
};

const categoryOrder = ["raid", "collectible", "achievement", "general"];

export default async function GuidesPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params?.category ?? "all";

  const guides = await getGuides();

  const filteredGuides =
    selectedCategory === "all"
      ? guides
      : guides.filter((guide) => guide.category === selectedCategory);

  const counts = guides.reduce<Record<string, number>>((acc, guide) => {
    acc[guide.category] = (acc[guide.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionTitle
          title="공략집"
          description="레이드, 내실, 업적 공략을 분류별로 확인합니다."
        />

        <Link
          href="/guides/new"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
        >
          공략 작성
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Link
          href="/guides"
          className={`rounded-2xl border p-5 transition ${
            selectedCategory === "all"
              ? "border-violet-500 bg-violet-950/30"
              : "border-zinc-800 bg-zinc-900/60 hover:border-violet-500/40"
          }`}
        >
          <p className="text-lg font-black text-white">전체</p>
          <p className="mt-2 text-sm text-zinc-400">모든 공략</p>
          <p className="mt-4 text-2xl font-black text-violet-300">
            {guides.length}
          </p>
        </Link>

        {categoryOrder.map((category) => (
          <Link
            key={category}
            href={`/guides?category=${category}`}
            className={`rounded-2xl border p-5 transition ${
              selectedCategory === category
                ? "border-violet-500 bg-violet-950/30"
                : "border-zinc-800 bg-zinc-900/60 hover:border-violet-500/40"
            }`}
          >
            <p className="text-lg font-black text-white">
              {categoryLabel[category]}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
              {categoryDescription[category]}
            </p>
            <p className="mt-4 text-2xl font-black text-violet-300">
              {counts[category] ?? 0}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">
              {selectedCategory === "all"
                ? "전체 공략"
                : `${categoryLabel[selectedCategory] ?? selectedCategory} 공략`}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {filteredGuides.length}개의 공략이 있습니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGuides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.id}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:-translate-y-1 hover:border-violet-500/50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-violet-500/40 px-3 py-1 text-xs font-bold text-violet-300">
                  {categoryLabel[guide.category] ?? guide.category}
                </span>

                {guide.target_type && (
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                    {guide.target_type}
                  </span>
                )}
              </div>

              <h3 className="mt-4 line-clamp-2 text-xl font-black text-white">
                {guide.title}
              </h3>

              {guide.target_name && (
                <p className="mt-2 text-sm text-zinc-400">
                  대상: {guide.target_name}
                </p>
              )}

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-500">
                {guide.content || "내용 없음"}
              </p>
            </Link>
          ))}

          {filteredGuides.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center text-zinc-500 md:col-span-2 xl:col-span-3">
              해당 분류의 공략이 없습니다.
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}