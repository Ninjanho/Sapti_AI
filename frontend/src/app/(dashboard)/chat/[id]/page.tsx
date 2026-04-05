"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/**
 * Specific conversation page — redirects to /chat with the conversation loaded.
 * The main chat page handles conversation loading via activeConvId state.
 */
export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  useEffect(() => {
    // Redirect to main chat page with conversation ID as query param
    router.replace(`/chat?conv=${conversationId}`);
  }, [router, conversationId]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, var(--accent-primary), var(--accent-warm))",
          animation: "orbPulse 2s ease-in-out infinite",
        }}
      />
    </div>
  );
}
