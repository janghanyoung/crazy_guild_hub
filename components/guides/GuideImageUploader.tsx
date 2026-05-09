"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase/client";

type GuideImageUploaderProps = {
  onUploaded: (markdown: string) => void;
};

export default function GuideImageUploader({
  onUploaded,
}: GuideImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    try {
      setUploading(true);

      const ext = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `guides/${fileName}`;

      const { error } = await supabase.storage
        .from("guide-images")
        .upload(filePath, file);

      if (error) {
        alert(error.message);
        return;
      }

      const { data } = supabase.storage
        .from("guide-images")
        .getPublicUrl(filePath);

      onUploaded(`\n\n![공략 이미지](${data.publicUrl})\n\n`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-zinc-700 px-4 text-sm font-bold text-zinc-300 transition hover:border-violet-500/60 hover:text-white">
      {uploading ? "업로드 중..." : "이미지 추가"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </label>
  );
}