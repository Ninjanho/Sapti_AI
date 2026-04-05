import styles from "./MessageBubble.module.css";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  metadata?: {
    intent?: string;
    emotion?: string;
  };
}

/**
 * MessageBubble — individual chat message with role-based styling.
 */
export default function MessageBubble({ role, content, metadata }: MessageBubbleProps) {
  return (
    <div className={`${styles.message} ${role === "user" ? styles.user : styles.assistant}`}>
      {role === "assistant" && (
        <div className={styles.avatar}>
          <div className={styles.avatarOrb} />
        </div>
      )}
      <div className={styles.bubble}>
        <div className={styles.content}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        {metadata?.emotion && metadata.emotion !== "neutral" && (
          <div className={styles.meta}>
            sensed: {metadata.emotion}
          </div>
        )}
      </div>
    </div>
  );
}
