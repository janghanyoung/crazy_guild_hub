"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export default function DeleteGuideButton({
  guideId,
}: {
  guideId: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm("정말 이 공략을 삭제하시겠습니까?");

    if (!ok) return;

    const { error } = await supabase
      .from("guides")
      .delete()
      .eq("id", guideId);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/guides");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
    >
      공략 삭제
    </button>
  );
}