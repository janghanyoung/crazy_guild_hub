"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export default function RaidJoinForm({ raidId }: { raidId: string }) {
  const router = useRouter();

  const [characterName, setCharacterName] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [role, setRole] = useState("딜러");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("guild_main_character");

    if (savedName) {
      setCharacterName(savedName);
    }
  }, []);

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

    const { error } = await supabase.from("raid_participants").insert({
      raid_id: raidId,
      guild_member_id: member.id,
      character_name: member.main_character,
      role,
      memo,
    });

    setLoading(false);

    if (error) {
      if (
        error.message.includes("duplicate") ||
        error.code === "23505"
      ) {
        alert("이미 신청한 레이드입니다.");
        return;
      }

      alert(error.message);
      return;
    }

    localStorage.setItem("guild_main_character", member.main_character);

    alert("레이드 신청 완료");
    setPinCode("");
    setMemo("");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="text-xl font-black">레이드 신청</h2>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-bold text-zinc-300">
            대표 캐릭터명
          </label>
          <input
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="대표 캐릭터명"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">PIN 번호</label>
          <input
            type="password"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="PIN 번호"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">역할</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          >
            <option>딜러</option>
            <option>서포터</option>
            <option>버스</option>
            <option>학원생</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            placeholder="가능 시간, 캐릭터 변경 요청 등"
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={loading}
          className="h-12 w-full rounded-xl bg-violet-600 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "신청 중..." : "레이드 신청"}
        </button>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        한 번 신청하면 이 브라우저에 대표 캐릭터명이 저장됩니다.
      </p>
    </div>
  );
}