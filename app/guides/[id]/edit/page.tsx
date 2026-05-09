import EditGuideForm from "./EditGuideForm";
import { getGuide } from "../../../../lib/supabase/guides";
import PageContainer from "../../../../components/ui/PageContainer";

export const dynamic = "force-dynamic";

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await getGuide(id);

  if (!guide) {
    return (
      <PageContainer>
        <p className="text-zinc-400">공략을 찾을 수 없습니다.</p>
      </PageContainer>
    );
  }

  return <EditGuideForm guide={guide} />;
}