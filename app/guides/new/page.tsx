import { Suspense } from "react";
import NewGuideForm from "./NewGuideForm";

export default function NewGuidePage() {
  return (
    <Suspense fallback={<div className="p-10 text-zinc-400">로딩 중...</div>}>
      <NewGuideForm />
    </Suspense>
  );
}