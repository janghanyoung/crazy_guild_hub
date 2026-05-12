"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PageContainer from "../../../components/ui/PageContainer";
import SectionTitle from "../../../components/ui/SectionTitle";
import { supabase } from "../../../lib/supabase/client";
import GuideImageUploader from "../../../components/guides/GuideImageUploader";
import MarkdownViewer from "../../../components/guides/MarkdownViewer";

const guideTargets = {
  raid: {
    레이드: [
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
    ],
  },
  collectible: {
    "모코코 씨앗": [],
    "섬의 마음": [],
    "이그네아의 징표": [],
    "거인의 심장": [],
    "위대한 미술품": [],
    "항해 모험물": [],
    "세계수의 잎": [],
    "오르페우스의 별": [],
    "기억의 오르골": [],
    "크림스네일의 해도": [],
    "누크만의 환영석": [],
  },
  achievement: {
    업적: ["히든 업적", "전투 업적", "생활 업적", "항해 업적", "일반 업적"],
  },
  general: {
    일반: ["자유 공략", "길드 팁", "초보자 가이드"],
  },
} as const;

type Category = keyof typeof guideTargets;

function getCategoryLabel(category: string) {
  switch (category) {
    case "raid":
      return "레이드 공략";
    case "collectible":
      return "내실 공략";
    case "achievement":
      return "업적 공략";
    default:
      return "일반 공략";
  }
}

export default function NewGuideForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultCategory = (searchParams.get("category") ?? "general") as Category;
  const defaultTargetType = searchParams.get("targetType") ?? "";
  const defaultTargetName = searchParams.get("targetName") ?? "";

  const safeDefaultCategory: Category =
    defaultCategory in guideTargets ? defaultCategory : "general";

  const [creatorCharacter, setCreatorCharacter] = useState("");
  const [category, setCategory] = useState<Category>(safeDefaultCategory);
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("guild-auth") ?? "{}");
    setCreatorCharacter(auth.mainCharacter ?? "");
  }, []);

  const targetTypes = useMemo(() => Object.keys(guideTargets[category]), [category]);

  const initialTargetType =
    defaultTargetType && targetTypes.includes(defaultTargetType)
      ? defaultTargetType
      : targetTypes[0] ?? "";

  const [targetType, setTargetType] = useState(initialTargetType);

  const targetNames = useMemo(() => {
    const group = guideTargets[category] as Record<string, readonly string[]>;
    return [...(group[targetType] ?? [])];
  }, [category, targetType]);

  const initialTargetName =
    defaultTargetName &&
    (targetNames.length === 0 || targetNames.includes(defaultTargetName))
      ? defaultTargetName
      : targetNames[0] ?? "";

  const [targetName, setTargetName] = useState(initialTargetName);
  const [title, setTitle] = useState(
    initialTargetName ? `${initialTargetName} 공략` : `${initialTargetType} 공략`
  );

  function handleCategoryChange(nextCategory: Category) {
    const nextTargetTypes = Object.keys(guideTargets[nextCategory]);
    const nextTargetType = nextTargetTypes[0] ?? "";
    const nextTargetNames =
      (guideTargets[nextCategory] as Record<string, readonly string[]>)[
        nextTargetType
      ] ?? [];
    const nextTargetName = nextTargetNames[0] ?? "";

    setCategory(nextCategory);
    setTargetType(nextTargetType);
    setTargetName(nextTargetName);
    setTitle(nextTargetName ? `${nextTargetName} 공략` : `${nextTargetType} 공략`);
  }

  function handleTargetTypeChange(nextTargetType: string) {
    const nextTargetNames =
      (guideTargets[category] as Record<string, readonly string[]>)[
        nextTargetType
      ] ?? [];
    const nextTargetName = nextTargetNames[0] ?? "";

    setTargetType(nextTargetType);
    setTargetName(nextTargetName);
    setTitle(nextTargetName ? `${nextTargetName} 공략` : `${nextTargetType} 공략`);
  }

  function handleTargetNameChange(nextTargetName: string) {
    setTargetName(nextTargetName);
    setTitle(nextTargetName ? `${nextTargetName} 공략` : `${targetType} 공략`);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }

    if (!targetType.trim()) {
      alert("대상 종류를 선택하세요.");
      return;
    }

    if (!creatorCharacter) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("guides")
      .insert({
        title,
        category,
        target_type: targetType,
        target_name: targetName || targetType,
        video_url: videoUrl || null,
        content,
        creator_character: creatorCharacter,
        contributors: [creatorCharacter],
      })
      .select("id")
      .single();

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/guides/${data.id}`);
  }

  return (
    <PageContainer>
      <SectionTitle
        title="공략 작성"
        description="정해진 분류와 대상에 맞춰 공략을 작성합니다."
      />

      <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-xs font-bold text-zinc-500">최초 작성자</p>
        <p className="mt-2 font-black text-yellow-300">
          {creatorCharacter || "로그인 정보 확인 중..."}
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div>
          <label className="text-sm font-bold text-zinc-300">분류</label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as Category)}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          >
            {(Object.keys(guideTargets) as Category[]).map((key) => (
              <option key={key} value={key}>
                {getCategoryLabel(key)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-zinc-300">대상 종류</label>
            <select
              value={targetType}
              onChange={(e) => handleTargetTypeChange(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
            >
              {targetTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-300">대상 이름</label>
            {targetNames.length > 0 ? (
              <select
                value={targetName}
                onChange={(e) => handleTargetNameChange(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
              >
                {targetNames.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-2 h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
                상세 대상은 연결 페이지에서 자동 지정됩니다.
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공략 제목"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">영상 URL</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="유튜브 링크 등"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

        <GuideImageUploader
          content={content}
          onReplaceContent={setContent}
          onUploaded={(markdown) => setContent((prev) => `${prev}${markdown}`)}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold text-zinc-300">작성</label>
              <span className="text-xs text-zinc-500">Markdown</span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# 핵심 요약
- 준비물:
- 위치:
- 주의사항:

## 상세 공략
내용을 적으세요.`}
              rows={22}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-sm leading-7 text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold text-zinc-300">
                실시간 미리보기
              </label>
              <span className="text-xs text-zinc-500">이미지도 여기서 확인</span>
            </div>

            <div className="min-h-[560px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <MarkdownViewer content={content || "아직 작성된 내용이 없습니다."} />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="h-12 rounded-xl bg-violet-600 px-6 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "공략 저장"}
        </button>
      </div>
    </PageContainer>
  );
}