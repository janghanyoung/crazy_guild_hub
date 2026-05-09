"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { supabase } from "../../lib/supabase/client";

type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type Tool = "arrow" | "rect" | "circle" | "text";

type Annotation = {
  id: string;
  tool: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
};

type Props = {
  onUploaded: (markdown: string) => void;
};

export default function GuideImageUploader({ onUploaded }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedSrc, setCroppedSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [tool, setTool] = useState<Tool>("arrow");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [draft, setDraft] = useState<Annotation | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const previewVisible = useMemo(() => !!imageSrc, [imageSrc]);

  const onCropComplete = useCallback(
    (_: unknown, croppedAreaPixelsValue: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsValue);
    },
    []
  );

  async function createCroppedDataUrl() {
    if (!imageSrc || !croppedAreaPixels) return null;

    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return canvas.toDataURL("image/webp", 0.95);
  }

  async function handleCropNext() {
    const dataUrl = await createCroppedDataUrl();

    if (!dataUrl) {
      alert("이미지 크롭 실패");
      return;
    }

    setCroppedSrc(dataUrl);
  }

  function getRelativePoint(event: React.PointerEvent<HTMLDivElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) return { x: 0, y: 0 };

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!croppedSrc) return;

    const point = getRelativePoint(event);

    startRef.current = point;

    setDraft({
      id: crypto.randomUUID(),
      tool,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      text: tool === "text" ? "텍스트" : undefined,
    });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current || !draft) return;

    const point = getRelativePoint(event);
    const start = startRef.current;

    setDraft({
      ...draft,
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    });
  }

  function handlePointerUp() {
    if (!draft) return;

    if (draft.width < 10 && draft.height < 10 && draft.tool !== "text") {
      setDraft(null);
      startRef.current = null;
      return;
    }

    const next =
      draft.tool === "text"
        ? {
            ...draft,
            width: Math.max(draft.width, 120),
            height: Math.max(draft.height, 36),
            text: prompt("라벨 텍스트를 입력하세요.", draft.text ?? "텍스트") ?? "텍스트",
          }
        : draft;

    setAnnotations((prev) => [...prev, next]);
    setDraft(null);
    startRef.current = null;
  }

  function removeLastAnnotation() {
    setAnnotations((prev) => prev.slice(0, -1));
  }

  function clearAnnotations() {
    setAnnotations([]);
  }

  async function renderFinalBlob() {
    if (!croppedSrc || !canvasRef.current) return null;

    const image = new Image();
    image.src = croppedSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const displayRect = canvasRef.current.getBoundingClientRect();
    const scaleX = image.width / displayRect.width;
    const scaleY = image.height / displayRect.height;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    annotations.forEach((annotation) => {
      const x = annotation.x * scaleX;
      const y = annotation.y * scaleY;
      const width = annotation.width * scaleX;
      const height = annotation.height * scaleY;

      ctx.strokeStyle = "#ef4444";
      ctx.fillStyle = "#ef4444";
      ctx.lineWidth = 6;
      ctx.font = "bold 32px sans-serif";

      if (annotation.tool === "rect") {
        ctx.strokeRect(x, y, width, height);
      }

      if (annotation.tool === "circle") {
        ctx.beginPath();
        ctx.ellipse(
          x + width / 2,
          y + height / 2,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      if (annotation.tool === "arrow") {
        const x1 = x;
        const y1 = y;
        const x2 = x + width;
        const y2 = y + height;

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 30;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }

      if (annotation.tool === "text") {
        const text = annotation.text ?? "텍스트";
        const padding = 16;

        ctx.font = "bold 34px sans-serif";
        const measured = ctx.measureText(text);
        const boxWidth = measured.width + padding * 2;
        const boxHeight = 52;

        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(x, y, boxWidth, boxHeight);

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, x + padding, y + 37);
      }
    });

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.95);
    });
  }

  async function handleUpload() {
    try {
      setUploading(true);

      const blob = await renderFinalBlob();

      if (!blob) {
        alert("이미지 처리 실패");
        return;
      }

      const fileName = `${crypto.randomUUID()}.webp`;
      const filePath = `guides/${fileName}`;

      const { error } = await supabase.storage
        .from("guide-images")
        .upload(filePath, blob, {
          contentType: "image/webp",
        });

      if (error) {
        alert(error.message);
        return;
      }

      const { data } = supabase.storage
        .from("guide-images")
        .getPublicUrl(filePath);

      onUploaded(`\n\n![공략 이미지](${data.publicUrl})\n\n`);

      setImageSrc(null);
      setCroppedSrc(null);
      setAnnotations([]);
      setDraft(null);
    } finally {
      setUploading(false);
    }
  }

  const allAnnotations = draft ? [...annotations, draft] : annotations;

  return (
    <div className="space-y-4">
      <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-zinc-700 px-4 text-sm font-bold text-zinc-300 transition hover:border-violet-500/60 hover:text-white">
        이미지 추가
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = () => {
              setImageSrc(reader.result as string);
              setCroppedSrc(null);
              setAnnotations([]);
            };

            reader.readAsDataURL(file);
          }}
        />
      </label>

      {previewVisible && !croppedSrc && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="relative h-[400px] overflow-hidden rounded-xl bg-black">
            <Cropper
              image={imageSrc!}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm text-zinc-400">확대 / 축소</p>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
            />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleCropNext}
              className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-500"
            >
              크롭 완료
            </button>

            <button
              onClick={() => {
                setImageSrc(null);
                setCroppedSrc(null);
              }}
              className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-zinc-300 transition hover:border-red-500 hover:text-red-300"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {croppedSrc && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["arrow", "rect", "circle", "text"] as Tool[]).map((item) => (
              <button
                key={item}
                onClick={() => setTool(item)}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${
                  tool === item
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {item === "arrow" && "화살표"}
                {item === "rect" && "네모"}
                {item === "circle" && "원"}
                {item === "text" && "텍스트"}
              </button>
            ))}

            <button
              onClick={removeLastAnnotation}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-300 hover:border-yellow-500 hover:text-yellow-300"
            >
              되돌리기
            </button>

            <button
              onClick={clearAnnotations}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-300 hover:border-red-500 hover:text-red-300"
            >
              전체 삭제
            </button>
          </div>

          <div
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative mx-auto aspect-video w-full max-w-4xl cursor-crosshair overflow-hidden rounded-xl bg-black select-none"
          >
            <img
              src={croppedSrc}
              alt="편집 이미지"
              className="h-full w-full object-contain"
              draggable={false}
            />

            {allAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className="pointer-events-none absolute"
                style={{
                  left: annotation.x,
                  top: annotation.y,
                  width: annotation.width,
                  height: annotation.height,
                }}
              >
                {annotation.tool === "rect" && (
                  <div className="h-full w-full border-4 border-red-500" />
                )}

                {annotation.tool === "circle" && (
                  <div className="h-full w-full rounded-full border-4 border-red-500" />
                )}

                {annotation.tool === "arrow" && (
                  <svg
                    className="h-full w-full overflow-visible"
                    viewBox={`0 0 ${Math.max(annotation.width, 1)} ${Math.max(
                      annotation.height,
                      1
                    )}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <marker
                        id={`arrowhead-${annotation.id}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="3"
                        orient="auto"
                      >
                        <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                      </marker>
                    </defs>
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.max(annotation.width, 1)}
                      y2={Math.max(annotation.height, 1)}
                      stroke="#ef4444"
                      strokeWidth="5"
                      markerEnd={`url(#arrowhead-${annotation.id})`}
                    />
                  </svg>
                )}

                {annotation.tool === "text" && (
                  <div className="inline-flex rounded border-2 border-red-500 bg-black/75 px-3 py-1 text-lg font-black text-white">
                    {annotation.text ?? "텍스트"}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {uploading ? "업로드 중..." : "편집 이미지 삽입"}
            </button>

            <button
              onClick={() => {
                setCroppedSrc(null);
                setAnnotations([]);
              }}
              className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-300"
            >
              크롭 다시하기
            </button>

            <button
              onClick={() => {
                setImageSrc(null);
                setCroppedSrc(null);
                setAnnotations([]);
              }}
              className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-zinc-300 transition hover:border-red-500 hover:text-red-300"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}