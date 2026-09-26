import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatContainer } from "@/components/ai/chat-container";
import { aiOrchestrationService } from "@/services/ai/ai-orchestration.service";

export const metadata = {
  title: "Pankh AI Assistant | ਪੰਖ",
  description:
    "Punjabi-first poultry AI assistant for symptom evaluation, feed management, and vet escalation.",
};

export default async function AskPankhPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const initialData = await aiOrchestrationService.getAskPageInitialData(
    session.user.id
  );

  if (!initialData) {
    redirect("/onboarding/farm");
  }

  return (
    <div className="w-full py-2">
      <ChatContainer
        initialConversationId={initialData.recentConversationId}
        initialMessages={initialData.initialMessages}
        activeBatchId={initialData.activeBatch?.id || null}
        birdType={initialData.activeBatch?.birdType || null}
      />
    </div>
  );
}
