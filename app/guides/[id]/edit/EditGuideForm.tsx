
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageContainer from "../../../../components/ui/PageContainer";
import SectionTitle from "../../../../components/ui/SectionTitle";
import { supabase } from "../../../../lib/supabase/client";
import type { Guide } from "../../../../lib/supabase/guides";
import GuideImageUploader from "../../../../components/guides/GuideImageUploader";
import MarkdownViewer from "../../../../components/guides/MarkdownViewer";

export default function EditGuideForm({ guide }: { guide: Guide }) {
  const router = useRouter();

  const [title, setTitle] = useState(guide.title);
  const [category, setCategory] = useState(guide.category);
  const [targetType, setTargetType] = useState(guide.target_type ?? "");
  const [targetName, setTargetName] = useState(guide.target_name ?? "");
  const [videoUrl, setVideoUrl] = useState(guide.video_url ?? "");
  const [content, setContent] = useState(guide.content ?? "");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [editorCharacter, setEditorCharacter] = useState("");

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("guild-auth") ?? "{}");
    setEditorCharacter(auth.mainCharacter ?? "");
  }, []);

  async function handleSave() {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }

    if (!editorCharacter) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const mergedContributors = Array.from(
      new Set([...(guide.contributors ?? []), editorCharacter])
    );

    setSaving(true);

    const { error } = await supabase
      .from("guides")
      .update({
        title,
        category,
        target_type: targetType || null,
        target_name: targetName || null,
        video_url: videoUrl || null,
        content,
        updated_at: new Date().toISOString(),
        contributors: mergedContributors,
      })
      .eq("id", guide.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/guides/${guide.id}`);
  }

  return (
    <PageContainer>
      <SectionTitle
        title="공략 수정"
        description="작성한 공략을 수정합니다."
      />

      <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-xs font-bold text-zinc-500">수정자</p>
        <p className="mt-2 font-black text-yellow-300">
          {editorCharacter || "로그인 정보 확인 중..."}
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Guide["category"])}
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4"
        >
          <option value="raid">레이드 공략</option>
          <option value="collectible">내실 공략</option>
          <option value="achievement">업적 공략</option>
          <option value="general">일반 공략</option>
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            placeholder="대상 종류"
            className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4"
          />

          <input
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="대상 이름"
            className="h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4"
          />
        </div>

        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="영상 URL"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              !preview
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            작성
          </button>

          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              preview
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            미리보기
          </button>
        </div>

        <GuideImageUploader
          content={content}
          onReplaceContent={setContent}
          onUploaded={(markdown) =>
            setContent((prev) => `${prev}${markdown}`)
          }
        />

        {preview ? (
          <div className="min-h-96 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-950 p-4">
            <MarkdownViewer
              content={content || "미리볼 내용이 없습니다."}
            />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-sm leading-7 outline-none focus:border-violet-500"
          />
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-12 rounded-xl bg-violet-600 px-6 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "수정 저장"}
        </button>
      </div>
    </PageContainer>
  );
}

