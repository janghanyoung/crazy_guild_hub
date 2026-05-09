import PageContainer from "../../../components/ui/PageContainer";
import {
  getRaid,
  getRaidParticipants,
} from "../../../lib/supabase/raids";
import RaidJoinForm from "./RaidJoinForm";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "일정 미정";

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export default async function RaidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const raid = await getRaid(id);

  if (!raid) {
    return (
      <PageContainer>
        <p className="text-zinc-400">레이드를 찾을 수 없습니다.</p>
      </PageContainer>
    );
  }

  const participants = await getRaidParticipants(id);

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-500/40 px-3 py-1 text-xs font-bold text-violet-300">
                {raid.raid_name}
              </span>

              {raid.difficulty && (
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  {raid.difficulty}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-black">{raid.title}</h1>

            <p className="mt-4 text-zinc-400">
              {formatDate(raid.raid_date)}
            </p>

            <div className="mt-8 rounded-xl bg-zinc-950 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                {raid.description || "설명 없음"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">참가자</h2>

              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                {participants.length} / {raid.max_players}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">
                      {participant.character_name}
                    </p>

                    {participant.role && (
                      <span className="rounded-full border border-violet-500/30 px-3 py-1 text-xs text-violet-300">
                        {participant.role}
                      </span>
                    )}
                  </div>

                  {participant.memo && (
                    <p className="mt-3 text-sm text-zinc-500">
                      {participant.memo}
                    </p>
                  )}
                </div>
              ))}

              {participants.length === 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500">
                  아직 신청자가 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>

        <RaidJoinForm raidId={id} />
      </div>
    </PageContainer>
  );
}