"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import PageContainer from "../../../components/ui/PageContainer";
import SectionTitle from "../../../components/ui/SectionTitle";
import { supabase } from "../../../lib/supabase/client";

export default function NewGuideForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultCategory = searchParams.get("category") ?? "general";
  const defaultTargetType = searchParams.get("targetType") ?? "";
  const defaultTargetName = searchParams.get("targetName") ?? "";

  const [title, setTitle] = useState(
    defaultTargetName ? `${defaultTargetName} 공략` : ""
  );
  const [category, setCategory] = useState(defaultCategory);
  const [targetType, setTargetType] = useState(defaultTargetType);
  const [targetName, setTargetName] = useState(defaultTargetName);
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from("guides")
        .insert({
          title,
          category,
          target_type: targetType || null,
          target_name: targetName || null,
          video_url: videoUrl || null,
          content,
        })
        .select("id")
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      router.push(`/guides/${data.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <SectionTitle
        title="공략 작성"
        description="레이드, 내실, 업적 어디서든 연결할 수 있는 공략을 작성합니다."
      />

      <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div>
          <label className="text-sm font-bold text-zinc-300">분류</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-violet-500"
          >
            <option value="raid">레이드 공략</option>
            <option value="collectible">내실 공략</option>
            <option value="achievement">업적 공략</option>
            <option value="general">일반 공략</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공략 제목"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-violet-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-zinc-300">대상 종류</label>
            <input
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              placeholder="예: 세계수의 잎, 에키드나, 히든 업적"
              className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-300">대상 이름</label>
            <input
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="예: 세계수의 잎 #116"
              className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">영상 URL</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="유튜브 링크 등"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">공략 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공략 내용을 작성하세요."
            rows={14}
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white outline-none focus:border-violet-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="h-12 rounded-xl bg-violet-600 px-6 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "공략 저장"}
        </button>
      </div>
    </PageContainer>
  );
}