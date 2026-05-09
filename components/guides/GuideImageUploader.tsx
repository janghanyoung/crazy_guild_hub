"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import Cropper from "react-easy-crop";
import { supabase } from "../../lib/supabase/client";

type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type Tool = "arrow" | "rect" | "circle" | "text" | "image";

type Annotation = {
  id: string;
  tool: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  imageSrc?: string;
  x2?: number;
  y2?: number;
};

type Props = {
  onUploaded: (markdown: string) => void;
  content?: string;
  onReplaceContent?: (nextContent: string) => void;
};

type Interaction =
  | {
      type: "draw";
      startX: number;
      startY: number;
      annotation: Annotation;
    }
  | {
      type: "move";
      id: string;
      startX: number;
      startY: number;
      original: Annotation;
    }
  | {
      type: "resize";
      id: string;
      startX: number;
      startY: number;
      original: Annotation;
    }
  | null;

function extractMarkdownImages(content: string) {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: { alt: string; url: string; markdown: string }[] = [];

  let match;

  while ((match = regex.exec(content)) !== null) {
    images.push({
      alt: match[1],
      url: match[2],
      markdown: match[0],
    });
  }

  return images;
}

export default function GuideImageUploader({
  onUploaded,
  content = "",
  onReplaceContent,
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [editingMarkdown, setEditingMarkdown] = useState<string | null>(null);

  const [croppedSrc, setCroppedSrc] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [tool, setTool] = useState<Tool>("arrow");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<Interaction>(null);
  const overlayFileInputRef = useRef<HTMLInputElement | null>(null);

  const markdownImages = useMemo(() => extractMarkdownImages(content), [content]);
  const hasImage = useMemo(() => !!imageSrc, [imageSrc]);

  const onCropComplete = useCallback(
    (_: unknown, croppedAreaPixelsValue: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsValue);
    },
    []
  );

  function resetImageState() {
    setImageSrc(null);
    setOriginalFile(null);
    setEditingMarkdown(null);
    setCroppedSrc(null);
    setEditMode(false);
    setAnnotations([]);
    setSelectedId(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    interactionRef.current = null;
  }

  function getRelativePoint(event: PointerEvent<HTMLDivElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) return { x: 0, y: 0 };

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  async function uploadBlob(blob: Blob, fileNameExt = "webp") {
    const fileName = `${crypto.randomUUID()}.${fileNameExt}`;
    const filePath = `guides/${fileName}`;

    const { error } = await supabase.storage
      .from("guide-images")
      .upload(filePath, blob, {
        contentType: blob.type || "image/webp",
      });

    if (error) {
      alert(error.message);
      return;
    }

    const { data } = supabase.storage.from("guide-images").getPublicUrl(filePath);
    const markdown = `![공략 이미지](${data.publicUrl})`;

    if (editingMarkdown && onReplaceContent) {
      onReplaceContent(content.replace(editingMarkdown, markdown));
    } else {
      onUploaded(`\n\n${markdown}\n\n`);
    }

    resetImageState();
  }

  async function handleUploadOriginal() {
    if (!originalFile) return;

    try {
      setUploading(true);
      await uploadBlob(originalFile, originalFile.name.split(".").pop() || "png");
    } finally {
      setUploading(false);
    }
  }

  async function createCroppedDataUrl() {
    if (!imageSrc || !croppedAreaPixels) return null;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
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
    try {
      const dataUrl = await createCroppedDataUrl();

      if (!dataUrl) {
        alert("이미지 크롭 실패");
        return;
      }

      setCroppedSrc(dataUrl);
    } catch {
      alert("이미지를 편집할 수 없습니다. 이미지 주소 또는 CORS 문제일 수 있습니다.");
    }
  }

  function handleCanvasPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!croppedSrc) return;

    const point = getRelativePoint(event);

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      tool,
      x: point.x,
      y: point.y,
      width: tool === "text" ? 160 : 0,
      height: tool === "text" ? 44 : 0,
      text: tool === "text" ? "텍스트" : undefined,
    };

    interactionRef.current = {
      type: "draw",
      startX: point.x,
      startY: point.y,
      annotation,
    };

    setSelectedId(annotation.id);
    setAnnotations((prev) => [...prev, annotation]);
  }

  function handleAnnotationPointerDown(
    event: PointerEvent<HTMLDivElement>,
    annotation: Annotation
  ) {
    event.stopPropagation();

    const point = getRelativePoint(event);

    setSelectedId(annotation.id);

    interactionRef.current = {
      type: "move",
      id: annotation.id,
      startX: point.x,
      startY: point.y,
      original: annotation,
    };
  }

  function handleResizePointerDown(
    event: PointerEvent<HTMLDivElement>,
    annotation: Annotation
  ) {
    event.stopPropagation();

    const point = getRelativePoint(event);

    setSelectedId(annotation.id);

    interactionRef.current = {
      type: "resize",
      id: annotation.id,
      startX: point.x,
      startY: point.y,
      original: annotation,
    };
  }

  function handleCanvasPointerMove(event: PointerEvent<HTMLDivElement>) {
    const interaction = interactionRef.current;
    if (!interaction) return;

    const point = getRelativePoint(event);

    if (interaction.type === "draw") {
  const startX = interaction.startX;
  const startY = interaction.startY;

  setAnnotations((prev) =>
    prev.map((item) => {
      if (item.id !== interaction.annotation.id) return item;

      if (item.tool === "arrow") {
        return {
          ...item,
          x: startX,
          y: startY,
          x2: point.x,
          y2: point.y,
          width: Math.abs(point.x - startX),
          height: Math.abs(point.y - startY),
        };
      }

      const x = Math.min(startX, point.x);
      const y = Math.min(startY, point.y);
      const width = Math.abs(point.x - startX);
      const height = Math.abs(point.y - startY);

      return {
        ...item,
        x,
        y,
        width: item.tool === "text" ? Math.max(width, 160) : width,
        height: item.tool === "text" ? Math.max(height, 44) : height,
      };
    })
  );

  return;
}
    if (interaction.type === "move") {
      const dx = point.x - interaction.startX;
      const dy = point.y - interaction.startY;

      setAnnotations((prev) =>
        prev.map((item) =>
          item.id === interaction.id
            ? {
                ...item,
                x: interaction.original.x + dx,
                y: interaction.original.y + dy,
              }
            : item
        )
      );

      return;
    }

    if (interaction.type === "resize") {
      const dx = point.x - interaction.startX;
      const dy = point.y - interaction.startY;

      setAnnotations((prev) =>
        prev.map((item) =>
          item.id === interaction.id
            ? {
                ...item,
                width: Math.max(24, interaction.original.width + dx),
                height: Math.max(24, interaction.original.height + dy),
              }
            : item
        )
      );
    }
  }

  function handleCanvasPointerUp() {
    const interaction = interactionRef.current;

    if (interaction?.type === "draw") {
      setAnnotations((prev) =>
        prev
          .map((item) => {
            if (item.id !== interaction.annotation.id) return item;

            if (item.tool === "text") {
              return {
                ...item,
                width: Math.max(item.width, 160),
                height: Math.max(item.height, 44),
                text:
                  prompt("라벨 텍스트를 입력하세요.", item.text ?? "텍스트") ??
                  "텍스트",
              };
            }

            return item;
          })
          .filter((item) => {
            if (item.id !== interaction.annotation.id) return true;
            if (item.tool === "text") return true;
            return item.width >= 10 || item.height >= 10;
          })
      );
    }

    interactionRef.current = null;
  }

  function removeSelectedAnnotation() {
    if (!selectedId) return;

    setAnnotations((prev) => prev.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  }

  function removeLastAnnotation() {
    setAnnotations((prev) => prev.slice(0, -1));
    setSelectedId(null);
  }

  function clearAnnotations() {
    setAnnotations([]);
    setSelectedId(null);
  }

  function handleOverlayImage(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      const id = crypto.randomUUID();

      setAnnotations((prev) => [
        ...prev,
        {
          id,
          tool: "image",
          x: 40,
          y: 40,
          width: 220,
          height: 130,
          imageSrc: reader.result as string,
        },
      ]);

      setSelectedId(id);
    };

    reader.readAsDataURL(file);
  }

  async function renderFinalBlob() {
    if (!croppedSrc || !canvasRef.current) return null;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = croppedSrc;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
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

    for (const annotation of annotations) {
      const x = annotation.x * scaleX;
      const y = annotation.y * scaleY;
      const width = annotation.width * scaleX;
      const height = annotation.height * scaleY;

      ctx.strokeStyle = "#ef4444";
      ctx.fillStyle = "#ef4444";
      ctx.lineWidth = 6;

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
  const x1 = annotation.x * scaleX;
  const y1 = annotation.y * scaleY;
  const x2 = (annotation.x2 ?? annotation.x + annotation.width) * scaleX;
  const y2 = (annotation.y2 ?? annotation.y + annotation.height) * scaleY;

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
        const boxWidth = Math.max(width, measured.width + padding * 2);
        const boxHeight = Math.max(height, 52);

        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(x, y, boxWidth, boxHeight);

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, x + padding, y + 37);
      }

      if (annotation.tool === "image" && annotation.imageSrc) {
        const overlay = new Image();
        overlay.src = annotation.imageSrc;

        await new Promise((resolve) => {
          overlay.onload = resolve;
        });

        ctx.drawImage(overlay, x, y, width, height);
      }
    }

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.95);
    });
  }

  async function handleUploadEdited() {
    try {
      setUploading(true);

      const blob = await renderFinalBlob();

      if (!blob) {
        alert("이미지 처리 실패");
        return;
      }

      await uploadBlob(blob, "webp");
    } finally {
      setUploading(false);
    }
  }

  function startEditingExistingImage(image: { url: string; markdown: string }) {
    setImageSrc(image.url);
    setOriginalFile(null);
    setEditingMarkdown(image.markdown);
    setEditMode(true);
    setCroppedSrc(null);
    setAnnotations([]);
    setSelectedId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-zinc-700 px-4 text-sm font-bold text-zinc-300 transition hover:border-violet-500/60 hover:text-white">
          새 이미지 추가
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) return;

              const reader = new FileReader();

              reader.onload = () => {
                setOriginalFile(file);
                setImageSrc(reader.result as string);
                setCroppedSrc(null);
                setEditMode(false);
                setEditingMarkdown(null);
                setAnnotations([]);
                setSelectedId(null);
              };

              reader.readAsDataURL(file);
            }}
          />
        </label>
      </div>

      {markdownImages.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="mb-3 text-sm font-bold text-zinc-300">
            본문 이미지 다시 편집
          </p>

          <div className="flex flex-wrap gap-3">
            {markdownImages.map((image) => (
              <button
                key={image.url}
                onClick={() => startEditingExistingImage(image)}
                className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-violet-500/60"
              >
                <img
                  src={image.url}
                  alt={image.alt || "본문 이미지"}
                  className="h-20 w-32 object-cover opacity-80 transition group-hover:opacity-100"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {hasImage && !editMode && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="overflow-hidden rounded-xl bg-black">
            <img
              src={imageSrc!}
              alt="선택한 이미지"
              className="max-h-[420px] w-full object-contain"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleUploadOriginal}
              disabled={uploading}
              className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {uploading ? "업로드 중..." : "그대로 삽입"}
            </button>

            <button
              onClick={() => setEditMode(true)}
              className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-zinc-300 transition hover:border-violet-500 hover:text-violet-300"
            >
              이미지 편집
            </button>

            <button
              onClick={resetImageState}
              className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-zinc-300 transition hover:border-red-500 hover:text-red-300"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {hasImage && editMode && !croppedSrc && (
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
              onClick={() => setEditMode(false)}
              className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-300"
            >
              편집 취소
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
              onClick={() => overlayFileInputRef.current?.click()}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-bold text-zinc-300 hover:text-white"
            >
              이미지 덧대기
            </button>

            <input
              ref={overlayFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleOverlayImage(file);
              }}
            />

            <button
              onClick={removeSelectedAnnotation}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-300 hover:border-red-500 hover:text-red-300"
            >
              선택 삭제
            </button>

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

          <p className="mb-3 text-xs text-zinc-500">
            요소를 클릭해서 선택한 뒤 드래그하면 이동됩니다. 우하단 작은 점을 잡으면 크기 조절됩니다.
          </p>

          <div
            ref={canvasRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
            className="relative mx-auto aspect-video w-full max-w-4xl cursor-crosshair overflow-hidden rounded-xl bg-black select-none"
          >
            <img
              src={croppedSrc}
              alt="편집 이미지"
              className="h-full w-full object-contain"
              draggable={false}
            />

            {annotations.map((annotation) => {
              const selected = selectedId === annotation.id;

              const isArrow = annotation.tool === "arrow";

const left = isArrow
  ? Math.min(annotation.x, annotation.x2 ?? annotation.x)
  : annotation.x;

const top = isArrow
  ? Math.min(annotation.y, annotation.y2 ?? annotation.y)
  : annotation.y;

const width = isArrow
  ? Math.max(Math.abs((annotation.x2 ?? annotation.x) - annotation.x), 1)
  : annotation.width;

const height = isArrow
  ? Math.max(Math.abs((annotation.y2 ?? annotation.y) - annotation.y), 1)
  : annotation.height;

              return (
                <div
                  key={annotation.id}
                  onPointerDown={(event) =>
                    handleAnnotationPointerDown(event, annotation)
                  }
                  className={`absolute cursor-move ${
                    selected ? "ring-2 ring-violet-400" : ""
                  }`}
                  style={{
  left,
  top,
  width,
  height,
}}
                >
                  {annotation.tool === "rect" && (
                    <div className="h-full w-full border-4 border-red-500" />
                  )}

                  {annotation.tool === "circle" && (
                    <div className="h-full w-full rounded-full border-4 border-red-500" />
                  )}

                  {annotation.tool === "arrow" && (
  <svg className="h-full w-full overflow-visible">
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
      x1={annotation.x <= (annotation.x2 ?? annotation.x) ? 0 : width}
      y1={annotation.y <= (annotation.y2 ?? annotation.y) ? 0 : height}
      x2={annotation.x <= (annotation.x2 ?? annotation.x) ? width : 0}
      y2={annotation.y <= (annotation.y2 ?? annotation.y) ? height : 0}
      stroke="#ef4444"
      strokeWidth="5"
      markerEnd={`url(#arrowhead-${annotation.id})`}
    />
  </svg>
)}

                  {annotation.tool === "text" && (
                    <div className="flex h-full w-full items-center rounded border-2 border-red-500 bg-black/75 px-3 py-1 text-lg font-black text-white">
                      {annotation.text ?? "텍스트"}
                    </div>
                  )}

                  {annotation.tool === "image" && annotation.imageSrc && (
                    <img
                      src={annotation.imageSrc}
                      alt="덧댄 이미지"
                      className="h-full w-full object-contain"
                      draggable={false}
                    />
                  )}

                  {selected && (
                    <div
                      onPointerDown={(event) =>
                        handleResizePointerDown(event, annotation)
                      }
                      className="absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize rounded-full border-2 border-white bg-violet-500"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleUploadEdited}
              disabled={uploading}
              className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {uploading
                ? "업로드 중..."
                : editingMarkdown
                  ? "수정 이미지로 교체"
                  : "편집 이미지 삽입"}
            </button>

            <button
              onClick={() => {
                setCroppedSrc(null);
                setAnnotations([]);
                setSelectedId(null);
              }}
              className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-300"
            >
              크롭 다시하기
            </button>

            <button
              onClick={resetImageState}
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