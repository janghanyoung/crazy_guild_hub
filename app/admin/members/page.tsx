import Link from "next/link";
import PageContainer from "../../../components/ui/PageContainer";
import SectionTitle from "../../../components/ui/SectionTitle";
import { guildMembers } from "../../../lib/data/guild-members";

export default function AdminMembersPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="길드원 관리"
        description="대표 캐릭터명을 기준으로 길드원을 관리합니다."
      />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-black">현재 등록된 대표 캐릭터</h2>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {guildMembers.map((member) => (
            <div
              key={member}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <p className="font-bold text-white">{member}</p>

              <Link
                href={`/members/${encodeURIComponent(member)}`}
                className="mt-3 inline-block text-sm text-violet-300 hover:text-violet-200"
              >
                원정대 보기 →
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-4 text-sm text-yellow-200">
          현재는 mock 데이터 방식입니다.
          <br />
          다음 단계에서 Supabase 저장 기능과 관리자 입력창이 추가됩니다.
        </div>
      </div>
    </PageContainer>
  );
}
