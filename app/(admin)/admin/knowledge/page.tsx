import { adminService } from "@/services/admin.service";
import { KnowledgeBaseView } from "@/components/admin/knowledge/knowledge-base-view";

export default async function AdminKnowledgePage() {
  const sources = await adminService.getKnowledgeSources();

  return <KnowledgeBaseView initialSources={sources} />;
}
