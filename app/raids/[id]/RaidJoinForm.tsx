"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export default function RaidJoinForm({
  raidId,
}: {
  raidId: string;
}) {
  const router = useRouter();

  const [characterName, setCharacterName] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [role, setRole] = useState("딜러");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!characterName.trim()) {
      alert("대표 캐릭터명을 입력하세요.");
      return;
    }

    if (!pinCode.trim()) {
      alert("PIN 번호를 입력하세요.");
      return;
    }

    setLoading(true);

    const { data: member, error: memberError } = await supabase
      .from("guild_members")
      .select("*")
      .eq("main_character", characterName)
      .eq("pin_code", pinCode)
      .single();

    if (memberError || !member) {
      setLoading(false);
      alert("대표 캐릭터명 또는 PIN 번호가 올바르지 않습니다.");
      return;
    }

    const { error } = await supabase
      .from("raid_participants")
      .insert({
        raid_id: raidId,
        guild_member_id: member.id,
        character_name: member.main_character,
        role,
        memo,
      });

    setLoading(false);

    if (error) {
      if (error.message.includes("duplicate")) {
        alert("이미 신청한 레이드입니다.");
        return;
      }

      alert(error.message);
      return;
    }

    alert("레이드 신청 완료");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="text-xl font-black">레이드 신청</h2>

      <div className="mt-5 space-y-4">
        <input
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          placeholder="대표 캐릭터명"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <input
          type="password"
          value={pinCode}
          onChange={(e) => setPinCode(e.target.value)}
          placeholder="PIN 번호"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        >
          <option>딜러</option>
          <option>서포터</option>
          <option>버스</option>
          <option>학원생</option>
        </select>

        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          placeholder="메모"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
        />

        <button
          onClick={handleJoin}
          disabled={loading}
          className="h-12 w-full rounded-xl bg-violet-600 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "신청 중..." : "레이드 신청"}
        </button>
      </div>
    </div>
  );
}