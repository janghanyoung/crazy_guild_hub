"use client";

import { useEffect, useState } from "react";
import PageContainer from "../../../components/ui/PageContainer";
import SectionTitle from "../../../components/ui/SectionTitle";
import { supabase } from "../../../lib/supabase/client";

type GuildMember = {
  id: string;
  main_character: string;
  guild_name: string | null;
  server_name: string | null;
};

export default function AdminMembersPage() {
  const [characterName, setCharacterName] = useState("");
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadMembers() {
    const { data } = await supabase
      .from("guild_members")
      .select("*")
      .order("created_at", { ascending: true });

    setMembers(data ?? []);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleAddMember() {
    if (!characterName.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/lostark/profile/${encodeURIComponent(characterName)}`
      );

      if (!response.ok) {
        alert("캐릭터 조회 실패");
        return;
      }

      const profile = await response.json();

      const { error } = await supabase.from("guild_members").insert({
        main_character: profile.CharacterName,
        guild_name: profile.GuildName,
        server_name: profile.ServerName,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setCharacterName("");
      await loadMembers();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await supabase
      .from("guild_members")
      .delete()
      .eq("id", id);

    await loadMembers();
  }

  return (
    <PageContainer>
      <SectionTitle
        title="길드원 관리"
        description="대표 캐릭터를 등록하면 길드원 페이지에 자동 표시됩니다."
      />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="대표 캐릭터명 입력"
            className="h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 outline-none focus:border-violet-500"
          />

          <button
            onClick={handleAddMember}
            disabled={loading}
            className="h-12 rounded-xl bg-violet-600 px-6 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "등록중..." : "길드원 추가"}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <article
              key={member.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <p className="text-xl font-black text-white">
                {member.main_character}
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                {member.server_name} · {member.guild_name}
              </p>

              <button
                onClick={() => handleDelete(member.id)}
                className="mt-5 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/30"
              >
                삭제
              </button>
            </article>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}