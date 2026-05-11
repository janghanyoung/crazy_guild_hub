import Link from "next/link";
import PageContainer from "../../../components/ui/PageContainer";
import { getGuide } from "../../../lib/supabase/guides";
import MarkdownViewer from "../../../components/guides/MarkdownViewer";
import DeleteGuideButton from "./DeleteGuideButton";

export const dynamic = "force-dynamic";

const categoryLabel: Record<string, string> = {
  raid: "레이드 공략",
  collectible: "내실 공략",
  achievement: "업적 공략",
  general: "일반 공략",
};

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    return url;
  } catch {
    return url;
  }
}

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
        <div className="mt-4 space-y-2 text-sm">
  {guide.creator_character && (
    <div className="text-yellow-400">
      최초 작성자:
      <span className="ml-2 font-bold">
        {guide.creator_character}
      </span>
    </div>
  )}

  {guide.contributors &&
    guide.contributors.length > 0 && (
      <div className="text-zinc-400">
        기여자:
        <span className="ml-2">
          {guide.contributors.join(", ")}
        </span>
      </div>
    )}
</div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/guides/${guide.id}/edit`}
            className="rounded-xl border border-violet-500/40 px-4 py-2 text-sm font-bold text-violet-300 hover:bg-violet-500/10"
          >
            공략 수정
          </Link>

          <DeleteGuideButton guideId={guide.id} />
        </div>

        {guide.video_url && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
            <div className="aspect-video">
              <iframe
                src={getYoutubeEmbedUrl(guide.video_url)}
                title="공략 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-zinc-950 p-5">
          <MarkdownViewer content={guide.content} />
        </div>
      </article>
    </PageContainer>
  );
}