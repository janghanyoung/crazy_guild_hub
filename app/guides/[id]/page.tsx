import Link from "next/link";
import PageContainer from "../../../components/ui/PageContainer";
import { getGuide } from "../../../lib/supabase/guides";

const categoryLabel: Record<string, string> = {
  raid: "레이드 공략",
  collectible: "내실 공략",
  achievement: "업적 공략",
  general: "일반 공략",
};

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await getGuide(id);

  if (!guide) {
    return (
      <PageContainer>
        <p className="text-zinc-400">공략을 찾을 수 없습니다.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link href="/guides" className="text-sm text-zinc-400 hover:text-white">
        ← 공략집
      </Link>

      <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
            {categoryLabel[guide.category] ?? guide.category}
          </span>

          {guide.target_type && (
            <span className="rounded-full border border-violet-500/40 px-3 py-1 text-xs text-violet-300">
              {guide.target_type}
            </span>
          )}

          {guide.target_name && (
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
              {guide.target_name}
            </span>
          )}
        </div>

        <h1 className="mt-5 text-3xl font-black">{guide.title}</h1>

        {guide.video_url && (
          <a
            href={guide.video_url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"
          >
            영상 보기
          </a>
        )}

        <div className="mt-8 whitespace-pre-wrap rounded-2xl bg-zinc-950 p-5 text-sm leading-7 text-zinc-200">
          {guide.content || "내용 없음"}
        </div>
      </article>
    </PageContainer>
  );
}
