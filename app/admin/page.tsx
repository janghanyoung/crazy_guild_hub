"use client";

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PageContainer from "@/components/ui/PageContainer";
import SectionTitle from "@/components/ui/SectionTitle";
import { supabase } from "@/lib/supabase/client";


function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "");
}

export default function NewRaidMasterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [raidType, setRaidType] = useState("legion");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const [normalLevel, setNormalLevel] = useState(0);
  const [hardLevel, setHardLevel] = useState(0);

  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);

    const { data: raid, error } = await supabase
      .from("raid_master")
      .insert({
        name,
        slug,
        raid_type: raidType,
        image_url: imageUrl || null,
        description,
      })
      .select()
      .single();

    if (error || !raid) {
      setSaving(false);
      alert(error?.message ?? "레이드 생성 실패");
      return;
    }

    const difficulties = [];

    if (normalLevel > 0) {
      difficulties.push({
        raid_master_id: raid.id,
        difficulty: "노말",
        min_item_level: normalLevel,
        max_players: 8,
        sort_order: 1,
      });
    }

    if (hardLevel > 0) {
      difficulties.push({
        raid_master_id: raid.id,
        difficulty: "하드",
        min_item_level: hardLevel,
        max_players: 8,
        sort_order: 2,
      });
    }

    if (difficulties.length > 0) {
      await supabase
        .from("raid_difficulties")
        .insert(difficulties);
    }

    setSaving(false);

    router.push("/raids");
    router.refresh();
  }

  return (
    <PageContainer>
      <SectionTitle
        title="새 레이드 등록"
        description="레이드와 난이도를 함께 등록합니다."
      />

      <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(makeSlug(e.target.value));
          }}
          placeholder="레이드 이름"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <input
          value={slug}
          onChange={(e) => setSlug(makeSlug(e.target.value))}
          placeholder="slug"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <select
          value={raidType}
          onChange={(e) => setRaidType(e.target.value)}
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        >
          <option value="guardian">가디언 토벌</option>
          <option value="abyss">어비스 던전</option>
          <option value="legion">군단장 레이드</option>
          <option value="epic">에픽 레이드</option>
          <option value="shadow">그림자 레이드</option>
          <option value="kazeros">카제로스 레이드</option>
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            value={normalLevel}
            onChange={(e) => setNormalLevel(Number(e.target.value))}
            placeholder="노말 입장레벨"
            className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />

          <input
            type="number"
            value={hardLevel}
            onChange={(e) => setHardLevel(Number(e.target.value))}
            placeholder="하드 입장레벨"
            className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="이미지 URL"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="레이드 설명"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
        />

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="h-12 rounded-xl bg-violet-600 px-6 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "등록 중..." : "레이드 등록"}
        </button>
      </div>
    </PageContainer>
  );
}