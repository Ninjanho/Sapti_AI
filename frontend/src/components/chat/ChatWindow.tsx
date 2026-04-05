"use client";

import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./ChatWindow.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface ChatWindowProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
}

/**
 * ChatWindow — scrollable message container with auto-scroll on new messages.
 */
export default function ChatWindow({
  messages,
  streamingContent,
  isStreaming,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className={styles.window}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.message} ${msg.role === "user" ? styles.user : styles.assistant
            }`}
        >
          {msg.role === "assistant" && (
            <div className={styles.avatar}>
              <div className={styles.avatarOrb} />
            </div>
          )}
          <div className={styles.bubble}>
            <div className={styles.content}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}

      {isStreaming && (
        <div className={`${styles.message} ${styles.assistant}`}>
          <div className={styles.avatar}>
            <div className={`${styles.avatarOrb} ${styles.thinking}`} />
          </div>
          <div className={styles.bubble}>
            <div className={styles.content}>
              {streamingContent ? (
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
              ) : (
                <TypingDots />
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function TypingDots() {
  return (
    <span className={styles.dots}>
      <span>●</span>
      <span>●</span>
      <span>●</span>
    </span>
  );
}
