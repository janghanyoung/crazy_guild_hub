import { Suspense } from "react";
import NewGuideForm from "./NewGuideForm";

export const dynamic = "force-dynamic";

export default function NewGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-zinc-400">
          공략 작성 페이지를 불러오는 중...
        </div>
      }
    >
      <NewGuideForm />
    </Suspense>
  );
}