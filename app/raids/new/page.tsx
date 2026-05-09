"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PageContainer from "../../../components/ui/PageContainer";
import SectionTitle from "../../../components/ui/SectionTitle";
import { supabase } from "../../../lib/supabase/client";

const raidOptions = [
  "발탄",
  "비아키스",
  "쿠크세이튼",
  "아브렐슈드",
  "일리아칸",
  "상아탑",
  "카멘",
  "에키드나",
  "베히모스",
  "카제로스",
  "지평의 성당",
];

const difficultyOptions = ["노말", "하드", "헬", "싱글"];

export default function NewRaidPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [raidName, setRaidName] = useState(raidOptions[0]);
  const [difficulty, setDifficulty] = useState(difficultyOptions[0]);
  const [raidDate, setRaidDate] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [minItemLevel, setMinItemLevel] = useState(1640);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("raids")
      .insert({
        title,
        raid_name: raidName,
        difficulty,
        raid_date: raidDate || null,
        max_players: maxPlayers,
        min_item_level: minItemLevel,
        description,
      })
      .select("id")
      .single();

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/raids/${data.id}`);
  }

  return (
    <PageContainer>
      <SectionTitle
        title="레이드 모집 작성"
        description="입장 레벨을 설정하면 신청 가능한 캐릭터만 표시됩니다."
      />

      <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 토요일 지평의 성당 8인"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <select
            value={raidName}
            onChange={(e) => setRaidName(e.target.value)}
            className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          >
            {raidOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          >
            {difficultyOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <input
          type="datetime-local"
          value={raidDate}
          onChange={(e) => setRaidDate(e.target.value)}
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            min={1}
            max={16}
            placeholder="최대 인원"
            className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />

          <input
            type="number"
            value={minItemLevel}
            onChange={(e) => setMinItemLevel(Number(e.target.value))}
            min={0}
            placeholder="최소 입장 아이템 레벨"
            className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          placeholder="레이드 설명"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
        />

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="h-12 rounded-xl bg-violet-600 px-6 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "레이드 생성"}
        </button>
      </div>
    </PageContainer>
  );
}