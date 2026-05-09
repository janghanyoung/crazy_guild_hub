import Link from "next/link";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { getRaids } from "../../lib/supabase/raids";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "일정 미정";

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export default async function RaidsPage() {
  const raids = await getRaids();

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionTitle
          title="레이드 허브"
          description="길드 레이드 모집과 공략을 관리합니다."
        />

        <Link
          href="/raids/new"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
        >
          레이드 모집 작성
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {raids.map((raid) => (
          <Link
            key={raid.id}
            href={`/raids/${raid.id}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:-translate-y-1 hover:border-violet-500/50"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-500/40 px-3 py-1 text-xs font-bold text-violet-300">
                {raid.raid_name}
              </span>

              {raid.difficulty && (
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  {raid.difficulty}
                </span>
              )}

              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                {raid.status === "recruiting" ? "모집중" : "마감"}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-black text-white">
              {raid.title}
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              {formatDate(raid.raid_date)}
            </p>

            <p className="mt-4 line-clamp-2 text-sm text-zinc-500">
              {raid.description || "설명 없음"}
            </p>
          </Link>
        ))}

        {raids.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center text-zinc-500 xl:col-span-2">
            아직 등록된 레이드 모집이 없습니다.
          </div>
        )}
      </div>
    </PageContainer>
  );
}