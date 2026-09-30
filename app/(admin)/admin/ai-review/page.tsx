import { adminService } from "@/services/admin.service";
import { AiReviewView } from "@/components/admin/ai-review/ai-review-view";

export default async function AdminAiReviewPage() {
  const messages = await adminService.getAiReviewQueue();

  return <AiReviewView initialMessages={messages} />;
}
